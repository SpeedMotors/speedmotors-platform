import { body } from 'express-validator';
import { validateResults } from './validators.js';

export const bookTestDriveValidator = [
  body('date')
    .trim()
    .notEmpty()
    .withMessage('Booking date is required')
    .isISO8601()
    .withMessage('Please provide a valid date format (YYYY-MM-DD)'),
  
  body('time')
    .trim()
    .notEmpty()
    .withMessage('Booking time is required'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Showroom location is required'),
  
  body('carIds')
    .notEmpty()
    .withMessage('At least one vehicle must be selected')
    .isArray({ min: 1 })
    .withMessage('Vehicle selections must be a non-empty array'),

  validateResults
];

export const updateBookingValidator = [
  body('date')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Please provide a valid date format (YYYY-MM-DD)'),

  body('time')
    .optional()
    .trim(),

  body('location')
    .optional()
    .trim(),

  validateResults
];
