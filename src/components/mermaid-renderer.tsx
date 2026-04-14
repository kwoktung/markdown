import { useEffect, useState } from "react";

declare global {
  interface Window {
    mermaid?: {
      initialize: (config: { theme: string; startOnLoad: boolean }) => void;
      run: (config?: { querySelector?: string }) => Promise<void>;
    };
  }
}

interface MermaidRendererProps {
  html: string;
  isDark: boolean;
}

export function MermaidRenderer({ html, isDark }: MermaidRendererProps) {
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    if (window.mermaid) {
      setMermaidLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="mermaid"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => setMermaidLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    script.async = true;
    script.onload = () => setMermaidLoaded(true);
    script.onerror = () => console.error("Failed to load Mermaid.js");
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[src*="mermaid"]');
      if (scriptToRemove?.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
    };
  }, []);

  useEffect(() => {
    if (!mermaidLoaded || !window.mermaid) return;

    const renderMermaid = async () => {
      try {
        window.mermaid!.initialize({
          theme: isDark ? "dark" : "default",
          startOnLoad: false,
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        const mermaidElements = document.querySelectorAll(".mermaid");
        if (mermaidElements.length > 0) {
          await window.mermaid!.run({ querySelector: ".mermaid" });
        }
      } catch (error) {
        console.error("Error rendering Mermaid diagrams:", error);
      }
    };

    renderMermaid();
  }, [html, mermaidLoaded, isDark]);

  return null;
}
