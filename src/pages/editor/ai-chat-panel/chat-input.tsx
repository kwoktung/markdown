import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Send, Square, Pencil, MessageCircle, Paperclip } from "lucide-react";

interface ChatInputProps {
  isLoading: boolean;
  onSend: (content: string, mode: "ask" | "agent") => void;
  onAbort: () => void;
}

export function ChatInput({ isLoading, onSend, onAbort }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"ask" | "agent">("ask");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim(), mode);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4 shrink-0">
      <div className="rounded-xl border bg-background focus-within:ring-2 focus-within:ring-primary overflow-hidden">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "agent"
              ? "Tell the AI what to change..."
              : "Ask me anything about your document..."
          }
          className="w-full min-h-[72px] max-h-[160px] px-4 pt-3 pb-2 bg-transparent resize-none focus:outline-none text-sm overflow-y-auto custom-scrollbar"
          rows={2}
        />
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-40 cursor-not-allowed"
              disabled
              title="File upload (coming soon)"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2.5 text-xs font-medium"
                >
                  {mode === "agent" ? (
                    <Pencil className="h-3.5 w-3.5" />
                  ) : (
                    <MessageCircle className="h-3.5 w-3.5" />
                  )}
                  {mode === "agent" ? "Agent" : "Ask"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="top"
                className="w-36 p-1"
              >
                <DropdownMenuItem
                  onClick={() => setMode("agent")}
                  className={
                    mode === "agent" ? "bg-accent text-accent-foreground" : ""
                  }
                >
                  <Pencil className="h-4 w-4" />
                  Agent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setMode("ask")}
                  className={
                    mode === "ask" ? "bg-accent text-accent-foreground" : ""
                  }
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isLoading ? (
            <Button
              onClick={onAbort}
              size="icon"
              variant="destructive"
              className="h-8 w-8 rounded-lg shrink-0"
              title="Stop generating"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="h-8 w-8 rounded-lg shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
