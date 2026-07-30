import { sendError } from '../utils/responseHelper.js';

/**
 * Global Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error stack trace for debugging
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server';
  const errors = process.env.NODE_ENV === 'development' ? err.stack : null;

  return sendError(res, statusCode, message, errors);
};

export default errorHandler;
