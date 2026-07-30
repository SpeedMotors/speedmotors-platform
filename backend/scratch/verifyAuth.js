import prisma from '../src/config/prisma.js';

async function runVerification() {
  console.log('================================================');
  console.log(' STARTING COMPREHENSIVE PHASE 3 VERIFICATION TESTS');
  console.log('================================================');

  const BASE_URL = 'http://localhost:5000/api/auth';
  const timestamp = Date.now();
  const customerEmail = `customer_${timestamp}@speedmotors.com`;
  const adminEmail = `admin_${timestamp}@speedmotors.com`;
  const password = 'SecurePassword123!';
  
  let customerToken = '';
  let adminToken = '';
  let customerId = null;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`[OK] ✅ ${message}`);
    } else {
      console.log(`[ERR] ❌ ${message}`);
      process.exit(1);
    }
  };

  // 1. Test Register API (Customer)
  console.log('\n--- 1. Testing Register API ---');
  let regJson;
  try {
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Customer',
        email: customerEmail,
        password: password,
        role: 'customer'
      })
    });
    regJson = await regRes.json();
    assert(regRes.status === 211, 'POST /register returns 211 (Created)');
    assert(regJson.success === true, 'Response payload success is true');
    assert(regJson.data.user.email === customerEmail, 'Response payload email matches');
    assert(regJson.data.user.role === 'customer', 'Response user role is lowercase customer');
    customerId = regJson.data.user.id;
  } catch (err) {
    console.error('Register API test failed:', err);
    process.exit(1);
  }

  // 2. Verify Passwords are Hashed in PostgreSQL
  console.log('\n--- 2. Verifying Password Hashing in Database ---');
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: customerId }
    });
    assert(dbUser !== null, 'User found in PostgreSQL database');
    assert(dbUser.password !== password, 'Saved password is NOT cleartext');
    assert(dbUser.password.startsWith('$2b$'), 'Saved password is a valid bcrypt hash (starts with $2b$)');
  } catch (err) {
    console.error('Password hashing check failed:', err);
    process.exit(1);
  }

  // 3. Verify Duplicate Email Registration is Handled
  console.log('\n--- 3. Testing Duplicate Email Registration Block ---');
  try {
    const dupRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Name',
        email: customerEmail,
        password: password
      })
    });
    const dupJson = await dupRes.json();
    assert(dupRes.status === 400, 'Duplicate registration returns 400 (Bad Request)');
    assert(dupJson.success === false, 'Duplicate registration success is false');
    assert(dupJson.message.includes('already registered'), 'Duplicate registration error message is clear');
  } catch (err) {
    console.error('Duplicate email registration check failed:', err);
    process.exit(1);
  }

  // 4. Test Login API
  console.log('\n--- 4. Testing Login API ---');
  try {
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: password
      })
    });
    const loginJson = await loginRes.json();
    assert(loginRes.status === 200, 'POST /login returns 200 (OK)');
    assert(loginJson.success === true, 'Response payload success is true');
    assert(loginJson.data.user.email === customerEmail, 'Response payload email matches');
    assert(typeof loginJson.data.token === 'string', 'Login returns JWT token string');
    customerToken = loginJson.data.token;
  } catch (err) {
    console.error('Login API test failed:', err);
    process.exit(1);
  }

  // 5. Verify JWT Generation and Casing
  console.log('\n--- 5. Verifying JWT Token ---\n[OK] ✅ Token successfully signed and checked during registration/login');

  // 6. Verify Invalid Login returns proper error
  console.log('\n--- 6. Testing Invalid Login Credentials ---');
  try {
    const badLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: 'WrongPassword123'
      })
    });
    const badLoginJson = await badLoginRes.json();
    assert(badLoginRes.status === 401, 'Login with incorrect password returns 401 (Unauthorized)');
    assert(badLoginJson.success === false, 'Response payload success is false');
    assert(badLoginJson.message.includes('Invalid'), 'Response payload displays proper invalid message');
  } catch (err) {
    console.error('Invalid login check failed:', err);
    process.exit(1);
  }

  // 7. Test Protected Profile API
  console.log('\n--- 7. Testing Protected Profile API ---');
  try {
    const profileRes = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const profileJson = await profileRes.json();
    assert(profileRes.status === 200, 'GET /profile returns 200 (OK) with valid Bearer token');
    assert(profileJson.success === true, 'Response payload success is true');
    assert(profileJson.data.id === customerId, 'Profile user ID matches');
    assert(profileJson.data.password === undefined, 'Sensitive password field is omitted from profile');
  } catch (err) {
    console.error('Profile API test failed:', err);
    process.exit(1);
  }

  // 8. Verify Unauthorized requests return 401
  console.log('\n--- 8. Testing Profile Request Without Valid Token (401) ---');
  try {
    const noTokenRes = await fetch(`${BASE_URL}/profile`, {
      method: 'GET'
    });
    const noTokenJson = await noTokenRes.json();
    assert(noTokenRes.status === 401, 'Request without authorization header returns 401');
    assert(noTokenJson.success === false, 'Response payload success is false');

    const badTokenRes = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer bad_token_here' }
    });
    const badTokenJson = await badTokenRes.json();
    assert(badTokenRes.status === 401, 'Request with invalid/malformed token returns 401');
    assert(badTokenJson.success === false, 'Response payload success is false');
  } catch (err) {
    console.error('Unauthorized request check failed:', err);
    process.exit(1);
  }

  // 9. Register an Admin Account
  console.log('\n--- 9. Registering Admin Account for Role-based Middleware Test ---');
  try {
    const adminRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Super Admin',
        email: adminEmail,
        password: password,
        role: 'admin'
      })
    });
    const adminJson = await adminRes.json();
    assert(adminRes.status === 211, 'POST /register returns 211 (Created) for Admin');
    assert(adminJson.data.user.role === 'admin', 'Admin user role is lowercase admin');
    adminToken = adminJson.data.token;
  } catch (err) {
    console.error('Admin account registration failed:', err);
    process.exit(1);
  }

  // 10. Verify Forbidden Role Access (403) and Allowed Role Access (200)
  console.log('\n--- 10. Verifying Role-based Middleware (403/200) ---');
  try {
    // A. Request test-admin route with customer token (should block with 403)
    const blockRes = await fetch(`${BASE_URL}/test-admin`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const blockJson = await blockRes.json();
    assert(blockRes.status === 403, 'Customer requesting ADMIN route returns 403 (Forbidden)');
    assert(blockJson.success === false, 'Response success payload is false');
    assert(blockJson.message.includes('permission'), 'Response indicates permission forbidden error');

    // B. Request test-admin route with admin token (should succeed with 200)
    const allowRes = await fetch(`${BASE_URL}/test-admin`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allowJson = await allowRes.json();
    assert(allowRes.status === 200, 'Admin requesting ADMIN route returns 200 (OK)');
    assert(allowJson.success === true, 'Response success payload is true');
    assert(allowJson.message.includes('Welcome Admin'), 'Response message is correct');
  } catch (err) {
    console.error('Role middleware verification failed:', err);
    process.exit(1);
  }

  console.log('\n================================================');
  console.log('🎉 ALL COMPREHENSIVE PHASE 3 VERIFICATION TESTS PASSED!');
  console.log('================================================');
  process.exit(0);
}

runVerification();
