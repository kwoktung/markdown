import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, User, Bot, Copy, Check, Pencil } from "lucide-react";
import type { Message } from "./use-chat";

export function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === "user") {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="flex-1 bg-primary text-primary-foreground rounded-2xl px-4 py-3 max-w-[85%] ml-auto">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-purple-500 flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 space-y-2">
        {message.wasEdit && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <Pencil className="h-3 w-3" />
              Document edited
            </span>
          </div>
        )}
        <div className="bg-muted rounded-2xl px-4 py-3">
          {message.content.length === 0 && message.isStreaming ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-[2px] h-4 bg-primary ml-1 animate-pulse" />
              )}
            </p>
          )}
        </div>
        {message.id !== "welcome" && !message.isStreaming && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
