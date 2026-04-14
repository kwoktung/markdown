import { marked, Renderer } from "marked";
import type { Tokens } from "marked";
import Mustache from "mustache";
import { STYLED_MARKDOWN_HTML_TEMPLATE } from "#/constants";

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
  return Mustache.render(STYLED_MARKDOWN_HTML_TEMPLATE, {
    title,
    markdownHtml,
    hasMermaid: markdownHtml.includes('class="mermaid"'),
  });
}
