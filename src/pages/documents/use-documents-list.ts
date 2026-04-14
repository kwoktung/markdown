import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client, json } from "@/lib/api-client";
import type { DocumentListResponse } from "./types";

export const LIMIT = 10;

export function useDocumentsList() {
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery<DocumentListResponse>({
    queryKey: ["documents", LIMIT, offset],
    queryFn: () =>
      json(
        client.api.document.$get({
          query: { limit: String(LIMIT), offset: String(offset) },
        }),
      ),
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;
  const currentPage = Math.floor(offset / LIMIT) + 1;
  const showPagination = data ? data.total > LIMIT : false;

  return {
    data,
    isLoading,
    error,
    offset,
    currentPage,
    totalPages,
    showPagination,
    goToPreviousPage: () => setOffset(Math.max(0, offset - LIMIT)),
    goToNextPage: () => setOffset(offset + LIMIT),
  };
}
