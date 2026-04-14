import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { streamText as honoStreamText } from "hono/streaming";
import { z } from "zod";
import { streamText, generateText, tool } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { getEnv } from "#/env.server";
import { ASK_SYSTEM_PROMPT, AGENT_SYSTEM_PROMPT } from "#/constants";

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
  currentResume: z.string().optional(),
  documentTitle: z.string().optional(),
});

const editRequestSchema = z.object({
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

const app = new Hono<HonoContext>()
  .post("/ask", zValidator("json", chatRequestSchema), async (c) => {
    const body = c.req.valid("json");
    const { messages, currentResume, documentTitle } = body;

    const conversationMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [{ role: "system", content: ASK_SYSTEM_PROMPT }];

    if (currentResume?.trim()) {
      conversationMessages.push({
        role: "user",
        content: `Current resume content (title: "${documentTitle ?? "Untitled"}"):\n\n${currentResume}\n\nUse this context to provide personalized advice.`,
      });
    }

    conversationMessages.push(...messages);

    const workersai = createWorkersAI({ binding: getEnv().AI });

    return honoStreamText(c, async (stream) => {
      try {
        const result = streamText({
          model: workersai("@cf/openai/gpt-oss-120b"),
          messages: conversationMessages,
          maxOutputTokens: 1024,
        });

        for await (const chunk of result.textStream) {
          await stream.write(chunk);
        }
      } catch (err) {
        console.error("AI streaming error:", err);
        await stream.write(
          "I apologize, but I encountered an error. Please try again.",
        );
      }
    });
  })
  .post("/agent", zValidator("json", editRequestSchema), async (c) => {
    const { messages, currentContent, documentTitle } = c.req.valid("json");

    const workersai = createWorkersAI({ binding: getEnv().AI });

    const result = await generateText({
      model: workersai("@cf/openai/gpt-oss-120b"),
      system: AGENT_SYSTEM_PROMPT,
      messages: [
        ...(currentContent?.trim()
          ? [
              {
                role: "user" as const,
                content: `Current document (title: "${documentTitle ?? "Untitled"}"):\n\n${currentContent}`,
              },
              {
                role: "assistant" as const,
                content:
                  "I have read the document. What would you like me to change?",
              },
            ]
          : []),
        ...messages,
      ],
      tools: {
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
      },
      maxOutputTokens: 4096,
    });

    const editResult = result.toolResults?.find(
      (r) => r.toolName === "edit_document",
    );

    if (editResult) {
      const { content, explanation } = editResult.output as {
        content: string;
        explanation: string;
      };
      return c.json({ type: "edit", content, explanation });
    }

    return c.json({
      type: "text",
      content: result.text || "I couldn't process that request.",
    });
  });

export default app;
