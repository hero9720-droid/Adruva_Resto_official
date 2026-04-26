import { Router } from 'express';
import { globalSearch } from './search.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.get('/global', verifyToken, globalSearch);

export default router;
