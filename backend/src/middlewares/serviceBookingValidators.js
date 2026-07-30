import { body } from 'express-validator';
import { validateResults } from './validators.js';

export const createBookingValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone number is required'),

  body('make')
    .trim()
    .notEmpty()
    .withMessage('Vehicle brand/make is required'),

  body('model')
    .trim()
    .notEmpty()
    .withMessage('Vehicle model name is required'),

  body('year')
    .notEmpty()
    .withMessage('Vehicle production year is required')
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Please provide a valid vehicle year (1900-2100)'),

  body('date')
    .trim()
    .notEmpty()
    .withMessage('Appointment date is required')
    .isISO8601()
    .withMessage('Please provide a valid date format (YYYY-MM-DD)'),
  
  body('serviceType')
    .trim()
    .notEmpty()
    .withMessage('Service category/type is required'),

  body('issue')
    .optional()
    .trim(),

  validateResults
];

export const updateBookingValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Customer name cannot be empty'),

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Contact phone number cannot be empty'),

  body('make')
    .optional()
    .trim(),

  body('model')
    .optional()
    .trim(),

  body('year')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Please provide a valid year'),

  body('date')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Please provide a valid date format (YYYY-MM-DD)'),

  body('serviceType')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Service type cannot be empty'),

  body('issue')
    .optional()
    .trim(),

  validateResults
];
