import { Router } from 'express';
import * as CustomerController from './customer.controller';
import { validateBody } from '../../middleware/validate';
import { customerSchema } from './customer.schema';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';

const router = Router();

router.use(verifyToken);
router.use(requireActiveSubscription);

router.get('/', CustomerController.getCustomers);
router.post('/', CustomerController.createOrUpdateCustomer);
router.get('/phone/:phone', CustomerController.getCustomerByPhone);
router.get('/:id/history', verifyToken, CustomerController.getCustomerHistory);
router.post('/referral/apply', CustomerController.processReferral);
router.get('/social-proof/:outletId', CustomerController.getSocialProof);
router.post('/loyalty/earn', CustomerController.earnLoyaltyPoints);
router.post('/loyalty/redeem', CustomerController.redeemLoyaltyPoints);

export default router;
