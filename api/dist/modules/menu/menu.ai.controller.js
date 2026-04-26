"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMenuItemDescription = generateMenuItemDescription;
exports.getMenuStyles = getMenuStyles;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
async function generateMenuItemDescription(req, res) {
    const { item_id } = req.params;
    const { tone, language = 'english' } = req.body;
    // 1. Get item details
    const item = await db_1.db.query('SELECT name, category_id FROM menu_items WHERE id = $1', [item_id]);
    if (item.rowCount === 0)
        throw new errors_1.AppError(404, 'Item not found', 'NOT_FOUND');
    const itemName = item.rows[0].name;
    // 2. Simulated AI Generation (In real-world, call OpenAI/Gemini here)
    let description = '';
    if (language === 'english') {
        const templates = [
            `A succulent and flavorful ${itemName}, prepared with premium ingredients and our signature spice blend.`,
            `Experience the authentic taste of our ${itemName}, slow-cooked to perfection and served fresh.`,
            `Indulge in this chef-special ${itemName}, a harmonious blend of textures and vibrant flavors.`
        ];
        description = templates[Math.floor(Math.random() * templates.length)];
    }
    else if (language === 'hindi') {
        const templates = [
            `ताज़ा और स्वादिष्ट ${itemName}, हमारे खास मसालों के साथ तैयार किया गया।`,
            `परंपरागत स्वाद के साथ ${itemName}, जिसे बड़ी सावधानी से आपके लिए बनाया गया है।`,
            `बेहतरीन ज़ायके का अनुभव करें हमारे इस खास ${itemName} के साथ।`
        ];
        description = templates[Math.floor(Math.random() * templates.length)];
    }
    // 3. Update the item
    const updateCol = language === 'hindi' ? 'description_hindi' : 'description';
    await db_1.db.query(`UPDATE menu_items SET ${updateCol} = $1, ai_metadata = ai_metadata || '{"generated": true}'::jsonb WHERE id = $2`, [description, item_id]);
    res.json({ success: true, description });
}
async function getMenuStyles(req, res) {
    const result = await db_1.db.query('SELECT * FROM menu_styles');
    res.json({ success: true, data: result.rows });
}
