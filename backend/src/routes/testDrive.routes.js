import { Router } from 'express';
import * as testDriveController from '../controllers/testDrive.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { bookTestDriveValidator, updateBookingValidator } from '../middlewares/testDriveValidators.js';

const router = Router();

// Protect all routes
router.use(authMiddleware);

// Book a test drive
router.post('/', bookTestDriveValidator, testDriveController.bookTestDrive);

// Fetch test drive bookings (customers get their own list, sales/admins get all bookings)
router.get('/', testDriveController.getTestDrives);

// Update a booking (customers can only modify their own sessions)
router.patch('/:id', updateBookingValidator, testDriveController.updateBooking);

// Cancel a booking (customers can only cancel their own sessions)
router.delete('/:id', testDriveController.cancelBooking);

export default router;
