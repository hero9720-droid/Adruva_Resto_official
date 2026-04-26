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

export default router;
