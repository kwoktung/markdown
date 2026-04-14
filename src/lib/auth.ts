import { createIsomorphicFn } from "@tanstack/react-start";
import { authClient } from "#/lib/auth.client";

export const signInWithGoogle = createIsomorphicFn()
  .client(() => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/documents`,
    });
  })
  .server(() => {});

export const signOut = createIsomorphicFn()
  .client(async () => {
    await authClient.signOut();
  })
  .server(async () => {});
