import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function uploadToR2(file: Buffer, fileName: string, contentType: string) {
  const key = `${uuidv4()}-${fileName}`;
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    logger.error('R2 Upload Error', error);
    throw error;
  }
}

export async function getPresignedUploadUrl(fileName: string, contentType: string) {
  const key = `${uuidv4()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return {
      uploadUrl: url,
      publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
      key
    };
  } catch (error) {
    logger.error('R2 Presigned URL Error', error);
    throw error;
  }
}
