import { Router } from 'express';
import * as EquipmentController from './equipment.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/health', EquipmentController.getHealthStatus);
router.post('/telemetry', EquipmentController.logTelemetry);
router.post('/maintenance/tickets', EquipmentController.createTicket);

export default router;
