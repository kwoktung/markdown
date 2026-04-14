import { getEnv } from "@/env.server";
import { getDb } from "@/db";
import { NotFoundError } from "@/lib/errors";
import { documentTable } from "@/db/schema";
import { eq, like, and, isNull, desc, sql } from "drizzle-orm";

export type { Document, NewDocument } from "@/db/schema";

export async function getDocuments(
  userId: string,
  limit?: number,
  offset?: number,
) {
  return getDb(getEnv()).query.documentTable.findMany({
    where: and(
      eq(documentTable.userId, userId),
      isNull(documentTable.deletedAt),
    ),
    orderBy: [desc(documentTable.updatedAt)],
    limit,
    offset,
  });
}

export async function getDocumentById(id: number, userId: string) {
  return getDb(getEnv()).query.documentTable.findFirst({
    where: and(
      eq(documentTable.id, id),
      eq(documentTable.userId, userId),
      isNull(documentTable.deletedAt),
    ),
  });
}

export async function createDocument(
  documentData: Omit<
    typeof documentTable.$inferInsert,
    "id" | "createdAt" | "updatedAt" | "deletedAt"
  >,
) {
  const now = new Date();
  const newDocument = { ...documentData, createdAt: now, updatedAt: now };
  const result = await getDb(getEnv())
    .insert(documentTable)
    .values(newDocument)
    .returning();
  const documentId = result[0].id;
  return { id: documentId, ...newDocument };
}

export async function updateDocument(
  id: number,
  userId: string,
  documentData: Partial<
    Omit<
      typeof documentTable.$inferInsert,
      "id" | "createdAt" | "deletedAt" | "userId"
    >
  >,
) {
  const now = new Date();
  const result = await getDb(getEnv())
    .update(documentTable)
    .set({ ...documentData, updatedAt: now })
    .where(
      and(
        eq(documentTable.id, id),
        eq(documentTable.userId, userId),
        isNull(documentTable.deletedAt),
      ),
    )
    .returning();
  return result[0];
}

export async function deleteDocument(id: number, userId: string) {
  const now = new Date();
  return getDb(getEnv())
    .update(documentTable)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(documentTable.id, id),
        eq(documentTable.userId, userId),
        isNull(documentTable.deletedAt),
      ),
    );
}

export async function searchDocuments(
  userId: string,
  query: string,
  limit?: number,
  offset?: number,
) {
  return getDb(getEnv()).query.documentTable.findMany({
    where: and(
      eq(documentTable.userId, userId),
      isNull(documentTable.deletedAt),
      like(documentTable.title, `%${query}%`),
    ),
    orderBy: [desc(documentTable.updatedAt)],
    limit,
    offset,
  });
}

export async function getDocumentsCount(userId: string) {
  const result = await getDb(getEnv())
    .select({ count: sql<number>`count(*)` })
    .from(documentTable)
    .where(
      and(eq(documentTable.userId, userId), isNull(documentTable.deletedAt)),
    );
  return result[0]?.count ?? 0;
}

export async function duplicateDocument(id: number, userId: string) {
  const document = await getDocumentById(id, userId);
  if (!document) throw new NotFoundError("Document not found");
  const now = new Date();
  const result = await getDb(getEnv())
    .insert(documentTable)
    .values({
      title: `${document.title} (Copy)`,
      content: document.content,
      userId: document.userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return result[0];
}
