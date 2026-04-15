import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { streamText as honoStreamText } from "hono/streaming";
import { z } from "zod";
import { runAgentStream } from "#/funcs/ai";

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
});

const app = new Hono<HonoContext>().post(
  "/agent",
  zValidator("json", agentRequestSchema),
  async (c) => {
    const { mode, messages, currentContent } = c.req.valid("json");
    return honoStreamText(c, async (stream) => {
      for await (const event of runAgentStream({
        mode,
        messages,
        currentContent,
        signal: c.req.raw.signal,
      })) {
        await stream.write(JSON.stringify(event) + "\n");
      }
    });
  },
);

export default app;
