"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVariants = addVariants;
exports.addModifierGroup = addModifierGroup;
const db_1 = require("../../lib/db");
async function addVariants(req, res) {
    const { menu_item_id, variants } = req.body; // variants is array of {name, price_paise, is_default}
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const createdVariants = [];
        for (const v of variants) {
            const res = await client.query(`INSERT INTO menu_item_variants (outlet_id, menu_item_id, name, price_paise, is_default)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`, [outlet_id, menu_item_id, v.name, v.price_paise, v.is_default]);
            createdVariants.push(res.rows[0]);
        }
        return createdVariants;
    });
    res.status(201).json({ success: true, data: result });
}
async function addModifierGroup(req, res) {
    const { menu_item_id, name, is_required, min_select, max_select, modifiers } = req.body;
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // 1. Create Group
        const groupRes = await client.query(`INSERT INTO modifier_groups (outlet_id, menu_item_id, name, is_required, min_select, max_select)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [outlet_id, menu_item_id, name, is_required, min_select, max_select]);
        const group = groupRes.rows[0];
        // 2. Create Modifiers
        const createdModifiers = [];
        for (const m of modifiers) {
            const modRes = await client.query(`INSERT INTO modifiers (outlet_id, group_id, name, extra_price_paise)
         VALUES ($1, $2, $3, $4) RETURNING *`, [outlet_id, group.id, m.name, m.extra_price_paise]);
            createdModifiers.push(modRes.rows[0]);
        }
        return { ...group, modifiers: createdModifiers };
    });
    res.status(201).json({ success: true, data: result });
}
