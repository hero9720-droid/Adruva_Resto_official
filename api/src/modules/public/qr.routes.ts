import { Router } from 'express';
import * as QRController from './qr.controller';

const router = Router();

// This is a PUBLIC route - no verifyToken middleware
router.get('/resolve/:id', QRController.resolveQR);

export default router;
