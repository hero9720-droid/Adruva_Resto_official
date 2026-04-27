import { Router } from 'express';
import * as FeedbackController from './feedback.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

// Public submission (for customers after payment)
router.post('/submit', FeedbackController.submitFeedback);

// Manager routes
router.use(verifyToken);
router.get('/list', FeedbackController.getOutletFeedback);
router.get('/stats', FeedbackController.getFeedbackStats);

// Reputation & AI Sentiment
router.get('/reputation/insights', FeedbackController.getReputationInsights);
router.post('/:id/analyze', FeedbackController.analyzeFeedback);
router.post('/:id/reply', FeedbackController.replyToFeedback);

// Social Reputation Bridge
router.get('/reputation/feed', FeedbackController.getReputationFeed);
router.post('/reputation/:id/approve', FeedbackController.approveSocialReply);
router.post('/reputation/ingest-mock', FeedbackController.ingestMockSocial);

export default router;
