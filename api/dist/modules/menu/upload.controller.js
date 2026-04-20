"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadUrl = getUploadUrl;
const r2_1 = require("../../lib/r2");
async function getUploadUrl(req, res) {
    const { fileName, contentType } = req.query;
    if (!fileName || !contentType) {
        return res.status(400).json({ success: false, error: 'fileName and contentType are required' });
    }
    const result = await (0, r2_1.getPresignedUploadUrl)(fileName, contentType);
    res.json({
        success: true,
        data: result
    });
}
