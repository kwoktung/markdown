import { useState, useRef, useEffect } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  wasEdit?: boolean;
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

interface AgentResponse {
  type: string;
  content: string;
  explanation?: string;
}

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
      if (mode === "agent") {
        await runAgentMode(
          [...messages, userMessage],
          assistantId,
          currentContent,
          documentTitle,
          onSetContent,
          patchMessage,
        );
      } else {
        await runAskMode(
          [...messages, userMessage],
          assistantId,
          currentContent,
          documentTitle,
          patchMessage,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, messagesEndRef, sendMessage };
}

async function runAgentMode(
  messages: Message[],
  assistantId: string,
  currentContent: string,
  documentTitle: string,
  onSetContent: (content: string) => void,
  patchMessage: (id: string, updates: Partial<Message>) => void,
) {
  try {
    const response = await fetch("/api/ai/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        currentContent,
        documentTitle,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: AgentResponse = await response.json();

    if (data.type === "edit") {
      onSetContent(data.content);
      patchMessage(assistantId, {
        content: data.explanation ?? "",
        isStreaming: false,
        wasEdit: true,
      });
    } else {
      patchMessage(assistantId, { content: data.content, isStreaming: false });
    }
  } catch (error) {
    console.error("Error in agent mode:", error);
    patchMessage(assistantId, { content: ERROR_MESSAGE, isStreaming: false });
  }
}

async function runAskMode(
  messages: Message[],
  assistantId: string,
  currentContent: string,
  documentTitle: string,
  patchMessage: (id: string, updates: Partial<Message>) => void,
) {
  try {
    const response = await fetch("/api/ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        currentResume: currentContent,
        documentTitle,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body reader available");

    const decoder = new TextDecoder();
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      patchMessage(assistantId, { content: accumulated, isStreaming: true });
    }

    if (accumulated.trim().length === 0) {
      patchMessage(assistantId, {
        content:
          "I apologize, but I couldn't generate a response. Please try again.",
        isStreaming: false,
      });
    } else {
      patchMessage(assistantId, { isStreaming: false });
    }
  } catch (error) {
    console.error("Error in ask mode:", error);
    patchMessage(assistantId, { content: ERROR_MESSAGE, isStreaming: false });
  }
}
