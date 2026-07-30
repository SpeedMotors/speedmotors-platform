import { Router } from 'express';
import * as jobCardController from '../controllers/jobCard.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import restrictTo from '../middlewares/role.middleware.js';
import { updateJobCardValidator } from '../middlewares/jobCardValidators.js';

const router = Router();

// Protect all routes
router.use(authMiddleware);

// Retrieve job cards (customer context vs staff queue)
router.get('/', jobCardController.getJobCards);

// Retrieve details for a single card
router.get('/:id', jobCardController.getJobCardById);

// Update status, assignee, or costs (role-based parameter restrictions applied inside the service layer)
router.patch('/:id', updateJobCardValidator, jobCardController.updateJobCard);

export default router;
