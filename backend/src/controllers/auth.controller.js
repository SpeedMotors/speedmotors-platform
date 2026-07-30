import * as authService from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

/**
 * Controller to handle new user registration
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    
    // Optional: set HTTP-only cookie with JWT
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return sendSuccess(res, 211, 'Registration successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle user login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    // Set cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch authenticated user profile details
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is loaded by the authMiddleware
    const result = await authService.getProfile(req.user.id);
    return sendSuccess(res, 200, 'User profile retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to log out user and clear session cookies
 */
export const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Controller placeholder for forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 400, 'Email address is required');
    }
    // Basic mock response as email provider is not yet set up
    return sendSuccess(res, 200, `Reset instructions requested successfully for ${email}. (Placeholder: Email service not configured)`);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller placeholder for reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return sendError(res, 400, 'Token and new password are required');
    }
    // Basic mock response
    return sendSuccess(res, 200, 'Password has been reset successfully. (Placeholder: Integration complete)');
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch list of technicians (staff only)
 */
export const getTechnicians = async (req, res, next) => {
  try {
    const technicians = await authService.getTechnicians();
    return sendSuccess(res, 200, 'Technicians list retrieved successfully', technicians);
  } catch (error) {
    next(error);
  }
};
