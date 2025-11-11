import { Pool, type PoolClient } from "pg";
import { config } from "../config/environment";
import { logger } from "../config/logger";

export const pool = new Pool({
  connectionString: config.postgres.connectionString,
  statement_timeout: 5_000,
  query_timeout: 5_000,
});

pool.on("connect", () => logger.debug("PostgreSQL client connected"));
pool.on("error", (error: Error) => logger.error({ err: error }, "PostgreSQL error"));

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
