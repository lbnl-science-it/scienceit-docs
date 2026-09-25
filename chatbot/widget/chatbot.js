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
  };
  // Keep in sync with MAX_MESSAGES on the Worker.
  var MAX_HISTORY = 20;

  // In-memory conversation: [{role: "user"|"assistant", content: "..."}]
  var history = [];
  var busy = false;

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

    "@media (prefers-color-scheme:dark){",
    ".panel{background:#242526;color:#e4e6eb}",
    ".msgs{background:#18191a}",
    ".msg.assistant{background:#3a3b3c;border-color:#4e4f50}",
    "form{background:#242526;border-color:#3e4042}",
    "textarea{background:#3a3b3c;color:#e4e6eb;border-color:#4e4f50}}",
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

  async function send(text) {
    history.push({ role: "user", content: text });
    addMessage("user", text);
    setBusy(true);

    // Send only the most recent messages, and always start on a user turn.
    var payload = history.slice(-MAX_HISTORY);
    while (payload.length && payload[0].role !== "user") payload.shift();

    var bubble = addMessage("assistant", ""); // shows the bouncing-dots indicator until text arrives
    var reply = "";

    try {
      var res = await fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

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
            if (delta && delta.content) {
              reply += delta.content;
              bubble.innerHTML = renderMarkdown(reply);
              msgs.scrollTop = msgs.scrollHeight;
            }
          } catch (_) { /* ignore keep-alives and partial JSON */ }
        }
      }

      if (!reply) throw new Error("The assistant returned an empty response.");
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      // Drop the failed turn's empty bubble unless partial text arrived.
      if (reply) history.push({ role: "assistant", content: reply });
      else { bubble.remove(); history.pop(); }
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
