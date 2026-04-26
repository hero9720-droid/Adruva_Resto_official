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

// Create Staff
router.post('/create', requireRole(['outlet_manager']), StaffController.createStaff);

// Attendance
router.get('/attendance',     StaffController.getAttendance);
router.get('/current-status', StaffController.getAttendanceStatus);
router.post('/clock-in',      StaffController.clockIn);
router.post('/clock-out',     StaffController.clockOut);

// Weekly Schedule
router.get('/schedule',       StaffController.getSchedule);

// Payroll
router.get('/payroll', requireRole(['outlet_manager']), StaffController.getPayrollSummary);

// Shift Management
router.get('/shifts/summary', requireRole(['cashier', 'outlet_manager']), StaffController.getShiftSummary);
router.post('/shifts/start', requireRole(['cashier', 'outlet_manager']), StaffController.startShift);
router.post('/shifts/end',   requireRole(['cashier', 'outlet_manager']), StaffController.endShift);

// Performance & Analytics
router.get('/performance', requireRole(['outlet_manager']), StaffController.getStaffPerformanceMetrics);

// Shift Verification
router.get('/shifts/unverified', requireRole(['outlet_manager']), StaffController.getShiftsToVerify);
router.post('/shifts/verify',     requireRole(['outlet_manager']), StaffController.verifyShift);

export default router;
