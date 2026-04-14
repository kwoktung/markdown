import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/get-session";
import { SignInPage } from "@/pages/sign-in";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) throw redirect({ to: "/documents" });
  },
  component: SignInPage,
});
