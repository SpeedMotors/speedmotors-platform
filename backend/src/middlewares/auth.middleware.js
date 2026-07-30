import prisma from '../config/prisma.js';
import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/responseHelper.js';

/**
 * Protect routes by verifying JWT in authorization header
 */
const authMiddleware = async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Fallback: check cookie if token is sent there
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, 401, 'Access denied. No authentication token provided.');
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database to ensure they still exist and token is valid
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return sendError(res, 401, 'Access denied. User associated with this token no longer exists.');
    }

    // Attach user information to request
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Access token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid authentication token.');
  }
};

export default authMiddleware;
