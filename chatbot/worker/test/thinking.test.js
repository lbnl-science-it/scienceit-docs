// The widget has to tell a model's scratchpad apart from its answer. Getting it
// wrong is not cosmetic: thought text leaking into the answer would be rendered
// as Markdown and pushed into the conversation history sent back upstream, and
// answer text swallowed by an unterminated tag would never be shown at all.
// These tests pin the split, including the half-arrived shapes that only exist
// mid-stream.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

let split;

beforeAll(() => {
  const src = readFileSync(resolve(process.cwd(), "../widget/chatbot.js"), "utf8");
  new Function(src)();
  split = window.__docsChatSplitThinking;
});

describe("splitThinking", () => {
  it("leaves a reply with no thought output alone", () => {
    expect(split("Run `sbatch job.sh`.")).toEqual({
      think: "",
      answer: "Run `sbatch job.sh`.",
    });
  });

  it("separates a completed thought block from the answer", () => {
    const r = split("<think>They want the queue name.</think>\n\nUse the `debug` partition.");
    expect(r.think).toBe("They want the queue name.");
    expect(r.answer).toBe("Use the `debug` partition.");
  });

  it("treats an unterminated block as thought still streaming", () => {
    const r = split("<think>Checking the docs for the module");
    expect(r.think).toBe("Checking the docs for the module");
    expect(r.answer).toBe("");
  });

  it("parses a tag that was split across chunks once the rest arrives", () => {
    // What the reader sees mid-stream, chunk by chunk: a half-written tag is
    // answer text for one frame, then resolves to thought on the next.
    expect(split("<thi").answer).toBe("<thi");
    expect(split("<think>no").think).toBe("no");
  });

  it("accepts the <thinking> and <thought> spellings", () => {
    expect(split("<thinking>a</thinking>b")).toEqual({ think: "a", answer: "b" });
    expect(split("<thought>a</thought>b")).toEqual({ think: "a", answer: "b" });
  });

  it("does not pair a tag with a different closing tag", () => {
    // </thought> must not close <think>, or the answer would be swallowed.
    const r = split("<think>a</thought>b");
    expect(r.think).toBe("a</thought>b");
    expect(r.answer).toBe("");
  });

  it("keeps text on both sides of a mid-reply block out of the thought", () => {
    const r = split("First.<think>hmm</think>Second.");
    expect(r.think).toBe("hmm");
    expect(r.answer).toBe("First.Second.");
  });

  it("joins several thought blocks", () => {
    expect(split("<think>one</think>x<think>two</think>y").think).toBe("one\n\ntwo");
  });

  it("does not let thought text reach the answer as markup", () => {
    // The thought box renders with textContent, but the answer goes through the
    // Markdown renderer, so a tag hidden in a scratchpad must stay on its side.
    const r = split("<think><img src=x onerror=alert(1)></think>Safe.");
    expect(r.answer).toBe("Safe.");
    expect(window.__docsChatRenderMarkdown(r.answer)).not.toContain("<img");
  });
});
