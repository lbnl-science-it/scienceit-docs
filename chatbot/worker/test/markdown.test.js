// The widget's Markdown renderer is safe because it escapes HTML *before* any
// formatting rule runs, and because its URL pattern is an allowlist of http(s)
// and site-relative links rather than a denylist of javascript:. Both are
// invariants held by convention, not by structure — a later edit adding tables,
// images or raw-HTML passthrough could quietly break them. These tests pin the
// behaviour so that regression fails loudly.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

let render;

beforeAll(() => {
  // jsdom's import.meta.url isn't a file: URL, so resolve from the project root.
  const src = readFileSync(resolve(process.cwd(), "../widget/chatbot.js"), "utf8");
  // jsdom does not execute injected <script> text by default, so run the IIFE
  // directly. It mounts itself into the jsdom DOM exactly as it would in a page
  // (document.currentScript is null here, which the widget already tolerates).
  new Function(src)();
  render = window.__docsChatRenderMarkdown;
});

const INJECTION = [
  '[click](https://example.com" onmouseover="alert(1))',
  "[x](JAVASCRIPT:alert(1))",
  "[x](jAvAsCrIpT:alert(1))",
  "[x](java\tscript:alert(1))",
  "[x](&#106;avascript:alert(1))",
  "[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)",
  "[x](vbscript:msgbox(1))",
  "<img src=x onerror=alert(1)>",
  "<script>alert(1)</script>",
  "<svg/onload=alert(1)>",
  "<iframe src=javascript:alert(1)>",
  "</a><script>alert(1)</script>",
  "**bold** <img src=x onerror=alert(1)>",
  "`<script>alert(1)</script>`",
  "```\n<script>alert(1)</script>\n```",
  "# <img src=x onerror=alert(1)>",
  "- <img src=x onerror=alert(1)>",
  "https://x.com\" onmouseover=\"alert(1)",
];

describe("renderMarkdown — injection resistance", () => {
  it("exposes the renderer", () => {
    expect(typeof render).toBe("function");
  });

  // Assertions are made against the parsed DOM, not the HTML string. An escaped
  // payload like `&lt;img src=x onerror=alert(1)&gt;` still *contains* the text
  // "onerror=", so a string match would flag inert output as a vulnerability.
  // What matters is what the browser actually builds.
  for (const payload of INJECTION) {
    it(`neutralises: ${JSON.stringify(payload).slice(0, 56)}`, () => {
      const host = document.createElement("div");
      host.innerHTML = render(payload);

      for (const node of host.querySelectorAll("*")) {
        for (const attr of node.attributes) {
          expect(attr.name.toLowerCase(), "event-handler attribute").not.toMatch(/^on/);
        }
        expect(["SCRIPT", "IFRAME", "SVG", "IMG", "OBJECT", "EMBED"]).not.toContain(node.tagName);
      }

      // Only http(s) and site-relative hrefs survive the renderer's allowlist.
      for (const a of host.querySelectorAll("a")) {
        expect(a.getAttribute("href"), "href scheme").toMatch(/^(https?:\/\/|\/)/);
      }
    });
  }
});

describe("renderMarkdown — legitimate formatting still works", () => {
  it("linkifies markdown links", () => {
    const html = render("See [the docs](https://scienceit-docs.lbl.gov/hpc/).");
    expect(html).toContain('href="https://scienceit-docs.lbl.gov/hpc/"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain(">the docs</a>");
  });

  it("linkifies bare URLs and site-relative paths", () => {
    expect(render("https://example.com/a")).toContain('href="https://example.com/a"');
    expect(render("[local](/hpc/running/)")).toContain('href="/hpc/running/"');
  });

  it("renders fenced code without escaping artefacts", () => {
    const html = render("```bash\nsbatch -A acct job.sh\n```");
    expect(html).toContain("<pre><code>sbatch -A acct job.sh</code></pre>");
  });

  it("renders an unterminated fence, as happens mid-stream", () => {
    const html = render("Run this:\n```bash\nsrun --pty bash");
    expect(html).toContain("<pre><code>");
    expect(html).toContain("srun --pty bash");
  });

  it("renders headings, lists, bold and italic", () => {
    expect(render("# Title")).toMatch(/<h3>Title<\/h3>/);
    expect(render("- one\n- two")).toContain("<ul><li>one</li><li>two</li></ul>");
    expect(render("1. one")).toContain("<ol><li>one</li></ol>");
    expect(render("**b** and *i*")).toContain("<strong>b</strong>");
    expect(render("**b** and *i*")).toContain("<em>i</em>");
  });

  it("escapes ampersands and angle brackets in plain prose", () => {
    const html = render("Use a < b && c > d");
    expect(html).toContain("&lt;");
    expect(html).toContain("&gt;");
    expect(html).toContain("&amp;");
  });
});
