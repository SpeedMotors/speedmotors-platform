import { Router } from 'express';
import * as bookingController from '../controllers/serviceBooking.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createBookingValidator, updateBookingValidator } from '../middlewares/serviceBookingValidators.js';

const router = Router();

// Protect all routes
router.use(authMiddleware);

// Book service appointment
router.post('/', createBookingValidator, bookingController.createBooking);

// Fetch bookings list (customers see their own, staff see all)
router.get('/', bookingController.getBookings);

// Edit booking details (customers can only modify their own sessions)
router.patch('/:id', updateBookingValidator, bookingController.updateBooking);

// Cancel booking (customers can only cancel their own sessions)
router.delete('/:id', bookingController.cancelBooking);

export default router;
