import jwt from 'jsonwebtoken';

/**
 * Generates a JSON Web Token for the user
 * @param {object} payload - Data to embed in the token (e.g. { userId, role })
 * @returns {string} The signed JWT
 */
export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verifies a JSON Web Token
 * @param {string} token - The JWT token to verify
 * @returns {object} The decoded token payload
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.verify(token, secret);
};
