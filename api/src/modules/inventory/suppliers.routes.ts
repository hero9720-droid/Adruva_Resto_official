import { Router } from 'express';
import * as SuppliersController from './suppliers.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/:chain_id', SuppliersController.getSuppliers);
router.get('/:supplier_id/ledger', SuppliersController.getSupplierLedger);
router.post('/:supplier_id/payments', SuppliersController.recordVendorPayment);
router.get('/:chain_id/dues', SuppliersController.getBulkVendorDues);

export default router;
