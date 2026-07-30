import * as testDriveService from '../services/testDrive.service.js';
import { sendSuccess } from '../utils/responseHelper.js';

/**
 * Controller to schedule a test drive booking session
 */
export const bookTestDrive = async (req, res, next) => {
  try {
    const booking = await testDriveService.bookTestDrive(req.user.id, req.body);
    return sendSuccess(res, 201, 'Test drive booked successfully', booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch booked test drive sessions (scoped by role check)
 */
export const getTestDrives = async (req, res, next) => {
  try {
    const bookings = await testDriveService.getTestDrives(req.user.id, req.user.role);
    return sendSuccess(res, 200, 'Test drive bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to edit scheduled booking settings
 */
export const updateBooking = async (req, res, next) => {
  try {
    const booking = await testDriveService.updateBooking(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    return sendSuccess(res, 200, 'Booking updated successfully', booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to cancel a booking session
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const result = await testDriveService.cancelBooking(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, 200, 'Booking cancelled successfully', result);
  } catch (error) {
    next(error);
  }
};
