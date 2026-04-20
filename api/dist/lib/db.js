"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.withOutletContext = withOutletContext;
exports.withChainContext = withChainContext;
const pg_1 = require("pg");
const logger_1 = require("./logger");
exports.db = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
exports.db.on('error', (err) => {
    logger_1.logger.error('Unexpected error on idle client', err);
});
/**
 * Sets RLS context for outlet-scoped queries.
 * Every outlet API call must use this — never query outlet tables directly.
 */
async function withOutletContext(outlet_id, fn) {
    const client = await exports.db.connect();
    try {
        await client.query('BEGIN');
        // RLS reads this setting in the policy: current_setting('app.current_outlet_id', TRUE)
        await client.query(`SET LOCAL app.current_outlet_id = '${outlet_id}'`);
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
/**
 * Sets RLS context for chain-scoped queries (chain-app endpoints).
 */
async function withChainContext(chain_id, fn) {
    const client = await exports.db.connect();
    try {
        await client.query('BEGIN');
        await client.query(`SET LOCAL app.current_chain_id = '${chain_id}'`);
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
