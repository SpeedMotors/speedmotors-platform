import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Service to register a new user
 * @param {object} userData - { name, email, password, role }
 */
export const register = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error('Email address already registered');
    error.statusCode = 400;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Default role is CUSTOMER if not provided or admin-override
  const userRole = role ? role.toUpperCase() : 'CUSTOMER';

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: userRole
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  // Generate JWT token
  const token = generateToken({ userId: user.id, role: user.role });

  return {
    user: {
      ...user,
      role: user.role.toLowerCase() // Format to lowercase for frontend compatibility
    },
    token
  };
};

/**
 * Service to log in a user
 * @param {object} credentials - { email, password }
 */
export const login = async (credentials) => {
  const { email, password } = credentials;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken({ userId: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(), // Format to lowercase for frontend compatibility
      createdAt: user.createdAt
    },
    token
  };
};

/**
 * Service to retrieve a user's profile
 * @param {number} userId
 */
export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...user,
    role: user.role.toLowerCase() // Format to lowercase for frontend compatibility
  };
};

/**
 * Service to fetch all registered technicians
 */
export const getTechnicians = async () => {
  return await prisma.user.findMany({
    where: { role: 'TECHNICIAN' },
    select: {
      id: true,
      name: true,
      email: true
    }
  });
};
