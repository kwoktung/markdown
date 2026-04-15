import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Sparkles } from "lucide-react";
import { usePanelResize } from "./use-panel-resize";
import { useChat } from "./use-chat";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";

interface AiChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  onInsertText: (text: string) => void;
  onSetContent: (content: string) => void;
}

export function AiChatPanel({
  isOpen,
  onClose,
  currentContent,
  onInsertText: _onInsertText,
  onSetContent,
}: AiChatPanelProps) {
  const [isClosing, setIsClosing] = useState(false);
  const { width, handleResizeStart } = usePanelResize();
  const { messages, isLoading, messagesEndRef, sendMessage, abort } = useChat({
    currentContent,
    onSetContent,
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/10 duration-300 ${
          isClosing ? "animate-out fade-out" : "animate-in fade-in"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed right-0 top-0 h-screen bg-background border-l shadow-2xl z-50 flex flex-col duration-300 ${
          isClosing
            ? "animate-out slide-out-to-right"
            : "animate-in slide-in-from-right"
        }`}
        style={{ width, maxWidth: "100vw" }}
      >
        {/* Drag-to-resize handle */}
        <div
          className="absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-primary/40 active:bg-primary/60 transition-colors duration-150 z-10"
          onMouseDown={handleResizeStart}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-linear-to-r from-primary/10 to-purple-500/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-purple-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">
                Powered by AI • Always improving
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-4 pr-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <ChatInput isLoading={isLoading} onSend={sendMessage} onAbort={abort} />
      </div>
    </>
  );
}
