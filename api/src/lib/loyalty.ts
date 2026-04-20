import { PoolClient } from 'pg';

/**
 * Calculates and awards loyalty points based on bill amount.
 * Standard: 1 point per ₹100 spent (can be made configurable later)
 */
export async function awardLoyaltyPoints(
  client: PoolClient, 
  outlet_id: string, 
  chain_id: string,
  customer_id: string, 
  bill_id: string, 
  amount_paise: number
) {
  if (!customer_id) return;

  // 1. Calculate points (1% of amount in rupees)
  const amountRupees = amount_paise / 100;
  const pointsToEarn = Math.floor(amountRupees / 100); // 1 point per 100 Rs

  if (pointsToEarn <= 0) return;

  // 2. Update customer record
  const customerRes = await client.query(
    `UPDATE customers 
     SET loyalty_points = loyalty_points + $1,
         lifetime_spend_paise = lifetime_spend_paise + $2,
         visit_count = visit_count + 1,
         last_visit_at = NOW()
     WHERE id = $3 RETURNING loyalty_points`,
    [pointsToEarn, amount_paise, customer_id]
  );

  const newBalance = customerRes.rows[0].loyalty_points;

  // 3. Record transaction
  await client.query(
    `INSERT INTO loyalty_transactions (
      customer_id, outlet_id, chain_id, bill_id, type, points, balance_after
    ) VALUES ($1, $2, $3, $4, 'earned', $5, $6)`,
    [customer_id, outlet_id, chain_id, bill_id, pointsToEarn, newBalance]
  );

  return pointsToEarn;
}

/**
 * Redeems points for discount.
 * Standard: 10 points = ₹1 (can be made configurable later)
 */
export async function redeemLoyaltyPoints(
  client: PoolClient,
  outlet_id: string,
  chain_id: string,
  customer_id: string,
  points_to_redeem: number
) {
  // 1. Verify balance
  const balRes = await client.query(
    'SELECT loyalty_points FROM customers WHERE id = $1',
    [customer_id]
  );
  
  if (!balRes.rows[0] || balRes.rows[0].loyalty_points < points_to_redeem) {
    throw new Error('Insufficient loyalty points');
  }

  // 2. Deduct points
  const updateRes = await client.query(
    'UPDATE customers SET loyalty_points = loyalty_points - $1 WHERE id = $2 RETURNING loyalty_points',
    [points_to_redeem, customer_id]
  );

  const newBalance = updateRes.rows[0].loyalty_points;

  // 3. Record transaction
  await client.query(
    `INSERT INTO loyalty_transactions (
      customer_id, outlet_id, chain_id, type, points, balance_after
    ) VALUES ($1, $2, $3, 'redeemed', $4, $5)`,
    [customer_id, outlet_id, chain_id, points_to_redeem, newBalance]
  );

  return points_to_redeem / 10; // Return discount amount in Rupees
}
