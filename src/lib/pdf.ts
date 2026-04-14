import puppeteer from "@cloudflare/puppeteer";
import type { BrowserWorker, Browser, Page } from "@cloudflare/puppeteer";
import { getStyledHtmlDocument, markdownToHtml } from "./markdown";

// Extend Window interface for Mermaid
declare global {
  interface Window {
    mermaid?: {
      initialize: (config: { theme: string; startOnLoad: boolean }) => void;
      run: (config?: { querySelector?: string }) => Promise<void>;
    };
    mermaidReady?: boolean;
  }
}

/**
 * PDF generation options
 */
export interface PdfOptions {
  format?: "A4" | "Letter" | "Legal";
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground?: boolean;
}

/**
 * Wait for Mermaid diagrams to render in the page
 * @param page - Puppeteer page instance
 * @throws Error if Mermaid rendering fails (error is caught and logged as warning)
 */
async function waitForMermaidRender(page: Page): Promise<void> {
  // Wait for Mermaid.js to be available (with longer timeout for CDN loading)
  await page.waitForFunction(() => typeof window.mermaid !== "undefined", {
    timeout: 20000,
  });

  // Manually initialize and render Mermaid if not already done
  await page.evaluate(async () => {
    if (typeof window.mermaid !== "undefined" && !window.mermaidReady) {
      try {
        window.mermaid.initialize({
          theme: "default",
          startOnLoad: false,
        });
        await window.mermaid.run({ querySelector: ".mermaid" });
        window.mermaidReady = true;
      } catch (error) {
        console.error("Mermaid initialization error:", error);
        window.mermaidReady = false;
      }
    }
  });

  // Wait for Mermaid to render all diagrams
  // Check if all mermaid elements have been rendered (have SVG children)
  await page.waitForFunction(
    () => {
      const mermaidElements = document.querySelectorAll(".mermaid");
      if (mermaidElements.length === 0) return true;

      // Check if all mermaid elements have been rendered (have SVG children)
      for (const element of mermaidElements) {
        if (!element.querySelector("svg")) {
          return false;
        }
      }
      return true;
    },
    { timeout: 30000, polling: 500 },
  );

  // Additional wait to ensure rendering is complete
  await new Promise((resolve) => setTimeout(resolve, 500));
}

/**
 * Default PDF options
 */
const DEFAULT_PDF_OPTIONS: PdfOptions = {
  format: "A4",
  margin: {
    top: "20mm",
    right: "20mm",
    bottom: "20mm",
    left: "20mm",
  },
  printBackground: true,
  displayHeaderFooter: false,
};

/**
 * Generate PDF from HTML using Cloudflare Browser Rendering
 * @param browserBinding - Cloudflare Browser binding from env.BROWSER
 * @param htmlContent - HTML content to convert to PDF
 * @param options - PDF generation options
 * @returns PDF as Uint8Array
 */
export async function generatePdfFromHtml(
  browserBinding: BrowserWorker,
  htmlContent: string,
  options: PdfOptions = {},
): Promise<Uint8Array> {
  let browser: Browser | null = null;

  try {
    // Launch browser using Cloudflare's Browser Rendering API
    browser = await puppeteer.launch(browserBinding);

    // Create a new page
    const page = await browser.newPage();

    // Set content
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // Wait for Mermaid diagrams to render if present
    const hasMermaid = htmlContent.includes('class="mermaid"');
    if (hasMermaid) {
      try {
        await waitForMermaidRender(page);
      } catch (error) {
        console.warn("Mermaid rendering wait timeout or error:", error);
        // Continue with PDF generation even if Mermaid rendering times out
        // The diagrams may still render partially or not at all
      }
    }

    // Merge options with defaults
    const pdfOptions = { ...DEFAULT_PDF_OPTIONS, ...options };

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: pdfOptions.format,
      margin: pdfOptions.margin,
      printBackground: pdfOptions.printBackground,
      displayHeaderFooter: pdfOptions.displayHeaderFooter,
      headerTemplate: pdfOptions.headerTemplate,
      footerTemplate: pdfOptions.footerTemplate,
      timeout: 30000,
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate PDF from markdown HTML
 * @param browserBinding - Cloudflare Browser binding from env.BROWSER
 * @param markdownHtml - Rendered markdown HTML
 * @param title - Document title
 * @param options - PDF generation options
 * @returns PDF as Uint8Array
 */
export async function generatePdfFromMarkdown(
  browserBinding: BrowserWorker,
  markdownHtml: string,
  title: string = "Document",
  options: PdfOptions = {},
): Promise<Uint8Array> {
  // Create styled HTML document
  const styledHtml = getStyledHtmlDocument(markdownHtml, title);

  // Generate PDF
  return generatePdfFromHtml(browserBinding, styledHtml, options);
}

/**
 * Get PDF filename from document title
 */
export function getPdfFilename(title: string): string {
  // Sanitize title for filename
  const sanitized = title
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();

  const timestamp = new Date().toISOString().split("T")[0];
  return `${sanitized}_${timestamp}.pdf`;
}

/**
 * Create PDF response headers
 */
export function getPdfHeaders(filename: string): Record<string, string> {
  return {
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Type": "application/pdf",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

/**
 * Generate PDF Response from markdown content
 * This is a high-level utility that combines all PDF generation steps
 * @param browserBinding - Cloudflare Browser binding from env.BROWSER
 * @param title - Document title
 * @param markdownContent - Markdown content to convert
 * @param options - PDF generation options
 * @returns Response object with PDF
 * @throws Error if browser binding is not available or PDF generation fails
 */
export async function generatePdfResponse(
  browserBinding: BrowserWorker | undefined,
  title: string,
  markdownContent: string,
  options: PdfOptions = {},
): Promise<Response> {
  // Check browser binding availability
  if (!browserBinding) {
    throw new Error("Browser rendering not available");
  }

  // Convert markdown to HTML
  const html = markdownToHtml(markdownContent);

  // Generate PDF
  const pdfBuffer = await generatePdfFromMarkdown(
    browserBinding,
    html,
    title,
    options,
  );

  // Get PDF filename and headers
  const filename = getPdfFilename(title);
  const headers = getPdfHeaders(filename);

  // Return PDF Response
  return new Response(Buffer.from(pdfBuffer), {
    headers,
  });
}
