import { Router } from 'express';
import * as carController from '../controllers/car.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import restrictTo from '../middlewares/role.middleware.js';
import { upload, handleUploadErrors } from '../middlewares/upload.middleware.js';
import { createCarValidator, updateCarValidator } from '../middlewares/carValidators.js';

const router = Router();

// Publicly readable endpoints
router.get('/', carController.getCars);
router.get('/:id', carController.getCarById);

// Admin-only write endpoints (authenticated with ADMIN role)
router.post(
  '/',
  authMiddleware,
  restrictTo('ADMIN'),
  upload.array('images', 5),
  handleUploadErrors,
  createCarValidator,
  carController.createCar
);

router.put(
  '/:id',
  authMiddleware,
  restrictTo('ADMIN'),
  upload.array('images', 5),
  handleUploadErrors,
  updateCarValidator,
  carController.updateCar
);

router.delete(
  '/:id',
  authMiddleware,
  restrictTo('ADMIN'),
  carController.deleteCar
);

export default router;
