import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { streamText as honoStreamText } from "hono/streaming";
import { z } from "zod";
import { streamText, tool, stepCountIs } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { createBrowserTools } from "agents/browser/ai";
import Mustache from "mustache";
import { getEnv } from "#/env.server";
import { AGENT_SYSTEM_PROMPT } from "#/constants";

const TOOL_ACTIONS: Record<string, string> = {
  browser_search: "Searching browser documentation...",
  browser_execute: "Browsing the web...",
  edit_document: "Editing document...",
};

const agentRequestSchema = z.object({
  mode: z.enum(["ask", "agent"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
  currentContent: z.string().optional(),
  documentTitle: z.string().optional(),
});

const app = new Hono<HonoContext>().post(
  "/agent",
  zValidator("json", agentRequestSchema),
  async (c) => {
    const { mode, messages, currentContent, documentTitle } =
      c.req.valid("json");

    const env = getEnv();
    const workersai = createWorkersAI({ binding: env.AI });
    const browserTools = createBrowserTools({
      browser: env.BROWSER,
      loader: env.LOADER,
    });

    const systemPrompt = Mustache.render(AGENT_SYSTEM_PROMPT, {
      editCapability: mode === "agent",
    });

    const contextMessages = currentContent?.trim()
      ? [
          {
            role: "user" as const,
            content: `Current document (title: "${documentTitle ?? "Untitled"}"):\n\n${currentContent}`,
          },
          {
            role: "assistant" as const,
            content: "I have read the document. What would you like?",
          },
        ]
      : [];

    const tools =
      mode === "ask"
        ? { ...browserTools }
        : {
            edit_document: tool({
              description:
                "Replace the entire document with a revised version. Use this when the user asks to edit, modify, rewrite, or change the document.",
              inputSchema: z.object({
                content: z
                  .string()
                  .describe("The complete new document content in markdown."),
                explanation: z
                  .string()
                  .describe("A short summary of what was changed."),
              }),
              execute: async ({ content, explanation }) => ({
                content,
                explanation,
              }),
            }),
            ...browserTools,
          };

    return honoStreamText(c, async (stream) => {
      try {
        const result = streamText({
          model: workersai("@cf/moonshotai/kimi-k2.5"),
          system: systemPrompt,
          messages: [...contextMessages, ...messages],
          tools,
          stopWhen: stepCountIs(10),
          maxOutputTokens: mode === "ask" ? 1024 : 4096,
          abortSignal: c.req.raw.signal,
          experimental_onToolCallStart: async ({ toolCall }) => {
            const action =
              TOOL_ACTIONS[toolCall.toolName] ??
              `Running ${toolCall.toolName}...`;
            await stream.write(JSON.stringify({ type: "step", action }) + "\n");
          },
        });

        for await (const chunk of result.textStream) {
          await stream.write(
            JSON.stringify({ type: "text", delta: chunk }) + "\n",
          );
        }

        if (mode === "agent") {
          const toolResults = await result.toolResults;
          const editResult = toolResults?.find(
            (r) => r.toolName === "edit_document",
          );
          if (editResult) {
            const { content, explanation } = editResult.output as {
              content: string;
              explanation: string;
            };
            await stream.write(
              JSON.stringify({ type: "edit", content, explanation }) + "\n",
            );
          }
        }
      } catch (err) {
        console.error("AI streaming error:", err);
        await stream.write(
          JSON.stringify({
            type: "text",
            delta: "I apologize, but I encountered an error. Please try again.",
          }) + "\n",
        );
      }
    });
  },
);

export default app;
