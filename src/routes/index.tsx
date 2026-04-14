import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/get-session";
import { HomePage } from "@/pages/home";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) throw redirect({ to: "/documents" });
  },
  component: HomePage,
});
