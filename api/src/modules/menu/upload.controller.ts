import { Request, Response } from 'express';
import { getPresignedUploadUrl } from '../../lib/r2';

export async function getUploadUrl(req: Request, res: Response) {
  const { fileName, contentType } = req.query;

  if (!fileName || !contentType) {
    return res.status(400).json({ success: false, error: 'fileName and contentType are required' });
  }

  const result = await getPresignedUploadUrl(fileName as string, contentType as string);

  res.json({
    success: true,
    data: result
  });
}
