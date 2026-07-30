import { body } from 'express-validator';
import { validateResults } from './validators.js';

export const updateJobCardValidator = [
  body('status')
    .optional()
    .isIn(['Received', 'Diagnosis', 'Repair', 'QC', 'Ready'])
    .withMessage('Invalid status value. Allowed: Received, Diagnosis, Repair, QC, Ready'),
  
  body('technicianId')
    .optional()
    .custom((val) => {
      if (val === null) return true;
      const num = parseInt(val, 10);
      if (isNaN(num)) {
        throw new Error('Technician ID must be an integer or null');
      }
      return true;
    }),
  
  body('partsCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Parts cost must be a positive number'),

  body('laborCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Labor cost must be a positive number'),

  body('parts')
    .optional()
    .isArray()
    .withMessage('Parts list must be an array of objects'),

  body('expectedCompletion')
    .optional()
    .trim(),

  validateResults
];
