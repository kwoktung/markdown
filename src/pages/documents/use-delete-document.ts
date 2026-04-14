import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, json } from "@/lib/api-client";
import type { Document } from "./types";

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null,
  );

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      json(client.api.document[":id"].$delete({ param: { id: String(id) } })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDocumentToDelete(null);
    },
  });

  return {
    documentToDelete,
    setDocumentToDelete,
    deleteMutation,
  };
}
