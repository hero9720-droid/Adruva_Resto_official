import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Upload a buffer to Cloudinary with auto WebP conversion + resize
 * Returns the secure CDN URL
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  originalName: string,
  folder = 'adruva-menu'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',               // Auto convert to WebP
        transformation: [
          { width: 800, height: 800, crop: 'limit' },  // Max 800x800
          { quality: 'auto:good' },                     // Smart quality
          { fetch_format: 'auto' },                     // Best format per browser
        ],
        public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, '')}`,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error', error);
          return reject(error);
        }
        resolve(result!.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}
