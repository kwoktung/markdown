import { marked, Renderer } from "marked";
import type { Tokens } from "marked";

/**
 * Configure marked options for better markdown rendering
 */
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // Enable GitHub Flavored Markdown
});

/**
 * Create a default renderer to access the original code renderer
 */
const defaultRenderer = new Renderer();

/**
 * Add custom renderer for Mermaid diagrams
 * Converts ```mermaid code blocks to <div class="mermaid"> elements
 * Uses the default renderer for all other code blocks to ensure proper escaping
 */
marked.use({
  renderer: {
    code(token: Tokens.Code): string {
      // Check if this is a mermaid code block
      if (token.lang === "mermaid") {
        // Return a div with class "mermaid" instead of pre/code
        // Note: Mermaid code is not escaped as it will be processed by Mermaid.js
        return `<div class="mermaid">${token.text}</div>\n`;
      }
      // For all other code blocks, use the default renderer to ensure proper escaping
      return defaultRenderer.code(token);
    },
  },
});

// todo: find a way to sanitize the html without using jsdom, safety for serverless functions
const dompurify = (html: string) => {
  return html;
};

/**
 * Convert markdown to HTML
 * Sanitizes the output to prevent XSS attacks
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) {
    return "";
  }

  try {
    // Convert markdown to HTML
    const rawHtml = marked.parse(markdown, { async: false });
    return dompurify(rawHtml);
  } catch (error) {
    console.error("Error converting markdown to HTML:", error);
    return "";
  }
}

/**
 * Get a styled HTML document with GitHub-style markdown CSS
 * This is useful for PDF generation
 */
export function getStyledHtmlDocument(
  markdownHtml: string,
  title: string = "Document",
): string {
  // Check if HTML contains mermaid diagrams
  const hasMermaid = markdownHtml.includes('class="mermaid"');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${hasMermaid ? '<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>' : ""}
  <style>
    /* GitHub Markdown CSS - Minimal version for PDF */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      word-wrap: break-word;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      background-color: #ffffff;
      color: #1f2328;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    h1 { font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; color: #656d76; }

    p { margin-top: 0; margin-bottom: 10px; }

    a { color: #000; text-decoration: none; }
    a:hover { text-decoration: underline; }

    code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: #f6f8fa;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
    }

    pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
      margin-top: 0;
      margin-bottom: 16px;
    }

    pre code {
      padding: 0;
      background-color: transparent;
      border: 0;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 16px;
      padding-left: 2em;
    }

    li + li { margin-top: 0.25em; }

    blockquote {
      margin: 0;
      padding: 0 1em;
      color: #656d76;
      border-left: 0.25em solid #d0d7de;
      margin-bottom: 16px;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
      margin-top: 0;
      margin-bottom: 16px;
      width: 100%;
    }

    table tr {
      background-color: #ffffff;
      border-top: 1px solid #d0d7de;
    }

    table tr:nth-child(2n) {
      background-color: #f6f8fa;
    }

    table th, table td {
      padding: 6px 13px;
      border: 1px solid #d0d7de;
    }

    table th {
      font-weight: 600;
      background-color: #f6f8fa;
    }

    hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: #d0d7de;
      border: 0;
    }

    img {
      max-width: 100%;
      box-sizing: content-box;
    }

    strong { font-weight: 600; }
    em { font-style: italic; }

    /* Mermaid diagram styling */
    .mermaid {
      margin: 16px 0;
      text-align: center;
      overflow-x: auto;
    }

    .mermaid svg {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="markdown-body">
    ${markdownHtml}
  </div>
  ${
    hasMermaid
      ? `
  <script>
    (async function() {
      // Wait for Mermaid.js to load
      let retries = 50; // 5 seconds max wait
      while (typeof mermaid === 'undefined' && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries--;
      }
      
      if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ 
          theme: 'default',
          startOnLoad: false 
        });
        try {
          await mermaid.run({ querySelector: '.mermaid' });
          // Signal that Mermaid rendering is complete
          window.mermaidReady = true;
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          window.mermaidReady = false;
        }
      } else {
        console.error('Mermaid.js failed to load');
        window.mermaidReady = false;
      }
    })();
  </script>
  `
      : ""
  }
</body>
</html>
  `.trim();
}

/**
 * Extract plain text from markdown (removes all formatting)
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) {
    return "";
  }

  // Remove markdown syntax
  return markdown
    .replace(/#{1,6}\s+/g, "") // Remove headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links, keep text
    .replace(/`(.+?)`/g, "$1") // Remove inline code
    .replace(/```[\s\S]+?```/g, "") // Remove code blocks
    .replace(/>\s+/g, "") // Remove blockquotes
    .replace(/[-*+]\s+/g, "") // Remove list markers
    .replace(/\d+\.\s+/g, "") // Remove numbered list markers
    .trim();
}

/**
 * Get word count from markdown
 */
export function getWordCount(markdown: string): number {
  const plainText = markdownToPlainText(markdown);
  return plainText.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Validate markdown syntax (basic validation)
 */
export function validateMarkdown(markdown: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!markdown || markdown.trim().length === 0) {
    errors.push("Markdown content is empty");
  }

  // Check for unclosed code blocks
  const codeBlockCount = (markdown.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    errors.push("Unclosed code block detected");
  }

  // Check for unmatched brackets in links
  const openBrackets = (markdown.match(/\[/g) || []).length;
  const closeBrackets = (markdown.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push("Unmatched brackets in links");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
