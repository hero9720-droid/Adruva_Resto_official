import { Router } from 'express';
import * as MenuAIController from './menu.ai.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/styles', MenuAIController.getMenuStyles);
router.post('/generate/:item_id', MenuAIController.generateMenuItemDescription);

export default router;
