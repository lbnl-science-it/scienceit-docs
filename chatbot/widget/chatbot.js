/**
 * Docs chat widget: a self-contained floating chat button + panel.
 * Vanilla JS, no dependencies, no build step. Embed with one tag:
 *
 *   <script src="chatbot.js"
 *           data-endpoint="https://your-worker.workers.dev/chat"></script>
 *
 * Optional attributes on the script tag:
 *   data-title     Panel title            (default "Docs Assistant")
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

  // ------------------------------------------------------------------ styles
  var CSS = [
    ":host{all:initial}",
    "*{box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}",
    ".fab{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;border:0;",
    "background:" + cfg.color + ";color:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3);",
    "display:flex;align-items:center;justify-content:center;z-index:2147483646}",
    ".fab:hover{filter:brightness(1.1)}",
    ".fab svg{width:26px;height:26px;fill:#fff}",
    ".panel{position:fixed;right:20px;bottom:88px;width:380px;max-width:calc(100vw - 24px);",
    "height:560px;max-height:calc(100vh - 110px);background:#fff;color:#1c1e21;border-radius:12px;",
    "box-shadow:0 8px 32px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden;",
    "z-index:2147483647}",
    ".panel.open{display:flex}",
    ".head{background:" + cfg.color + ";color:#fff;padding:12px 16px;font-weight:600;",
    "display:flex;justify-content:space-between;align-items:center}",
    ".head button{background:none;border:0;color:#fff;font-size:22px;line-height:1;cursor:pointer}",
    ".msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;",
    "font-size:14px;line-height:1.45}",
    ".msg{max-width:88%;padding:8px 12px;border-radius:12px;overflow-wrap:anywhere}",
    ".msg.user{align-self:flex-end;background:" + cfg.color + ";color:#fff;white-space:pre-wrap}",
    ".msg.assistant{align-self:flex-start;background:#f0f2f5}",
    ".msg.error{align-self:flex-start;background:#fdecea;color:#8a1c12}",
    ".msg p{margin:0 0 8px}.msg p:last-child{margin:0}",
    ".msg h3,.msg h4,.msg h5,.msg h6{margin:8px 0 4px;font-size:15px}",
    ".msg ul,.msg ol{margin:0 0 8px;padding-left:20px}",
    ".msg a{color:" + cfg.color + "}",
    ".msg code{background:rgba(0,0,0,.08);padding:1px 4px;border-radius:4px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px}",
    ".msg pre{background:#1e1e1e;color:#eee;padding:8px 10px;border-radius:6px;overflow-x:auto;margin:0 0 8px}",
    ".msg pre code{background:none;padding:0;color:inherit}",
    ".typing::after{content:'\\25CF';animation:blink 1s infinite;margin-left:2px}",
    "@keyframes blink{50%{opacity:.2}}",
    "form{display:flex;gap:8px;padding:10px;border-top:1px solid #e4e6eb}",
    "textarea{flex:1;resize:none;border:1px solid #ccd0d5;border-radius:8px;padding:8px;font-size:14px;",
    "max-height:96px;outline:none}",
    "textarea:focus{border-color:" + cfg.color + "}",
    "form button{background:" + cfg.color + ";color:#fff;border:0;border-radius:8px;padding:0 14px;",
    "font-size:14px;cursor:pointer}",
    "form button:disabled{opacity:.5;cursor:default}",
    "@media (prefers-color-scheme:dark){",
    ".panel{background:#242526;color:#e4e6eb}.msg.assistant{background:#3a3b3c}",
    "textarea{background:#3a3b3c;color:#e4e6eb;border-color:#4e4f50}form{border-color:#3e4042}}",
  ].join("");

  // ------------------------------------------------------------------ DOM
  var host = document.createElement("div");
  var root = host.attachShadow({ mode: "open" });
  root.innerHTML =
    "<style>" + CSS + "</style>" +
    '<button class="fab" aria-label="Open chat">' +
    '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg></button>' +
    '<div class="panel" role="dialog" aria-label="' + escapeHtml(cfg.title) + '">' +
    '<div class="head"><span></span><button aria-label="Close chat">&times;</button></div>' +
    '<div class="msgs" aria-live="polite"></div>' +
    '<form><textarea rows="1" placeholder="Ask a question…" aria-label="Message"></textarea>' +
    "<button>Send</button></form></div>";

  var fab = root.querySelector(".fab");
  var panel = root.querySelector(".panel");
  var msgs = root.querySelector(".msgs");
  var form = root.querySelector("form");
  var input = root.querySelector("textarea");
  var sendBtn = form.querySelector("button");
  root.querySelector(".head span").textContent = cfg.title;

  function addMessage(kind, text) {
    var el = document.createElement("div");
    el.className = "msg " + kind;
    if (kind === "assistant") el.innerHTML = renderMarkdown(text);
    else el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function togglePanel(open) {
    panel.classList.toggle("open", open);
    if (open) input.focus();
  }
  fab.addEventListener("click", function () { togglePanel(!panel.classList.contains("open")); });
  root.querySelector(".head button").addEventListener("click", function () { togglePanel(false); });

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

    var bubble = addMessage("assistant", "");
    bubble.classList.add("typing");
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
      bubble.classList.remove("typing");
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
