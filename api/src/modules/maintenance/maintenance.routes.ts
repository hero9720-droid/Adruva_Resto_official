import { Router } from 'express';
import * as MaintenanceController from './maintenance.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

// Assets
router.post('/assets', MaintenanceController.createAsset);
router.get('/assets', MaintenanceController.getAssets);

// Incidents
router.post('/incidents', MaintenanceController.reportIncident);
router.get('/incidents', MaintenanceController.getIncidents);
router.post('/incidents/:id/resolve', MaintenanceController.resolveIncident);

export default router;
