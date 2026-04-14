import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getSession } from "@/lib/get-session";
import { EditorPage } from "#/pages/editor";
import githubMarkdownCss from "#/pages/editor/github-markdown-css.css?url";

export const Route = createFileRoute("/editor")({
  head: () => {
    return {
      links: [{ rel: "stylesheet", href: githubMarkdownCss }],
    };
  },
  validateSearch: z.object({
    id: z.coerce.number().int().optional(),
  }),
  loader: async () => {
    const session = await getSession();
    return { session };
  },
  component: EditorPage,
  ssr: false,
});
