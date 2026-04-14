import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, json } from "@/lib/api-client";

export function useDuplicateDocument() {
  const queryClient = useQueryClient();

  const { mutate, isPending, variables } = useMutation({
    mutationFn: (id: number) =>
      json(
        client.api.document[":id"].duplicate.$post({
          param: { id: String(id) },
        }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  return { mutate, isPending, variables };
}
