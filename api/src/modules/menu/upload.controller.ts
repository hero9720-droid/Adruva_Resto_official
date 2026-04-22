import { Request, Response } from 'express';
import { uploadToCloudinary } from '../../lib/cloudinary';
import multer from 'multer';

// Store file in memory for direct Cloudinary upload
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max (Cloudinary will compress)
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
}).single('file');

export async function uploadMenuPhoto(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const url = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      'adruva-menu'
    );

    res.json({ success: true, data: { url } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Upload failed' });
  }
}
