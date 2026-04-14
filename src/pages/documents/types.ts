export interface Document {
  id: number;
  title: string;
  content: string;
  userId: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}
