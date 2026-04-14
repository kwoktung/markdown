import type { documentTable } from "@/db/schema";

// Document types
export type DocumentItem = typeof documentTable.$inferSelect;
export type NewDocumentItem = typeof documentTable.$inferInsert;
