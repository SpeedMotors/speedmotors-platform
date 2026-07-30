import { Router } from 'express';
import * as leadController from '../controllers/lead.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import restrictTo from '../middlewares/role.middleware.js';
import { createLeadValidator, updateLeadValidator } from '../middlewares/leadValidators.js';

const router = Router();

// Protect all routes to authenticated users
router.use(authMiddleware);

// Get leads pipeline (restricted to Sales reps and Admins)
router.get('/', restrictTo('SALES', 'ADMIN'), leadController.getLeads);

// Create a new lead (open to any authenticated user/customer checking quotes or sales rep inputting manually)
router.post('/', createLeadValidator, leadController.createLead);

// Update lead status (restricted to Sales reps and Admins)
router.patch('/:id', restrictTo('SALES', 'ADMIN'), updateLeadValidator, leadController.updateLead);

// Delete lead (restricted to Admins only)
router.delete('/:id', restrictTo('ADMIN'), leadController.deleteLead);

export default router;
