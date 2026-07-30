async function runApiTests() {
  console.log('================================================');
  console.log(' STARTING LIVE END-TO-END AUTHENTICATION API TESTS');
  console.log('================================================');

  const BASE_URL = 'http://localhost:5000/api/auth';
  const testEmail = `tester_${Date.now()}@speedmotors.com`;
  const testPassword = 'Password123!';
  const testName = 'QA Tester';

  let token = '';

  const assert = (condition, message) => {
    if (condition) {
      console.log(`✓ [PASS] ${message}`);
    } else {
      console.log(`✗ [FAIL] ${message}`);
      process.exit(1);
    }
  };

  // 1. Test Base Server Connection
  try {
    const healthRes = await fetch('http://localhost:5000/health');
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200 && healthJson.success === true, 'Health check endpoint returns 200 OK');
  } catch (error) {
    console.error('Failed to connect to health endpoint:', error.message);
    process.exit(1);
  }

  // 2. Test User Registration
  try {
    console.log(`Registering new user: ${testEmail}...`);
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
        role: 'customer'
      })
    });

    const regJson = await regRes.json();
    
    assert(regRes.status === 211 || regRes.status === 201 || regRes.status === 200, `Registration status is success (${regRes.status})`);
    assert(regJson.success === true, 'Registration JSON response success is true');
    assert(regJson.data.user.email === testEmail, 'User email matches in registration response');
    assert(regJson.data.user.role === 'customer', 'User role is formatted as lowercase');
    assert(typeof regJson.data.token === 'string', 'Token returned is a valid string');
  } catch (error) {
    console.error('Registration test failed:', error);
    process.exit(1);
  }

  // 3. Test User Login
  try {
    console.log(`Logging in user: ${testEmail}...`);
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginJson = await loginRes.json();
    
    assert(loginRes.status === 200, 'Login status is 200 OK');
    assert(loginJson.success === true, 'Login JSON response success is true');
    assert(loginJson.data.user.email === testEmail, 'Logged in user email matches');
    assert(typeof loginJson.data.token === 'string', 'Login returns a valid token');
    
    token = loginJson.data.token;
  } catch (error) {
    console.error('Login test failed:', error);
    process.exit(1);
  }

  // 4. Test Protected Profile Route
  try {
    console.log('Accessing protected user profile route...');
    const profileRes = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const profileJson = await profileRes.json();
    
    assert(profileRes.status === 200, 'Profile status is 200 OK with Bearer token');
    assert(profileJson.success === true, 'Profile JSON response success is true');
    assert(profileJson.data.email === testEmail, 'Profile payload email matches the user');
    assert(profileJson.data.role === 'customer', 'Profile payload role is correct');
    assert(profileJson.data.password === undefined, 'Sensitive password hash is hidden in payload');
  } catch (error) {
    console.error('Protected profile test failed:', error);
    process.exit(1);
  }

  // 5. Test Unauthorized Access
  try {
    console.log('Accessing protected route with invalid token...');
    const unauthorizedRes = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid_token'
      }
    });

    const unauthorizedJson = await unauthorizedRes.json();
    assert(unauthorizedRes.status === 401, 'Unauthorized request returns 401');
    assert(unauthorizedJson.success === false, 'Unauthorized JSON response success is false');
  } catch (error) {
    console.error('Unauthorized access test failed:', error);
    process.exit(1);
  }

  console.log('================================================');
  console.log('✓ ALL END-TO-END AUTHENTICATION API TESTS PASSED!');
  console.log('================================================');
}

runApiTests();
