import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import restrictTo from '../middlewares/role.middleware.js';
import { registerValidator, loginValidator } from '../middlewares/validators.js';

const router = Router();

// Public auth endpoints
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Private protected auth endpoints
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/logout', authMiddleware, authController.logout);
router.get('/technicians', authMiddleware, authController.getTechnicians);

// Temporary test route for role middleware validation
router.get('/test-admin', authMiddleware, restrictTo('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin' });
});

export default router;
