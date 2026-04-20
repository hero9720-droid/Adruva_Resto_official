import { Router } from 'express';
import * as StaffController from './staff.controller';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireActiveSubscription);

// Staff list
router.get('/list', StaffController.getStaff);

// Attendance
router.get('/attendance',  StaffController.getAttendance);
router.post('/clock-in',   StaffController.clockIn);
router.post('/clock-out',  StaffController.clockOut);

// Weekly Schedule
router.get('/schedule',    StaffController.getSchedule);

// Payroll
router.get('/payroll', requireRole(['outlet_manager']), StaffController.getPayrollSummary);

// Shift Management (alias to clock-in/out for POS)
router.post('/shifts/start', requireRole(['cashier', 'outlet_manager']), StaffController.startShift);
router.post('/shifts/end',   requireRole(['cashier', 'outlet_manager']), StaffController.endShift);

export default router;
