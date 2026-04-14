import { Hono } from "hono";
import { ZodError, z } from "zod";
import {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  RateLimitError,
  ServerError,
} from "#/lib/errors";
import { createAuthMiddleware } from "#/middlewares/auth-middleware";
import document from "./document";
import ai from "./ai";
import pdf from "./pdf";

const app = new Hono<HonoContext>();

app.onError((err, c) => {
  console.error(err);
  if (err instanceof UnauthorizedError)
    return c.json({ error: err.message }, 401);
  if (err instanceof NotFoundError) return c.json({ error: err.message }, 404);
  if (err instanceof ForbiddenError) return c.json({ error: err.message }, 403);
  if (err instanceof RateLimitError) return c.json({ error: err.message }, 429);
  if (err instanceof ServerError) return c.json({ error: err.message }, 500);
  if (err instanceof ZodError)
    return c.json({ error: z.treeifyError(err) }, 400);
  return c.json({ error: "Internal server error" }, 500);
});

app.use(createAuthMiddleware());

const routes = app
  .route("/api/document", document)
  .route("/api/ai", ai)
  .route("/api/pdf", pdf);

export type AppType = typeof routes;

export default app;
