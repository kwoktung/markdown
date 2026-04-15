import { describe, it, expect } from "vitest";
import { filterMessagesForServer } from "./filter-messages";
import type { Message } from "./use-chat";

function msg(
  role: "user" | "assistant",
  content: string,
  overrides: Partial<Message> = {},
): Message {
  return {
    id: Math.random().toString(),
    role,
    content,
    timestamp: new Date(),
    ...overrides,
  };
}

describe("filterMessagesForServer", () => {
  it("returns empty array for empty input", () => {
    expect(filterMessagesForServer([])).toEqual([]);
  });

  it("strips client-only fields, keeps role and content", () => {
    const messages = [
      msg("assistant", "Hello!", {
        isStreaming: false,
        stepAction: "thinking",
      }),
      msg("user", "Hi"),
    ];
    expect(filterMessagesForServer(messages)).toEqual([
      { role: "assistant", content: "Hello!" },
      { role: "user", content: "Hi" },
    ]);
  });

  it("removes a cancelled assistant message and its preceding user message", () => {
    const messages = [
      msg("assistant", "Welcome"),
      msg("user", "My question"),
      msg("assistant", "Generation stopped.", { wasCancelled: true }),
    ];
    expect(filterMessagesForServer(messages)).toEqual([
      { role: "assistant", content: "Welcome" },
    ]);
  });

  it("removes a wasEdit assistant message and its preceding user message", () => {
    const messages = [
      msg("assistant", "Welcome"),
      msg("user", "Edit my doc"),
      msg("assistant", "I edited the document.", { wasEdit: true }),
    ];
    expect(filterMessagesForServer(messages)).toEqual([
      { role: "assistant", content: "Welcome" },
    ]);
  });

  it("removes all cancelled/edited pairs, not just the last one", () => {
    const messages = [
      msg("assistant", "Welcome"),
      msg("user", "First question"),
      msg("assistant", "Generation stopped.", { wasCancelled: true }),
      msg("user", "Second question"),
      msg("assistant", "Edited.", { wasEdit: true }),
      msg("user", "Third question"),
      msg("assistant", "Normal reply"),
    ];
    expect(filterMessagesForServer(messages)).toEqual([
      { role: "assistant", content: "Welcome" },
      { role: "user", content: "Third question" },
      { role: "assistant", content: "Normal reply" },
    ]);
  });

  it("removes only the cancelled assistant when there is no preceding user message", () => {
    const messages = [
      msg("assistant", "Generation stopped.", { wasCancelled: true }),
      msg("user", "Hello"),
    ];
    expect(filterMessagesForServer(messages)).toEqual([
      { role: "user", content: "Hello" },
    ]);
  });

  it("keeps a normal assistant reply that follows a cancelled pair", () => {
    const messages = [
      msg("user", "question"),
      msg("assistant", "Generation stopped.", { wasCancelled: true }),
      msg("user", "retry"),
      msg("assistant", "Good answer"),
    ];
    expect(filterMessagesForServer(messages)).toEqual([
      { role: "user", content: "retry" },
      { role: "assistant", content: "Good answer" },
    ]);
  });

  it("handles a list with no cancelled or edited messages unchanged", () => {
    const messages = [
      msg("assistant", "Welcome"),
      msg("user", "Hello"),
      msg("assistant", "Hi there"),
    ];
    expect(filterMessagesForServer(messages)).toEqual([
      { role: "assistant", content: "Welcome" },
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ]);
  });
});
