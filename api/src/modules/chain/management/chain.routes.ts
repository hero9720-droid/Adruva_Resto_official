import { Router } from 'express';
import * as ChainController from './chain.controller';
import * as MasterMenuController from './masterMenu.controller';
import { verifyToken } from '../../../middleware/auth';
import { requireRole } from '../../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['chain_owner', 'chain_admin', 'superadmin']));

router.get('/metrics', ChainController.getChainMetrics);
router.get('/outlets', ChainController.listOutlets);
router.post('/outlets', ChainController.createOutlet);
router.post('/sync-menu', ChainController.syncMasterMenu);

// Master Menu Management
router.get('/master-menu/categories', MasterMenuController.getMasterCategories);
router.post('/master-menu/categories', MasterMenuController.createMasterCategory);
router.get('/master-menu/items', MasterMenuController.getMasterMenuItems);
router.post('/master-menu/items', MasterMenuController.createMasterMenuItem);

export default router;
