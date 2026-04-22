"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
exports.uploadMenuPhoto = uploadMenuPhoto;
const cloudinary_1 = require("../../lib/cloudinary");
const multer_1 = __importDefault(require("multer"));
// Store file in memory for direct Cloudinary upload
const storage = multer_1.default.memoryStorage();
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max (Cloudinary will compress)
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
}).single('file');
async function uploadMenuPhoto(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        const url = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, req.file.originalname, 'adruva-menu');
        res.json({ success: true, data: { url } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Upload failed' });
    }
}
