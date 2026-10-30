/**
 * Docs chat widget: a self-contained floating chat button + panel.
 * Vanilla JS, no dependencies, no build step. Embed with one tag:
 *
 *   <script src="chatbot.js"
 *           data-endpoint="https://your-worker.workers.dev/chat"></script>
 *
 * Optional attributes on the script tag:
 *   data-title     Panel title            (default "Docs Assistant")
 *   data-subtitle  Small line under it    (default below)
 *   data-greeting  First assistant message (default below)
 *   data-color     Accent color            (default "#005f9e")
 *
 * All styles live inside a Shadow DOM, so they can't clash with the host page.
 * Conversation history is kept in memory only; a page reload starts fresh.
 */
(function () {
  "use strict";

  // document.currentScript is only set while the script first runs, so grab it now.
  var script = document.currentScript;
  var cfg = {
    endpoint: (script && script.dataset.endpoint) || "http://localhost:8787/chat",
    title: (script && script.dataset.title) || "Docs Assistant",
    subtitle: (script && script.dataset.subtitle) || "Answers sourced from the docs",
    greeting:
      (script && script.dataset.greeting) ||
      "Hi! Ask me anything about the documentation.",
    color: (script && script.dataset.color) || "#005f9e",
    sitekey: (script && script.dataset.turnstileSitekey) || "",
  };
  // Keep in sync with MAX_MESSAGES on the Worker.
  var MAX_HISTORY = 20;

  // In-memory conversation: [{role: "user"|"assistant", content: "..."}]
  var history = [];
  var busy = false;

  // ------------------------------------------------------------------ turnstile
  // Proof-of-humanity, so the chat endpoint isn't free inference for bots.
  // Only the first message solves a challenge: the Worker answers with a signed
  // session token that later messages reuse, so there is no per-turn check.
  var sessionToken = null;
  var tsBox = null;
  var tsId = null;
  var tsPending = null;
  var tsScript = null;

  function tsSettle(ok, value) {
    if (!tsPending) return;
    var p = tsPending;
    tsPending = null;
    if (ok) p.resolve(value);
    else p.reject(new Error(value));
  }

  function loadTurnstile() {
    if (tsScript) return tsScript;
    tsScript = new Promise(function (resolve, reject) {
      if (window.turnstile) return resolve();
      var s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("Could not load the verification check.")); };
      document.head.appendChild(s);
    });
    return tsScript;
  }

  // Resolves with a single-use Turnstile token. The widget renders once and is
  // reset for each later challenge; `interaction-only` keeps it invisible unless
  // Cloudflare decides this reader has to click something. It lives outside the
  // Shadow DOM because Turnstile renders an iframe and expects a normal parent.
  function getTurnstileToken() {
    return new Promise(function (resolve, reject) {
      if (!cfg.sitekey) {
        reject(new Error("Chat is not configured for verification."));
        return;
      }
      tsPending = { resolve: resolve, reject: reject };
      loadTurnstile().then(
        function () {
          if (tsId !== null) {
            window.turnstile.reset(tsId);
            return;
          }
          tsBox = document.createElement("div");
          tsBox.style.cssText =
            "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647";
          document.body.appendChild(tsBox);
          tsId = window.turnstile.render(tsBox, {
            sitekey: cfg.sitekey,
            appearance: "interaction-only",
            callback: function (token) { tsSettle(true, token); },
            "error-callback": function () { tsSettle(false, "Verification failed. Please try again."); },
            "timeout-callback": function () { tsSettle(false, "Verification timed out. Please try again."); },
          });
        },
        function (err) { tsSettle(false, err.message); }
      );
    });
  }

  // ------------------------------------------------------------------ markdown
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Inline formatting. Input is ALREADY HTML-escaped, so this can't inject tags.
  function inline(s) {
    // Links: [text](url) or bare http(s) URLs. Only http(s) and site-relative
    // URLs are linked; anything else (e.g. javascript:) stays plain text.
    s = s.replace(
      /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]*)\)|(https?:\/\/[^\s<]*[^\s<.,;:!?)])/g,
      function (m, text, href, bare) {
        var url = href || bare;
        return (
          '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' +
          (text || url) + "</a>"
        );
      }
    );
    s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
    return s;
  }

  // Small, safe markdown renderer: code blocks, inline code, headings, lists,
  // bold/italic, links, paragraphs. (No tables or images.)
  function renderMarkdown(src) {
    var stash = []; // code fragments are swapped out so other rules skip them
    function hold(html) {
      stash.push(html);
      return "\u0000" + (stash.length - 1) + "\u0000";
    }

    var t = escapeHtml(src.replace(/\u0000/g, ""));
    // Fenced code blocks. The second form handles a block still streaming in.
    t = t.replace(/```[\w-]*\n?([\s\S]*?)```/g, function (m, c) {
      return hold("<pre><code>" + c.replace(/\n$/, "") + "</code></pre>");
    });
    t = t.replace(/```[\w-]*\n?([\s\S]*)$/, function (m, c) {
      return hold("<pre><code>" + c + "</code></pre>");
    });
    t = t.replace(/`([^`\n]+)`/g, function (m, c) {
      return hold("<code>" + c + "</code>");
    });

    var out = [];
    var list = null; // "ul" | "ol" while inside a list
    var para = [];
    function flushPara() {
      if (para.length) out.push("<p>" + inline(para.join("<br>")) + "</p>");
      para = [];
    }
    function closeList() {
      if (list) out.push("</" + list + ">");
      list = null;
    }

    t.split("\n").forEach(function (line) {
      var h = /^(#{1,4})\s+(.*)$/.exec(line);
      var li = /^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/.exec(line);
      var block = /^\u0000(\d+)\u0000$/.exec(line.trim());
      if (block && stash[+block[1]].indexOf("<pre>") === 0) {
        // A fenced code block on its own line: emit it outside any <p>.
        flushPara(); closeList();
        out.push(line.trim());
      } else if (h) {
        flushPara(); closeList();
        var n = Math.min(h[1].length + 2, 6); // #→h3 so headings stay small
        out.push("<h" + n + ">" + inline(h[2]) + "</h" + n + ">");
      } else if (li) {
        flushPara();
        var kind = li[1] ? "ul" : "ol";
        if (list !== kind) { closeList(); out.push("<" + kind + ">"); list = kind; }
        out.push("<li>" + inline(li[3]) + "</li>");
      } else if (line.trim() === "") {
        flushPara(); closeList();
      } else {
        closeList();
        para.push(line);
      }
    });
    flushPara(); closeList();

    return out.join("").replace(/\u0000(\d+)\u0000/g, function (m, i) {
      return stash[+i];
    });
  }

  // Test seam. renderMarkdown is the boundary that keeps assistant output from
  // becoming markup, so test/markdown.test.js pins its escaping. It lives inside
  // this IIFE and nothing else here reads the global back; it exists only so the
  // tests can reach the function.
  window.__docsChatRenderMarkdown = renderMarkdown;

  // ------------------------------------------------------------------ thinking
  // Reasoning models emit a scratchpad as well as an answer, and which stream it
  // arrives on depends on the model: some send a separate SSE field
  // (`delta.reasoning_content`), while the Gemma-family model behind
  // cborg-mini-fast wraps it inline in the content as <think>...</think>. This
  // splits the content stream into its two parts, so the thought process can go
  // in its own box and stay out of the answer -- and out of the history sent
  // back upstream, where a scratchpad is noise rather than context.
  //
  // Runs over the whole accumulated string on every chunk rather than
  // incrementally, so a tag split across two chunks ("<thi" + "nk>") still
  // parses once the rest arrives. Replies are capped at ~1k tokens, so
  // re-scanning costs nothing.
  var THINK_OPEN = /<(think|thinking|thought)>/i;

  function splitThinking(raw) {
    var think = [];
    var answer = "";
    var rest = raw;
    var open;
    while ((open = THINK_OPEN.exec(rest))) {
      answer += rest.slice(0, open.index);
      var after = rest.slice(open.index + open[0].length);
      // open[1] comes from the alternation above, so it is one of three literals.
      var close = new RegExp("</" + open[1] + ">", "i").exec(after);
      if (!close) {
        think.push(after); // no closing tag yet: still mid-thought
        rest = "";
        break;
      }
      think.push(after.slice(0, close.index));
      rest = after.slice(close.index + close[0].length);
    }
    answer += rest;
    // A thought block is followed by the blank lines that separated it from the
    // answer; dropping them keeps the bubble from opening with a gap.
    return { think: think.join("\n\n").trim(), answer: answer.replace(/^\s+/, "") };
  }

  // Test seam, like renderMarkdown above: test/thinking.test.js pins the split.
  window.__docsChatSplitThinking = splitThinking;

  // ------------------------------------------------------------------ icons
  // Small inline line-icons (stroke-based, so one `color` sets them all).
  var ICON_CHAT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-4.24 7.31 ' +
    "8.5 8.5 0 0 1-9.32-.98L3 21l2.09-4.53a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 1 1 16.81-1.17z\"/></svg>";
  var ICON_CLOSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/>' +
    '<line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var ICON_SEND =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.4 21.6l19.2-9.1c.8-.4.8-1.6 0-2l-19.2-9.1c-.8-.4-1.7.4-1.4 1.2l2.6 7.5 11 1.4-11 1.4-2.6 7.5c-.3.8.6 1.6 1.4 1.2z"/></svg>';
  var DOTS = '<span class="dots"><span></span><span></span><span></span></span>';
  var CARET =
    '<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';

  // ------------------------------------------------------------------ styles
  var CSS = [
    ":host{all:initial;--accent:" + cfg.color + "}",
    "*{box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}",
    "button{font:inherit}",

    // Floating action button.
    ".fab{position:fixed;right:20px;bottom:20px;width:58px;height:58px;border-radius:50%;border:0;",
    "background:var(--accent);color:#fff;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.25);",
    "display:flex;align-items:center;justify-content:center;z-index:2147483646;",
    "transition:transform .18s ease,box-shadow .18s ease,opacity .18s ease}",
    ".fab:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(0,0,0,.3)}",
    ".fab:active{transform:translateY(0) scale(.94)}",
    ".fab.hide{opacity:0;transform:scale(.8);pointer-events:none}",
    ".fab svg{width:25px;height:25px}",

    // Panel: kept in the layout at all times and cross-faded/scaled, so both
    // opening and closing can animate (display:none can't transition).
    ".panel{position:fixed;right:20px;bottom:90px;width:380px;max-width:calc(100vw - 24px);",
    "height:560px;max-height:calc(100vh - 112px);background:#fff;color:#1c1e21;border-radius:16px;",
    "box-shadow:0 12px 40px rgba(0,0,0,.24);display:flex;flex-direction:column;overflow:hidden;",
    "z-index:2147483647;opacity:0;visibility:hidden;transform:translateY(10px) scale(.97);",
    "transform-origin:bottom right;",
    "transition:opacity .16s ease,transform .16s ease,visibility .16s}",
    ".panel.open{opacity:1;visibility:visible;transform:translateY(0) scale(1)}",

    // Header: avatar + title/subtitle + close button.
    ".head{background:var(--accent);color:#fff;padding:14px 12px 14px 16px;",
    "display:flex;align-items:center;gap:10px;flex-shrink:0}",
    ".head-text{flex:1;min-width:0}",
    ".head .avatar{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.18);",
    "display:flex;align-items:center;justify-content:center;flex-shrink:0}",
    ".head .avatar svg{width:18px;height:18px}",
    ".title{font-weight:600;font-size:14.5px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".subtitle{font-size:12px;line-height:1.3;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".close{background:none;border:0;color:#fff;opacity:.85;cursor:pointer;padding:6px;",
    "border-radius:50%;display:flex;flex-shrink:0;transition:background .15s,opacity .15s}",
    ".close:hover{opacity:1;background:rgba(255,255,255,.15)}",
    ".close svg{width:16px;height:16px}",

    // Message list.
    ".msgs{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:12px;",
    "font-size:14px;line-height:1.5;background:#fafafa}",
    ".msgs::-webkit-scrollbar{width:8px}",
    ".msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:8px}",
    ".msgs::-webkit-scrollbar-track{background:transparent}",
    ".msg{max-width:86%;padding:9px 13px;border-radius:16px;overflow-wrap:anywhere;",
    "animation:msg-in .15s ease-out}",
    "@keyframes msg-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}",
    ".msg.user{align-self:flex-end;background:var(--accent);color:#fff;white-space:pre-wrap;",
    "border-bottom-right-radius:4px}",
    ".msg.assistant{align-self:flex-start;background:#fff;border:1px solid #ecedf0;",
    "box-shadow:0 1px 2px rgba(0,0,0,.04);border-bottom-left-radius:4px}",
    ".msg.error{align-self:flex-start;background:#fdecea;color:#8a1c12;border-bottom-left-radius:4px}",
    ".msg p{margin:0 0 8px}.msg p:last-child{margin:0}",
    ".msg h3,.msg h4,.msg h5,.msg h6{margin:8px 0 4px;font-size:15px}",
    ".msg ul,.msg ol{margin:0 0 8px;padding-left:20px}",
    ".msg a{color:var(--accent);font-weight:500;text-decoration:none}",
    ".msg a:hover{text-decoration:underline}",
    ".msg code{background:rgba(0,0,0,.07);padding:1px 5px;border-radius:4px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px}",
    ".msg pre{background:#1a1b26;color:#e4e6eb;padding:10px 12px;border-radius:10px;overflow-x:auto;margin:0 0 8px}",
    ".msg pre code{background:none;padding:0;color:inherit}",

    // Typing indicator: three bouncing dots shown until the first token arrives.
    ".dots{display:inline-flex;gap:4px;padding:3px 2px}",
    ".dots span{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.35;",
    "animation:dot-bounce 1.2s infinite ease-in-out}",
    ".dots span:nth-child(2){animation-delay:.15s}.dots span:nth-child(3){animation-delay:.3s}",
    "@keyframes dot-bounce{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}}",

    // Composer.
    "form{display:flex;align-items:flex-end;gap:8px;padding:10px;border-top:1px solid #ecedf0;",
    "background:#fff;flex-shrink:0}",
    "textarea{flex:1;resize:none;border:1px solid #dcdfe3;border-radius:20px;padding:9px 14px;",
    "font-size:14px;line-height:1.35;max-height:96px;outline:none;transition:border-color .15s,box-shadow .15s}",
    "textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}",
    "form button{background:var(--accent);color:#fff;border:0;border-radius:50%;width:38px;height:38px;",
    "flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;",
    "transition:transform .15s,filter .15s}",
    "form button svg{width:17px;height:17px}",
    "form button:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.08)}",
    "form button:disabled{opacity:.4;cursor:default}",
    "button:focus-visible,textarea:focus-visible{outline:2px solid var(--accent);outline-offset:2px}",

    // Generating indicator: a labelled row that sits under the bubble from the
    // moment the request goes out until the last token lands, so the reader is
    // never left watching a blank bubble wondering whether anything is coming.
    ".status{display:flex;align-items:center;gap:7px;font-size:12.5px;color:#65676b}",
    ".status .dots{color:var(--accent)}",

    // Thought process: a collapsible box above the answer, expanded by default
    // so the reasoning is visible without a click. A reader who collapses it is
    // not overridden: their choice sticks for the rest of that reply.
    ".think{margin:0 0 8px;border:1px solid #e7e8eb;border-radius:10px;background:#f6f7f9}",
    ".think[hidden]{display:none}",
    ".think>summary{display:flex;align-items:center;gap:6px;padding:6px 10px;cursor:pointer;",
    "list-style:none;font-size:12px;font-weight:500;color:#65676b;user-select:none}",
    ".think>summary::-webkit-details-marker{display:none}",
    ".think>summary:hover{color:#1c1e21}",
    ".think .caret{width:12px;height:12px;flex-shrink:0;transition:transform .15s ease}",
    ".think[open] .caret{transform:rotate(90deg)}",
    ".think-body{max-height:150px;overflow-y:auto;padding:2px 10px 8px;font-size:12.5px;",
    "line-height:1.5;color:#65676b;white-space:pre-wrap;overflow-wrap:anywhere}",

    "@media (prefers-color-scheme:dark){",
    ".panel{background:#242526;color:#e4e6eb}",
    ".msgs{background:#18191a}",
    ".msg.assistant{background:#3a3b3c;border-color:#4e4f50}",
    "form{background:#242526;border-color:#3e4042}",
    "textarea{background:#3a3b3c;color:#e4e6eb;border-color:#4e4f50}",
    ".think{background:#303132;border-color:#4e4f50}",
    ".status,.think>summary,.think-body{color:#b0b3b8}",
    ".think>summary:hover{color:#e4e6eb}}",
  ].join("");

  // ------------------------------------------------------------------ DOM
  var host = document.createElement("div");
  var root = host.attachShadow({ mode: "open" });
  root.innerHTML =
    "<style>" + CSS + "</style>" +
    '<button class="fab" aria-label="Open chat">' + ICON_CHAT + "</button>" +
    '<div class="panel" role="dialog" aria-label="' + escapeHtml(cfg.title) + '">' +
    '<div class="head"><span class="avatar">' + ICON_CHAT + '</span>' +
    '<div class="head-text"><div class="title"></div><div class="subtitle"></div></div>' +
    '<button class="close" aria-label="Close chat">' + ICON_CLOSE + "</button></div>" +
    '<div class="msgs" aria-live="polite"></div>' +
    '<form><textarea rows="1" placeholder="Ask a question…" aria-label="Message"></textarea>' +
    '<button type="submit" aria-label="Send">' + ICON_SEND + "</button></form></div>";

  var fab = root.querySelector(".fab");
  var panel = root.querySelector(".panel");
  var msgs = root.querySelector(".msgs");
  var form = root.querySelector("form");
  var input = root.querySelector("textarea");
  var sendBtn = form.querySelector("button");
  root.querySelector(".title").textContent = cfg.title;
  root.querySelector(".subtitle").textContent = cfg.subtitle;

  function addMessage(kind, text) {
    var el = document.createElement("div");
    el.className = "msg " + kind;
    if (kind === "assistant") el.innerHTML = text ? renderMarkdown(text) : DOTS;
    else el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  // A streaming assistant bubble: a thought box, the answer, and a status row
  // saying what the model is doing. Returns the handles send() drives it with.
  function addStream() {
    var el = document.createElement("div");
    el.className = "msg assistant";
    el.innerHTML =
      '<details class="think" hidden><summary>' + CARET +
      '<span class="think-label">Thinking\u2026</span></summary>' +
      // aria-hidden: .msgs is a live region, and announcing a whole scratchpad
      // token by token would bury the answer under it. The box stays reachable
      // by eye and by keyboard; only the running commentary is kept out of the
      // announcement queue.
      '<div class="think-body" aria-hidden="true"></div></details>' +
      '<div class="answer"></div>' +
      '<div class="status">' + DOTS +
      '<span class="status-text">Thinking\u2026</span></div>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;

    var box = el.querySelector(".think");
    var label = el.querySelector(".think-label");
    var body = el.querySelector(".think-body");
    var answerEl = el.querySelector(".answer");
    var status = el.querySelector(".status");
    var statusText = el.querySelector(".status-text");
    var started = Date.now();
    var answered = false;
    var touched = false; // the reader opened or closed the box by hand
    var ours = 0; // toggles this code caused, still to be seen by the listener

    // <details> fires `toggle` for a programmatic change just as it does for a
    // click, so the listener has to tell the two apart: the box's own auto-open
    // would otherwise register as the reader's choice and latch `touched` on the
    // first chunk, so a reader who then collapsed the box would have it sprung
    // open again by the next token. The event is queued rather than dispatched
    // synchronously, so this counts outstanding toggles rather than using a flag.
    box.addEventListener("toggle", function () {
      if (ours > 0) ours--;
      else touched = true;
    });
    function setOpen(open) {
      if (box.open === open) return;
      ours++;
      box.open = open;
    }

    return {
      el: el,
      // Re-render from the accumulated strings; returns the answer text so far.
      render: function (content, fieldThought) {
        var split = splitThinking(content);
        var think =
          fieldThought + (fieldThought && split.think ? "\n\n" : "") + split.think;
        if (think) {
          box.hidden = false;
          // textContent, not renderMarkdown: half-formed reasoning is full of
          // stray syntax, and it must never become markup.
          body.textContent = think;
          // Guarded by `touched` alone, so this re-asserts the default on
          // every chunk but never fights a reader who collapsed the box.
          if (!touched) setOpen(true);
          body.scrollTop = body.scrollHeight; // follow the thought as it streams
        }
        if (split.answer) {
          if (!answered) {
            answered = true;
            if (think) {
              var secs = Math.max(1, Math.round((Date.now() - started) / 1000));
              label.textContent = "Thought for " + secs + "s";
            }
            statusText.textContent = "Writing the answer\u2026";
          }
          answerEl.innerHTML = renderMarkdown(split.answer);
        }
        return split.answer;
      },
      // The turn is over, one way or another: drop the status row.
      finish: function () { status.remove(); },
    };
  }

  function togglePanel(open) {
    panel.classList.toggle("open", open);
    fab.classList.toggle("hide", open);
    if (open) input.focus();
  }
  fab.addEventListener("click", function () { togglePanel(!panel.classList.contains("open")); });
  root.querySelector(".close").addEventListener("click", function () { togglePanel(false); });

  // Enter sends; Shift+Enter inserts a newline.
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  input.addEventListener("input", function () {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 96) + "px";
  });

  // ------------------------------------------------------------------ chat
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    input.style.height = "auto";
    send(text);
  });

  function setBusy(b) {
    busy = b;
    sendBtn.disabled = b;
  }

  function postChat(payload, headers) {
    return fetch(cfg.endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ messages: payload }),
    });
  }

  async function send(text) {
    history.push({ role: "user", content: text });
    addMessage("user", text);
    setBusy(true);

    // Send only the most recent messages, and always start on a user turn.
    var payload = history.slice(-MAX_HISTORY);
    while (payload.length && payload[0].role !== "user") payload.shift();

    var stream = addStream(); // dots + "Thinking..." until the first tokens land
    var rawContent = ""; // the content stream, thought tags and all
    var rawThought = ""; // thought text that arrived in its own SSE field
    var reply = ""; // the answer alone, which is what history keeps

    try {
      var headers = { "Content-Type": "application/json" };
      if (sessionToken) headers["X-Session-Token"] = sessionToken;
      else headers["X-Turnstile-Token"] = await getTurnstileToken();

      var res = await postChat(payload, headers);

      // 401 means the session lapsed or was rejected: re-verify once and retry.
      if (res.status === 401) {
        sessionToken = null;
        res = await postChat(payload, {
          "Content-Type": "application/json",
          "X-Turnstile-Token": await getTurnstileToken(),
        });
      }

      var refreshed = res.headers.get("X-Session-Token");
      if (refreshed) sessionToken = refreshed;

      if (!res.ok) {
        // The Worker returns {error:{message}} for failures.
        var msg = "Something went wrong (HTTP " + res.status + ").";
        try { msg = (await res.json()).error.message || msg; } catch (_) {}
        throw new Error(msg);
      }

      // Read the Server-Sent Events stream. Each event is a line
      // `data: {json}`; the text token is at choices[0].delta.content.
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = "";
      var done = false;
      while (!done) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buf += decoder.decode(chunk.value, { stream: true });
        var lines = buf.split("\n");
        buf = lines.pop(); // last piece may be an incomplete line; keep it
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line.indexOf("data:") !== 0) continue;
          var data = line.slice(5).trim();
          if (data === "[DONE]") { done = true; break; }
          try {
            var delta = JSON.parse(data).choices[0].delta;
            if (!delta) continue;
            // Thought output arrives in its own field on some models and inline
            // in the content on others; splitThinking handles the inline form,
            // so each is accumulated separately and merged at render time.
            var thought = delta.reasoning_content || delta.reasoning;
            if (thought) rawThought += thought;
            if (delta.content) rawContent += delta.content;
            if (thought || delta.content) {
              reply = stream.render(rawContent, rawThought);
              msgs.scrollTop = msgs.scrollHeight;
            }
          } catch (_) { /* ignore keep-alives and partial JSON */ }
        }
      }

      if (!reply) throw new Error("The assistant returned an empty response.");
      stream.finish();
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      // Drop the failed turn's empty bubble unless partial text arrived.
      if (reply) { stream.finish(); history.push({ role: "assistant", content: reply }); }
      else { stream.el.remove(); history.pop(); }
      addMessage("error", err.message || "Network error. Please try again.");
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  // ------------------------------------------------------------------ mount
  addMessage("assistant", cfg.greeting);
  function mount() { document.body.appendChild(host); }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
