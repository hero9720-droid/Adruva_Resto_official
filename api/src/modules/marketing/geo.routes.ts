import { Router } from 'express';
import * as GeoController from './geo.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/:chain_id/campaigns', GeoController.getGeoCampaigns);
router.post('/:chain_id/campaigns', GeoController.createGeoCampaign);
router.post('/events', GeoController.trackGeoEvent);
router.get('/:chain_id/analytics', GeoController.getGeoAnalytics);

export default router;
