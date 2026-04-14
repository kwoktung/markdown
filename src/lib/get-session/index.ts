import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { withJsonCache } from "#/lib/cache.server";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Session {
  session: object;
  user: SessionUser;
}

export const getSession = createServerFn().handler(() => {
  const request = getRequest();
  const cookie = request.headers.get("cookie") ?? "";

  return withJsonCache<Session | null>({
    namespace: "session",
    key: cookie,
    fn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_AUTH_BASE_URL}/api/auth/get-session`,
        { headers: { cookie } },
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data as Session;
    },
    ttl: 60,
  });
});
