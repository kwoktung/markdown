import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getEnv } from "#/env.server";
import { generatePdfResponse } from "#/lib/pdf";
import { NotFoundError, RateLimitError } from "#/lib/errors";

const exportPdfSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(500000),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const app = new Hono<HonoContext>()
  .post("/export", zValidator("json", exportPdfSchema), async (c) => {
    const body = c.req.valid("json");
    const env = getEnv();

    const rateLimitKey = `pdf:${crypto.randomUUID()}`;
    const ratelimit = await env.PDF_EXPORT_RATE_LIMITER.limit({
      key: rateLimitKey,
    });
    if (!ratelimit.success) {
      throw new RateLimitError();
    }

    const id = crypto.randomUUID();
    await env.KV.put(
      `pdf_export:${id}`,
      JSON.stringify({ title: body.title, content: body.content }),
      { expirationTtl: 60 },
    );

    return c.json({ id });
  })
  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const env = getEnv();

    const pdfData = await env.KV.get(`pdf_export:${id}`);
    if (!pdfData) throw new NotFoundError("PDF not found");

    const { title, content } = JSON.parse(pdfData) as {
      title: string;
      content: string;
    };

    await env.KV.delete(`pdf_export:${id}`);

    const response = await generatePdfResponse(env.BROWSER, title, content);
    return response;
  });

export default app;
