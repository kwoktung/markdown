import { useCallback, useMemo, useRef, useState, useEffect, memo } from "react";
import { markdownToHtml } from "@/lib/markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MermaidRenderer } from "@/components/mermaid-renderer";

interface MarkdownPreviewProps {
  markdown: string;
  className?: string;
}

function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

const useMarkdownBodyBackgroundColor = () => {
  const [bgColor, setBgColor] = useState<string>("transparent");
  const animationFrameRef = useRef<number | null>(null);

  const markdownBodyRef = useCallback((node: HTMLDivElement | null) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (node) {
      animationFrameRef.current = requestAnimationFrame(() => {
        const styles = getComputedStyle(node);
        const color = styles.getPropertyValue("--bgColor-default");
        setBgColor(color || "transparent");
      });
    }
  }, []);

  return { bgColor, markdownBodyRef };
};

function MarkdownPreviewComponent({
  markdown,
  className = "",
}: MarkdownPreviewProps) {
  const isDark = useIsDark();
  const { bgColor, markdownBodyRef } = useMarkdownBodyBackgroundColor();

  const html = useMemo(() => {
    return markdownToHtml(markdown);
  }, [markdown]);

  if (!markdown) {
    return (
      <div
        className={`h-full flex items-center justify-center text-muted-foreground ${className}`}
      >
        <p>Preview will appear here...</p>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-full ${className}`}>
      <MermaidRenderer html={html} isDark={isDark} />
      <div className="p-6" style={{ backgroundColor: bgColor }}>
        <div
          ref={markdownBodyRef}
          className="markdown-body"
          data-theme={isDark ? "dark" : "light"}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </ScrollArea>
  );
}

export const MarkdownPreview = memo(MarkdownPreviewComponent);
