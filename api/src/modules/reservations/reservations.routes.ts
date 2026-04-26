import { Router } from 'express';
import * as ReservationsController from './reservations.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.post('/:outlet_id', ReservationsController.createBooking);
router.get('/:outlet_id', ReservationsController.getReservations);
router.patch('/:id/status', ReservationsController.updateReservationStatus);

export default router;
