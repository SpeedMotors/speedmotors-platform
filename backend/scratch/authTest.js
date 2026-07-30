import * as authService from '../src/services/auth.service.js';
import { generateToken, verifyToken } from '../src/utils/jwt.js';
import { restrictTo } from '../src/middlewares/role.middleware.js';
import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma.js';

// Setup Mock environment variables in case they are not loaded
process.env.JWT_SECRET = process.env.JWT_SECRET || 'speedmotors_super_secret_key_123!';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function runTests() {
  console.log('================================================');
  console.log(' STARTING AUTHENTICATION MODULE LOGICAL VERIFICATION');
  console.log('================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`✓ [PASS] ${message}`);
      passed++;
    } else {
      console.log(`✗ [FAIL] ${message}`);
      failed++;
    }
  };

  // Test Case 1: JWT sign & verify
  try {
    const payload = { userId: 42, role: 'ADMIN' };
    const token = generateToken(payload);
    assert(typeof token === 'string', 'JWT Token generation returns a string');

    const decoded = verifyToken(token);
    assert(decoded.userId === 42 && decoded.role === 'ADMIN', 'JWT Token verification decodes payload accurately');
  } catch (e) {
    console.error('Test 1 failed with error:', e);
    failed++;
  }

  // Test Case 2: Role Authorization Middleware
  try {
    const middleware = restrictTo('admin', 'sales');
    let nextCalled = false;
    const mockReq = {
      user: { role: 'ADMIN' }
    };
    const mockRes = {};
    const mockNext = () => { nextCalled = true; };

    middleware(mockReq, mockRes, mockNext);
    assert(nextCalled, 'role.middleware allows allowed roles');

    let forbiddenCalled = false;
    const mockForbiddenRes = {
      status: (code) => {
        assert(code === 403, 'role.middleware returns 403 for forbidden roles');
        return {
          json: (data) => {
            assert(data.success === false, 'role.middleware returns failure JSON format');
            forbiddenCalled = true;
          }
        };
      }
    };

    const mockReqForbidden = {
      user: { role: 'CUSTOMER' }
    };

    const forbiddenMiddleware = restrictTo('admin', 'sales');
    forbiddenMiddleware(mockReqForbidden, mockForbiddenRes, () => {});
    assert(forbiddenCalled, 'role.middleware correctly blocks unauthorized roles');
  } catch (e) {
    console.error('Test 2 failed with error:', e);
    failed++;
  }

  // Test Case 3: Password Hashing with bcrypt
  try {
    const password = 'mySecurePassword123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    assert(hash !== password, 'bcrypt hashes the password (hash is not equal to raw password)');
    
    const isMatch = await bcrypt.compare(password, hash);
    assert(isMatch, 'bcrypt matches raw password against hashed password');

    const isDifferent = await bcrypt.compare('wrongPassword', hash);
    assert(!isDifferent, 'bcrypt rejects non-matching passwords');
  } catch (e) {
    console.error('Test 3 failed with error:', e);
    failed++;
  }

  // Test Case 4: Service layer mock testing
  try {
    const mockUser = {
      id: 10,
      name: 'Test Executive',
      email: 'sales@speedmotors.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SALES',
      createdAt: new Date()
    };

    // Mock prisma client database methods
    prisma.user.findUnique = async ({ where }) => {
      if (where.email === 'sales@speedmotors.com') {
        return mockUser;
      }
      return null;
    };

    prisma.user.create = async ({ data }) => {
      return {
        id: 11,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date()
      };
    };

    // Test register service
    const regResult = await authService.register({
      name: 'New Customer',
      email: 'newcustomer@example.com',
      password: 'password123',
      role: 'customer'
    });
    
    assert(regResult.user.email === 'newcustomer@example.com', 'register service creates user successfully');
    assert(regResult.user.role === 'customer', 'register service formats role as lowercase');
    assert(typeof regResult.token === 'string', 'register service returns a JWT token');

    // Test duplicate registration block
    try {
      await authService.register({
        name: 'Duplicate sales',
        email: 'sales@speedmotors.com',
        password: 'password123'
      });
      assert(false, 'register service should block duplicate emails');
    } catch (error) {
      assert(error.statusCode === 400 && error.message.includes('already registered'), 'register service throws 400 error for duplicate emails');
    }

    // Test login service
    const loginResult = await authService.login({
      email: 'sales@speedmotors.com',
      password: 'password123'
    });

    assert(loginResult.user.id === 10, 'login service finds user correctly');
    assert(loginResult.user.role === 'sales', 'login service formats role as lowercase for frontend compatibility');
    assert(typeof loginResult.token === 'string', 'login service returns signed JWT token');

    // Test login service invalid password block
    try {
      await authService.login({
        email: 'sales@speedmotors.com',
        password: 'wrongpassword'
      });
      assert(false, 'login service should block incorrect passwords');
    } catch (error) {
      assert(error.statusCode === 401 && error.message.includes('Invalid email or password'), 'login service throws 401 error for invalid passwords');
    }

  } catch (e) {
    console.error('Test 4 failed with error:', e);
    failed++;
  }

  console.log('================================================');
  console.log(` VERIFICATION COMPLETE: Passed: ${passed}, Failed: ${failed}`);
  console.log('================================================');
  
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
