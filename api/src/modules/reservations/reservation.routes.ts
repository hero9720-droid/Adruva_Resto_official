import { Router } from 'express';
import * as ReservationController from './reservation.controller';
import { validateBody } from '../../middleware/validate';
import { createReservationSchema, updateReservationStatusSchema } from './reservation.schema';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';

const router = Router();

router.post('/public', validateBody(createReservationSchema), ReservationController.createPublicReservation);

router.use(verifyToken);
router.use(requireActiveSubscription);

router.get('/', ReservationController.getReservations);
router.post('/', validateBody(createReservationSchema), ReservationController.createReservation);
router.patch('/:id/status', validateBody(updateReservationStatusSchema), ReservationController.updateStatus);

export default router;
