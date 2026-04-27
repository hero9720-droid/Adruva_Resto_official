import { Router } from 'express';
import * as StaffController from './staff.controller';
import * as LeaveController from './leave.controller';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireActiveSubscription);

// Staff list
router.get('/list', StaffController.getStaff);

// Create Staff
router.post('/territory/reports', requireRole(['area_manager']), StaffController.submitTerritoryReport);

// Employee Performance Index (EPI)
router.get('/performance/leaderboard', requireRole(['outlet_manager', 'chain_owner']), StaffController.getEPILeaderboard);
router.get('/:id/insights', requireRole(['outlet_manager', 'chain_owner']), StaffController.getStaffInsights);
router.post('/performance/sync', requireRole(['outlet_manager']), StaffController.triggerEPISync);

// Attendance
router.get('/attendance',     StaffController.getAttendance);
router.get('/current-status', StaffController.getAttendanceStatus);
router.post('/clock-in',      StaffController.attendanceClockIn);
router.post('/clock-out',     StaffController.attendanceClockOut);

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
router.get('/performance/leaderboard', StaffController.getGamificationLeaderboard);
router.get('/performance/my-stats', StaffController.getMyPerformanceStats);

// Territory & Area Management
router.get('/territory/overview', StaffController.getTerritoryOverview);
router.post('/territory/field-report', StaffController.submitFieldReport);

// Duty Cycles & Attendance
router.post('/duty/clock-in', StaffController.dutyClockIn);
router.post('/duty/clock-out', StaffController.dutyClockOut);
router.get('/duty/live-roster', StaffController.getLiveRoster);

// Shift Verification
router.get('/shifts/unverified', requireRole(['outlet_manager']), StaffController.getShiftsToVerify);
router.post('/shifts/verify',     requireRole(['outlet_manager']), StaffController.verifyShift);

// Leave Management
router.get('/leaves', LeaveController.getLeaveRequests);
router.post('/leaves/request', LeaveController.requestLeave);
router.post('/leaves/:id/status', requireRole(['outlet_manager']), LeaveController.updateLeaveStatus);

export default router;
