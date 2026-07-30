import { sendError } from '../utils/responseHelper.js';

/**
 * Restricts access to specific user roles
 * @param {...string} allowedRoles - Allowed roles (e.g. 'ADMIN', 'CUSTOMER')
 */
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Access denied. User not authenticated.');
    }

    const userRole = req.user.role.toUpperCase();
    const upperAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

    if (!upperAllowedRoles.includes(userRole)) {
      return sendError(res, 403, 'Forbidden. You do not have permission to access this resource.');
    }

    next();
  };
};

export default restrictTo;
