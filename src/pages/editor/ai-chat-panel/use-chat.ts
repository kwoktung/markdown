import { useState, useRef, useEffect } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  wasEdit?: boolean;
  stepAction?: string;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 Hi! I'm your AI assistant. I can help you:\n\n• Answer questions about your document\n• Suggest improvements and ideas\n• Edit and rewrite content (use Agent mode)\n\nWhat would you like help with?",
  timestamp: new Date(),
};

const ERROR_MESSAGE =
  "Sorry, I encountered an error. Please try again or check your connection.";

interface UseChatOptions {
  currentContent: string;
  documentTitle: string;
  onSetContent: (content: string) => void;
}

export function useChat({
  currentContent,
  documentTitle,
  onSetContent,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const patchMessage = (id: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
    );
  };

  const sendMessage = async (content: string, mode: "ask" | "agent") => {
    if (!content.trim() || isLoading) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    const assistantId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);
    setIsLoading(true);

    try {
      await runStream(
        [...messages, userMessage],
        assistantId,
        mode,
        currentContent,
        documentTitle,
        onSetContent,
        patchMessage,
        controller.signal,
      );
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const abort = () => {
    abortControllerRef.current?.abort();
  };

  return { messages, isLoading, messagesEndRef, sendMessage, abort };
}

async function runStream(
  messages: Message[],
  assistantId: string,
  mode: "ask" | "agent",
  currentContent: string,
  documentTitle: string,
  onSetContent: (content: string) => void,
  patchMessage: (id: string, updates: Partial<Message>) => void,
  signal: AbortSignal,
) {
  try {
    const response = await fetch("/api/ai/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        currentContent,
        documentTitle,
      }),
      signal,
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body reader");

    const decoder = new TextDecoder();
    let buffer = "";
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line) as
          | { type: "step"; action: string }
          | { type: "text"; delta: string }
          | { type: "edit"; content: string; explanation: string };

        if (event.type === "step") {
          patchMessage(assistantId, { stepAction: event.action });
        } else if (event.type === "text") {
          accumulated += event.delta;
          patchMessage(assistantId, {
            content: accumulated,
            stepAction: undefined,
            isStreaming: true,
          });
        } else if (event.type === "edit") {
          onSetContent(event.content);
          patchMessage(assistantId, {
            content: event.explanation,
            stepAction: undefined,
            isStreaming: false,
            wasEdit: true,
          });
        }
      }
    }

    if (accumulated) {
      patchMessage(assistantId, { isStreaming: false });
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      patchMessage(assistantId, {
        content: "Generation stopped.",
        stepAction: undefined,
        isStreaming: false,
      });
      return;
    }
    console.error("Error in stream mode:", error);
    patchMessage(assistantId, {
      content: ERROR_MESSAGE,
      stepAction: undefined,
      isStreaming: false,
    });
  }
}
