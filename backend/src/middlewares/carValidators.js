import { body } from 'express-validator';
import { validateResults } from './validators.js';

export const createCarValidator = [
  body('make')
    .trim()
    .notEmpty()
    .withMessage('Brand/Make is required'),
  
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required'),
  
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Please provide a valid year (1900-2100)'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Please provide a valid positive price'),
  
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Vehicle category/type is required'),
  
  body('power')
    .optional()
    .trim(),

  body('acceleration')
    .optional()
    .trim(),

  body('range')
    .optional()
    .trim(),

  body('topSpeed')
    .optional()
    .trim(),

  validateResults
];

export const updateCarValidator = [
  body('make')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Brand/Make cannot be empty'),
  
  body('model')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Model cannot be empty'),
  
  body('year')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Please provide a valid year (1900-2100)'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Please provide a valid positive price'),
  
  body('type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Vehicle category/type cannot be empty'),

  validateResults
];
