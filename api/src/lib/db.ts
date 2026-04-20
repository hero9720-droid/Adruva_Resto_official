import { Pool, PoolClient } from 'pg';
import { logger } from './logger';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

/**
 * Sets RLS context for outlet-scoped queries.
 * Every outlet API call must use this — never query outlet tables directly.
 */
export async function withOutletContext<T>(
  outlet_id: string,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // RLS reads this setting in the policy: current_setting('app.current_outlet_id', TRUE)
    await client.query(`SET LOCAL app.current_outlet_id = '${outlet_id}'`);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Sets RLS context for chain-scoped queries (chain-app endpoints).
 */
export async function withChainContext<T>(
  chain_id: string,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL app.current_chain_id = '${chain_id}'`);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
