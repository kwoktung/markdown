import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const documentTable = sqliteTable(
  "documents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    userId: text("user_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`,
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`,
    ),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("documents_title_idx").on(table.title),
    index("documents_userId_idx").on(table.userId),
    index("documents_createdAt_idx").on(table.createdAt),
  ],
);

export type Document = typeof documentTable.$inferSelect;
export type NewDocument = typeof documentTable.$inferInsert;
