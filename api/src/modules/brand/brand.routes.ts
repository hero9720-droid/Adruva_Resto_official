import { Router } from 'express';
import * as BrandController from './brand.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/:chain_id', BrandController.getBrandAssets);
router.patch('/:chain_id/identity', BrandController.updateBrandIdentity);
router.post('/:chain_id/assets', BrandController.uploadBrandAsset);

export default router;
