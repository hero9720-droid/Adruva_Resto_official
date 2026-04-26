import { Router } from 'express';
import * as DeliveryController from './delivery.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

// Public Webhook (in production, use API Key / HMAC verification)
router.post('/webhook/ingest', DeliveryController.ingestExternalOrder);

// Protected Analytics
router.use(verifyToken);
router.get('/platforms', DeliveryController.listPlatforms);
router.get('/analytics', DeliveryController.getChannelAnalytics);

export default router;
