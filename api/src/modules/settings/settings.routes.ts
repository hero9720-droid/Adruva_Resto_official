import { Router } from 'express';
import * as SettingsController from './settings.controller';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireActiveSubscription);
router.use(requireRole(['outlet_manager']));

// Outlet Profile
router.get('/',           SettingsController.getOutletSettings);  // GET /api/settings
router.get('/profile',    SettingsController.getOutletSettings);
router.patch('/profile',  SettingsController.updateOutletSettings);

// Tables Management
router.get('/tables',         SettingsController.getTables);
router.post('/tables',        SettingsController.createTable);
router.patch('/tables/:id',   SettingsController.updateTable);

// Legacy zone routes (graceful fallback)
router.get('/zones',                    SettingsController.getZones);
router.post('/zones',                   SettingsController.createZone);
router.get('/zones/:zoneId/tables',     SettingsController.getZoneTables);

export default router;
