import { PoolClient } from 'pg';
import { db } from './db';

interface AuditParams {
  outlet_id: string;
  chain_id?: string;
  actor_id: string;
  actor_name: string;
  actor_type: 'staff' | 'customer' | 'system' | 'superadmin';
  action: string;
  resource_type: string;
  resource_id?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Global Audit Logger
 * Records sensitive operational events for compliance and security.
 */
export async function logAudit(params: AuditParams, client?: PoolClient) {
  const query = `
    INSERT INTO audit_logs (
      outlet_id, chain_id, actor_id, actor_name, actor_type, 
      action, resource_type, resource_id, old_value, new_value, 
      ip_address, user_agent
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `;

  const values = [
    params.outlet_id,
    params.chain_id || null,
    params.actor_id,
    params.actor_name,
    params.actor_type,
    params.action,
    params.resource_type,
    params.resource_id || null,
    params.old_value ? JSON.stringify(params.old_value) : null,
    params.new_value ? JSON.stringify(params.new_value) : null,
    params.ip_address || null,
    params.user_agent || null
  ];

  try {
    if (client) {
      await client.query(query, values);
    } else {
      await db.query(query, values);
    }
  } catch (error) {
    console.error('AUDIT_LOG_FAILURE:', error);
    // Don't throw, we don't want audit failure to break the main transaction
  }
}
