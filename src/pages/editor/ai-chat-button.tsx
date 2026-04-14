import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

interface AiChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function AiChatButton({ onClick, isOpen }: AiChatButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-10 right-6 z-40">
      <Button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          h-10 transition-all duration-300 shadow-2xl
          ${isOpen ? "w-10 bg-destructive hover:bg-destructive/90" : isHovered ? "w-48 pr-4" : "w-10"}
          bg-linear-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600
          group flex items-center justify-center
        `}
        size="icon"
      >
        <div className="flex items-center">
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <>
              <Sparkles className="h-5 w-5 shrink-0 animate-pulse" />
              <span
                className={`
                  text-sm font-semibold whitespace-nowrap transition-all duration-300
                  ${isHovered ? "opacity-100 w-auto ml-2" : "opacity-0 w-0 overflow-hidden"}
                `}
              >
                AI Assistant
              </span>
            </>
          )}
        </div>
      </Button>

      {!isOpen && (
        <div className="absolute bottom-full right-0 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-popover text-popover-foreground text-xs px-3 py-2 rounded-lg shadow-lg border whitespace-nowrap">
            Click to get AI help with your resume
          </div>
        </div>
      )}
    </div>
  );
}
