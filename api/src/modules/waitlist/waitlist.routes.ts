import { Router } from 'express';
import * as WaitlistController from './waitlist.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/active', WaitlistController.getActiveWaitlist);
router.post('/join', WaitlistController.joinWaitlist);
router.post('/:id/call', WaitlistController.callGuest);

export default router;
