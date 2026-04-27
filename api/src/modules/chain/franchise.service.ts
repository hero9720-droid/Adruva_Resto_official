import { db } from '../../lib/db';

export async function getFranchiseOverview(chain_id: string) {
  const outlets = await db.query(`
    SELECT 
      o.id, 
      o.name, 
      o.franchise_model,
      o.royalty_percentage,
      COALESCE(SUM(b.total_paise), 0) as current_month_sales_paise
    FROM outlets o
    LEFT JOIN bills b ON b.outlet_id = o.id AND TO_CHAR(b.created_at, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')
    WHERE o.chain_id = $1
    GROUP BY o.id
  `, [chain_id]);

  const royalties = await db.query(`
    SELECT 
      status, 
      SUM(royalty_amount_paise + fixed_fee_paise) as total_paise,
      COUNT(*) as count
    FROM franchise_royalty_invoices
    WHERE chain_id = $1
    GROUP BY status
  `, [chain_id]);

  return {
    outlets: outlets.rows,
    royaltySummary: royalties.rows
  };
}

export async function generateRoyaltyInvoices(chain_id: string, month: string) {
  const outlets = await db.query(`
    SELECT id, royalty_percentage, fixed_monthly_fee_paise 
    FROM outlets WHERE chain_id = $1
  `, [chain_id]);

  let invoicesCreated = 0;
  for (const outlet of outlets.rows) {
    const salesRes = await db.query(`
      SELECT COALESCE(SUM(total_paise), 0) as total 
      FROM bills WHERE outlet_id = $1 AND TO_CHAR(created_at, 'YYYY-MM') = $2
    `, [outlet.id, month]);

    const totalSales = parseInt(salesRes.rows[0].total);
    const royaltyAmount = Math.round(totalSales * (outlet.royalty_percentage / 100));

    await db.query(`
      INSERT INTO franchise_royalty_invoices (
        chain_id, outlet_id, invoice_number, period_month, 
        total_sales_paise, royalty_amount_paise, fixed_fee_paise, due_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '10 days')
      ON CONFLICT (invoice_number) DO NOTHING
    `, [
      chain_id, outlet.id, `ROY-${outlet.id.slice(0, 4)}-${month}`, month,
      totalSales, royaltyAmount, outlet.fixed_monthly_fee_paise
    ]);
    invoicesCreated++;
  }
  return { invoicesCreated };
}
