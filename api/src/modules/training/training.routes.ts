import { Router } from 'express';
import * as TrainingController from './training.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);

// Modules
router.get('/modules', TrainingController.getModules);
router.post('/modules', requireRole(['chain_owner']), TrainingController.createModule);

// Exams
router.get('/modules/:id/exam', TrainingController.getModuleExam);
router.post('/modules/:id/submit', TrainingController.submitExam);

export default router;
