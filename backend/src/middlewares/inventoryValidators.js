import { body } from 'express-validator';
import { validateResults } from './validators.js';

export const createPartValidator = [
  body('partNo')
    .trim()
    .notEmpty()
    .withMessage('Part number is required'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Part name is required'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Initial stock count must be a non-negative integer'),

  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum alert threshold must be a non-negative integer'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Inventory category is required'),

  validateResults
];

export const updatePartValidator = [
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum threshold must be a non-negative integer'),

  validateResults
];

export const adjustStockValidator = [
  body('quantity')
    .notEmpty()
    .withMessage('Adjustment quantity is required')
    .isInt({ min: 0 })
    .withMessage('Adjustment quantity must be a non-negative integer'),

  body('type')
    .notEmpty()
    .withMessage('Adjustment type is required')
    .isIn(['INCREASE', 'DECREASE', 'ADJUST'])
    .withMessage('Invalid adjustment type. Allowed: INCREASE, DECREASE, ADJUST'),

  validateResults
];

export const allocatePartValidator = [
  body('partId')
    .notEmpty()
    .withMessage('Part ID is required')
    .isInt()
    .withMessage('Part ID must be an integer'),

  body('jobCardId')
    .trim()
    .notEmpty()
    .withMessage('Job card identifier is required'),

  body('quantity')
    .notEmpty()
    .withMessage('Allocation quantity is required')
    .isInt({ min: 1 })
    .withMessage('Allocation quantity must be at least 1 unit'),

  validateResults
];
