import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getDocuments,
  getDocumentsCount,
  createDocument,
  searchDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  duplicateDocument,
} from "#/funcs/document";
import { ForbiddenError, NotFoundError } from "#/lib/errors";

const createDocumentSchema = z.object({
  title: z.string().min(1),
  content: z.string().default(""),
});

const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int(),
});

const listQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10)),
  offset: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0)),
});

const searchQuerySchema = z.object({
  query: z.string().min(1),
});

const app = new Hono<HonoContext>()
  .get("/", zValidator("query", listQuerySchema), async (c) => {
    const userId = c.get("userId");
    const { limit, offset } = c.req.valid("query");
    const [documents, total] = await Promise.all([
      getDocuments(userId, limit, offset),
      getDocumentsCount(userId),
    ]);
    return c.json({ documents, total });
  })
  .post("/", zValidator("json", createDocumentSchema), async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const count = await getDocumentsCount(userId);
    if (count >= 50) {
      throw new ForbiddenError("Maximum document limit of 50 reached");
    }
    const document = await createDocument({
      title: body.title,
      content: body.content,
      userId,
    });
    return c.json({ id: document.id, success: true });
  })
  .get("/search", zValidator("query", searchQuerySchema), async (c) => {
    const userId = c.get("userId");
    const { query } = c.req.valid("query");
    const documents = await searchDocuments(userId, query);
    return c.json({ documents, total: documents.length });
  })
  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const document = await getDocumentById(id, userId);
    if (!document) throw new NotFoundError("Document not found");
    return c.json({ document });
  })
  .put(
    "/:id",
    zValidator("param", idParamSchema),
    zValidator("json", updateDocumentSchema),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");
      const result = await updateDocument(id, userId, body);
      if (!result) throw new NotFoundError("Document not found");
      return c.json({ id, success: true });
    },
  )
  .delete("/:id", zValidator("param", idParamSchema), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    await deleteDocument(id, userId);
    return c.json({ id, success: true });
  })
  .post("/:id/duplicate", zValidator("param", idParamSchema), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const document = await duplicateDocument(id, userId);
    return c.json({ document, success: true });
  });

export default app;
