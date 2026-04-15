import { streamText, tool, stepCountIs } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import Mustache from "mustache";
import { z } from "zod";
import { getEnv } from "#/env.server";
import { AGENT_SYSTEM_PROMPT } from "#/constants";
import { createBrowserTools } from "./browser-tools";

export type AgentEvent =
  | { type: "step"; action: string }
  | { type: "text"; delta: string }
  | { type: "edit"; content: string; explanation: string };

export interface RunAgentStreamParams {
  mode: "ask" | "agent";
  messages: { role: "user" | "assistant"; content: string }[];
  currentContent?: string;
  signal: AbortSignal;
}

const TOOL_ACTIONS: Record<string, string> = {
  browser_search: "Searching browser documentation...",
  browser_execute: "Browsing the web...",
  edit_document: "Editing document...",
};

function buildSystemPrompt(
  mode: "ask" | "agent",
  currentContent?: string,
): string {
  let prompt = Mustache.render(AGENT_SYSTEM_PROMPT, {
    editCapability: mode === "agent",
  });
  if (currentContent?.trim()) {
    prompt += `\n\n## Current Document\n\n${currentContent}`;
  }
  return prompt;
}

function buildTools(
  mode: "ask" | "agent",
  browserTools: ReturnType<typeof createBrowserTools>,
  onEdit?: (event: Extract<AgentEvent, { type: "edit" }>) => void,
) {
  if (mode === "ask") return { ...browserTools };
  return {
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
      outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
      }),
      execute: async ({ content, explanation }) => {
        onEdit?.({ type: "edit", content, explanation });
        return { success: true, message: "Document updated successfully." };
      },
    }),
    ...browserTools,
  };
}

export async function* runAgentStream({
  mode,
  messages,
  currentContent,
  signal,
}: RunAgentStreamParams): AsyncGenerator<AgentEvent> {
  const env = getEnv();
  const workersai = createWorkersAI({ binding: env.AI });
  const browserTools = createBrowserTools({ browser: env.BROWSER });

  const systemPrompt = buildSystemPrompt(mode, currentContent);
  const pendingSteps: AgentEvent[] = [];
  const tools = buildTools(mode, browserTools, (event) =>
    pendingSteps.push(event),
  );

  try {
    const result = streamText({
      model: workersai("@cf/moonshotai/kimi-k2.5"),
      system: systemPrompt,
      messages,
      tools,
      stopWhen: stepCountIs(10),
      maxOutputTokens: 40960,
      abortSignal: signal,
      experimental_onToolCallStart: async ({ toolCall }) => {
        const action =
          TOOL_ACTIONS[toolCall.toolName] ?? `Running ${toolCall.toolName}...`;
        pendingSteps.push({ type: "step", action });
      },
    });

    for await (const chunk of result.textStream) {
      while (pendingSteps.length > 0) {
        yield pendingSteps.shift()!;
      }
      yield { type: "text", delta: chunk };
    }

    while (pendingSteps.length > 0) {
      yield pendingSteps.shift()!;
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      yield { type: "text", delta: "Generation stopped." };
      return;
    }
    console.error("AI streaming error:", err);
    yield {
      type: "text",
      delta: "I apologize, but I encountered an error. Please try again.",
    };
  }
}
