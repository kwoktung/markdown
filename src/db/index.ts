import { drizzle } from "drizzle-orm/d1";
import { getLogger } from "#/lib/logger";
import type { Logger } from "#/lib/logger";
import type { Logger as DrizzleLoggerInterface } from "drizzle-orm/logger";

import * as schema from "./schema";

const formatSqlQuery = (query: { sql: string; params: unknown[] }) => {
  return query.sql.replace(/\$\d+/g, (match: string) => {
    const index = parseInt(match.slice(1));
    return JSON.stringify(query.params[index - 1]);
  });
};

class DrizzleLogger implements DrizzleLoggerInterface {
  private readonly logger: Logger;
  constructor() {
    this.logger = getLogger();
  }
  logQuery(query: string, params: unknown[]): void {
    this.logger.debug(formatSqlQuery({ sql: query, params }), {
      label: "drizzle-orm",
    });
  }

  splat(query: string, params: unknown[]): string {
    return formatSqlQuery({ sql: query, params });
  }
}

export function getDb(env: Env) {
  return drizzle(env.DB, { schema, logger: new DrizzleLogger() });
}
