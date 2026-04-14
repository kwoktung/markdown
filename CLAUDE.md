# Package Manager

This project uses **pnpm**. Always use `pnpm` instead of `npm` or `yarn` for installing dependencies and running scripts.

# Deployment Target: Cloudflare Workers

This project is deployed to **Cloudflare Workers** using Wrangler (`wrangler.jsonc`).

## Key Cloudflare Workers Constraints

- **No `process.env`** — environment variables and bindings are accessed via `import { env } from 'cloudflare:workers'` (see `src/env.server.ts`). Never use `process.env` for server-side secrets.
- **No Node.js built-ins by default** — `nodejs_compat` flag is enabled, so most Node APIs work, but avoid anything that relies on the filesystem or native modules.
- **Runtime is the V8 isolate**, not Node.js — keep server-side code edge-compatible.

# Function Parameters

Prefer object params over positional params for functions with more than one parameter.

```ts
// good
function withJsonCache<T>({ namespace, key, fn, ttl }: { ... }): Promise<T>

// avoid
function withJsonCache<T>(namespace: string, key: string, fn: () => Promise<T>, ttl: number): Promise<T>
```

# File Naming

Use kebab-case for all file names (e.g. `theme-script.tsx`, not `ThemeScript.tsx`).

# Generated Files

## worker-configuration.d.ts

This is a generated file. Never modify it directly.

- To update environment variables, edit `.env` or `.env.local`
- Then run `npm run cf-typegen` to regenerate the file

## src/routeTree.gen.ts

This is a generated file. Never modify it directly.

- Update the route structure instead
- The file is auto-regenerated in dev mode

## src/db/migrations

This is a generated migrations directory. Never modify files here directly.

- To create a new migration, use the appropriate migration tool/command
- Files here are auto-generated from schema changes
