import { describe, expect, it } from "vitest";
import { parseFaq } from "../scripts/lib/content-import.mjs";

describe("master content FAQ parsing", () => {
  it("stops the final answer before the page body heading", () => {
    const block = `
**FAQ:**
- Q: Is this a question?
  A: This answer should stay short.

# Page heading

The body must never become part of structured FAQ data.
`;

    expect(parseFaq(block)).toEqual([
      { question: "Is this a question?", answer: "This answer should stay short." },
    ]);
  });
});
