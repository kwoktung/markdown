import puppeteer from "@cloudflare/puppeteer";
import type { BrowserWorker } from "@cloudflare/puppeteer";
import { tool } from "ai";
import { z } from "zod";

const SEARCH_RESULTS_LIMIT = 5;
const PAGE_CONTENT_LIMIT = 8000;

export function createBrowserTools({ browser }: { browser: Fetcher }) {
  return {
    browser_search: tool({
      description:
        "Search the web for information using DuckDuckGo. Use this to find current information, documentation, or answers to questions.",
      inputSchema: z.object({
        query: z.string().describe("The search query"),
      }),
      execute: async ({ query }) => {
        const b = await puppeteer.launch(browser as unknown as BrowserWorker);
        try {
          const page = await b.newPage();
          await page.goto(
            `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
            { waitUntil: "domcontentloaded" },
          );
          const results = await page.evaluate((limit: number) => {
            return Array.from(document.querySelectorAll(".result"))
              .slice(0, limit)
              .map((el) => {
                const titleEl = el.querySelector(".result__title a");
                const snippetEl = el.querySelector(".result__snippet");
                const href = titleEl?.getAttribute("href") ?? "";
                let url = href;
                try {
                  const parsed = new URL(
                    href.startsWith("/")
                      ? `https://html.duckduckgo.com${href}`
                      : href,
                  );
                  const uddg = parsed.searchParams.get("uddg");
                  if (uddg) url = decodeURIComponent(uddg);
                } catch {
                  // keep original href
                }
                return {
                  title: titleEl?.textContent?.trim() ?? "",
                  url,
                  snippet: snippetEl?.textContent?.trim() ?? "",
                };
              });
          }, SEARCH_RESULTS_LIMIT);
          return { results };
        } finally {
          await b.close();
        }
      },
    }),

    browser_execute: tool({
      description:
        "Navigate to a URL and extract the visible text content of the page. Use this to read articles, documentation, or any web page.",
      inputSchema: z.object({
        url: z.string().describe("The URL to navigate to"),
      }),
      execute: async ({ url }) => {
        const b = await puppeteer.launch(browser as unknown as BrowserWorker);
        try {
          const page = await b.newPage();
          await page.goto(url, { waitUntil: "domcontentloaded" });
          const title = await page.title();
          const content = await page.evaluate(() => document.body.innerText);
          return {
            title,
            url,
            content: content.trim().slice(0, PAGE_CONTENT_LIMIT),
          };
        } finally {
          await b.close();
        }
      },
    }),
  };
}
