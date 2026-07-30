import { body } from 'express-validator';
import { validateResults } from './validators.js';

export const createLeadValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),
  
  body('carId')
    .notEmpty()
    .withMessage('Car ID is required')
    .isInt()
    .withMessage('Car ID must be an integer'),
  
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Quoted', 'Won'])
    .withMessage('Invalid lead status. Allowed: New, Contacted, Quoted, Won'),

  body('date')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Date cannot be empty'),

  validateResults
];

export const updateLeadValidator = [
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Quoted', 'Won'])
    .withMessage('Invalid lead status. Allowed: New, Contacted, Quoted, Won'),

  body('date')
    .optional()
    .trim(),

  body('userId')
    .optional()
    .isInt()
    .withMessage('Sales rep ID must be an integer'),

  validateResults
];
