import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import restrictTo from '../middlewares/role.middleware.js';
import {
  createPartValidator,
  updatePartValidator,
  adjustStockValidator,
  allocatePartValidator
} from '../middlewares/inventoryValidators.js';

const router = Router();

// Protect all routes to authenticated users
router.use(authMiddleware);

// Retrieve dashboard KPI summary metrics
router.get('/metrics', restrictTo('ADMIN', 'TECHNICIAN'), inventoryController.getDashboardMetrics);

// Retrieve stock audit history log
router.get('/history', restrictTo('ADMIN', 'TECHNICIAN'), inventoryController.getStockHistory);

// Retrieve stock level alerts
router.get('/alerts/low', restrictTo('ADMIN', 'TECHNICIAN'), inventoryController.getLowStockParts);
router.get('/alerts/out', restrictTo('ADMIN', 'TECHNICIAN'), inventoryController.getOutOfStockParts);

// Part CRUD (Technicians can view catalog, Admins manage catalog items)
router.get('/', restrictTo('ADMIN', 'TECHNICIAN'), inventoryController.getParts);
router.get('/:id', restrictTo('ADMIN', 'TECHNICIAN'), inventoryController.getPartById);

router.post('/', restrictTo('ADMIN'), createPartValidator, inventoryController.createPart);
router.patch('/:id', restrictTo('ADMIN'), updatePartValidator, inventoryController.updatePart);
router.delete('/:id', restrictTo('ADMIN'), inventoryController.deletePart);

// Stock Adjustments
router.post('/:id/adjust', restrictTo('ADMIN', 'TECHNICIAN'), adjustStockValidator, inventoryController.adjustStock);

// Part Allocation to repair job cards
router.post('/allocate', restrictTo('ADMIN', 'TECHNICIAN'), allocatePartValidator, inventoryController.allocatePart);
router.delete('/allocate/:id', restrictTo('ADMIN', 'TECHNICIAN'), inventoryController.removePartAllocation);

export default router;
