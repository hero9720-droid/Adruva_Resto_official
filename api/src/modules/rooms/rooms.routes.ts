import { Router } from 'express';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import * as RoomsController from './rooms.controller';

const router = Router();

router.use(verifyToken);

router.get('/', RoomsController.getRooms);
router.post('/', requireRole(['outlet_manager']), RoomsController.createRoom);
router.patch('/:id', requireRole(['outlet_manager']), RoomsController.updateRoom);
router.post('/:id/check-in', requireRole(['outlet_manager', 'cashier']), RoomsController.checkInGuest);
router.post('/:id/check-out', requireRole(['outlet_manager', 'cashier']), RoomsController.checkOutGuest);

export default router;
