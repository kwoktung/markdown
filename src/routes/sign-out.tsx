import { createFileRoute } from "@tanstack/react-router";
import { SignOutPage } from "@/pages/sign-out";

export const Route = createFileRoute("/sign-out")({
  component: SignOutPage,
});
