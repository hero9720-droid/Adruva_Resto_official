import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';

export async function getStandards(req: Request, res: Response) {
  const { chain_id } = req.params;
  const result = await db.query(
    'SELECT * FROM compliance_standards WHERE chain_id = $1 OR chain_id IS NULL ORDER BY created_at DESC',
    [chain_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function submitAudit(req: Request, res: Response) {
  const { outlet_id } = req.params;
  const auditor_id = req.user.id;
  const { standard_id, results, score, corrective_actions } = req.body;

  const result = await db.query(
    `INSERT INTO hygiene_audits (
       outlet_id, auditor_id, standard_id, score, results, corrective_actions
     ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      outlet_id, auditor_id, standard_id, score, 
      JSON.stringify(results), JSON.stringify(corrective_actions || [])
    ]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function getAuditHistory(req: Request, res: Response) {
  const { outlet_id } = req.params;
  const result = await db.query(
    `SELECT ha.*, s.name as auditor_name, cs.title as standard_title 
     FROM hygiene_audits ha
     JOIN staff s ON s.id = ha.auditor_id
     LEFT JOIN compliance_standards cs ON cs.id = ha.standard_id
     WHERE ha.outlet_id = $1 
     ORDER BY ha.created_at DESC LIMIT 50`,
    [outlet_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function getComplianceStats(req: Request, res: Response) {
  const { outlet_id } = req.params;
  
  const stats = await db.query(
    `SELECT 
       AVG(score) as average_score,
       COUNT(id) as total_audits,
       (SELECT COUNT(*) FROM hygiene_audits WHERE outlet_id = $1 AND score < 70) as critical_failures
     FROM hygiene_audits 
     WHERE outlet_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
    [outlet_id]
  );

  res.json({ success: true, data: stats.rows[0] });
}
