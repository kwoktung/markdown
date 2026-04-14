import { hc } from "hono/client";
import type { AppType } from "#/apis/hono";

export const client = hc<AppType>("");

interface JsonResponse<T> {
  ok: boolean;
  json: () => Promise<T>;
}

export async function json<T>(
  res: Promise<JsonResponse<T>> | JsonResponse<T>,
): Promise<T> {
  const r = await res;
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    const err = (body as { error?: string }).error;
    throw new Error(typeof err === "string" ? err : "Request failed");
  }
  return r.json();
}
