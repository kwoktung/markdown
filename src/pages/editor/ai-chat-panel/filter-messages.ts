import type { Message } from "./use-chat";

export function filterMessagesForServer(
  messages: Message[],
): Array<{ role: "user" | "assistant"; content: string }> {
  const indicesToRemove = new Set<number>();

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "assistant" && (msg.wasCancelled || msg.wasEdit)) {
      indicesToRemove.add(i);
      if (i > 0 && messages[i - 1].role === "user") {
        indicesToRemove.add(i - 1);
      }
    }
  }

  return messages
    .filter((_, idx) => !indicesToRemove.has(idx))
    .map((m) => ({ role: m.role, content: m.content }));
}
