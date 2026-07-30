import { body, validationResult } from 'express-validator';
import { sendError } from '../utils/responseHelper.js';

/**
 * Middleware to check for validation errors and return standard formatted response
 */
export const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      400,
      'Validation failed. Please correct input errors.',
      errors.array().map((err) => ({ field: err.path, message: err.msg }))
    );
  }
  next();
};

/**
 * Rules for validating registration request
 */
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .toUpperCase()
    .isIn(['CUSTOMER', 'SALES', 'TECHNICIAN', 'ADMIN'])
    .withMessage('Invalid role specified'),

  validateResults
];

/**
 * Rules for validating login request
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validateResults
];
