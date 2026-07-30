import * as bookingService from '../services/serviceBooking.service.js';
import { sendSuccess } from '../utils/responseHelper.js';

/**
 * Controller to schedule a new service booking appointment
 */
export const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user.id, req.body);
    return sendSuccess(res, 211, 'Service appointment booked successfully', booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch booked appointments (scoped by role checking)
 */
export const getBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getBookings(req.user.id, req.user.role);
    return sendSuccess(res, 200, 'Service bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update scheduled booking settings
 */
export const updateBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBooking(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    return sendSuccess(res, 200, 'Booking details updated successfully', booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to cancel a scheduled booking
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const result = await bookingService.cancelBooking(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, 200, 'Booking cancelled successfully', result);
  } catch (error) {
    next(error);
  }
};
