async function runCarsVerification() {
  console.log('================================================');
  console.log(' STARTING CARS MODULE INTEGRATION VERIFICATION');
  console.log('================================================');

  const AUTH_URL = 'http://localhost:5000/api/auth';
  const CARS_URL = 'http://localhost:5000/api/cars';

  let adminToken = '';
  let customerToken = '';
  let testCarId = null;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`[OK] ✅ ${message}`);
    } else {
      console.log(`[ERR] ❌ ${message}`);
      process.exit(1);
    }
  };

  // 1. Log in to get tokens
  try {
    console.log('Logging in as Admin...');
    const adminRes = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@admin.com', password: 'password123' })
    });
    const adminJson = await adminRes.json();
    adminToken = adminJson.data.token;

    console.log('Logging in as Customer...');
    const custRes = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@customer.com', password: 'password123' })
    });
    const custJson = await custRes.json();
    customerToken = custJson.data.token;
    
    assert(adminToken && customerToken, 'Tokens retrieved successfully');
  } catch (err) {
    console.error('Login prep failed:', err);
    process.exit(1);
  }

  // 2. Test Admin Authorization - Create Car (Unauthenticated & Forbidden Role checks)
  console.log('\n--- 2. Testing Admin Authorization on Write Endpoints ---');
  try {
    // Unauthenticated (No Token)
    const unauthRes = await fetch(CARS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ make: 'Fake', model: 'Model X', year: 2026, price: 10000, type: 'SUV' })
    });
    assert(unauthRes.status === 401, 'POST /cars without token returns 401 (Unauthorized)');

    // Forbidden (Customer Token)
    const forbiddenRes = await fetch(CARS_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ make: 'Fake', model: 'Model X', year: 2026, price: 10000, type: 'SUV' })
    });
    assert(forbiddenRes.status === 403, 'POST /cars with customer token returns 403 (Forbidden)');
  } catch (err) {
    console.error('Authorization checks failed:', err);
    process.exit(1);
  }

  // 3. Test Create Car (Admin only)
  console.log('\n--- 3. Testing Create Car (Admin) ---');
  try {
    const createRes = await fetch(CARS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        make: 'SpeedMotors',
        model: 'Carbon GT',
        year: 2026,
        price: 95000,
        type: 'Coupe',
        power: '650 hp',
        acceleration: '0-60 in 3.1s',
        range: '310 miles',
        topSpeed: '185 mph'
      })
    });
    const createJson = await createRes.json();
    assert(createRes.status === 201, 'POST /cars creates a car and returns 201 (Created)');
    assert(createJson.success === true, 'Response payload success is true');
    assert(createJson.data.model === 'Carbon GT', 'Created car model matches');
    assert(createJson.data.image.startsWith('http'), 'Created car has default thumbnail image url');
    testCarId = createJson.data.id;
  } catch (err) {
    console.error('Create Car test failed:', err);
    process.exit(1);
  }

  // 4. Test Get Cars (Public endpoint)
  console.log('\n--- 4. Testing Get Cars (Public) ---');
  try {
    const getRes = await fetch(CARS_URL);
    const getJson = await getRes.json();
    assert(getRes.status === 200, 'GET /cars returns 200 (OK)');
    assert(getJson.success === true, 'Response payload success is true');
    assert(Array.isArray(getJson.data.cars), 'Response data contains cars array');
    assert(getJson.data.pagination.totalItems >= 7, 'Database has at least 7 seeded/created cars');
  } catch (err) {
    console.error('Get Cars test failed:', err);
    process.exit(1);
  }

  // 5. Test Get Car By ID (Public endpoint)
  console.log('\n--- 5. Testing Get Car By ID (Public) ---');
  try {
    const getByIdRes = await fetch(`${CARS_URL}/${testCarId}`);
    const getByIdJson = await getByIdRes.json();
    assert(getByIdRes.status === 200, 'GET /cars/:id returns 200 (OK)');
    assert(getByIdJson.success === true, 'Response payload success is true');
    assert(getByIdJson.data.id === testCarId, 'Car details ID matches requested ID');
  } catch (err) {
    console.error('Get Car By ID test failed:', err);
    process.exit(1);
  }

  // 6. Test Search, Filters, Sorting, and Pagination
  console.log('\n--- 6. Testing Search, Filtering, Sorting, and Pagination ---');
  try {
    // A. Search by Model or Make
    const searchRes = await fetch(`${CARS_URL}?search=Carbon`);
    const searchJson = await searchRes.json();
    assert(searchJson.data.cars.length === 1 && searchJson.data.cars[0].model === 'Carbon GT', 'GET /cars?search=Carbon searches model correctly');

    // B. Filter by Category
    const categoryRes = await fetch(`${CARS_URL}?type=SUV`);
    const categoryJson = await categoryRes.json();
    const allSUVs = categoryJson.data.cars.every(car => car.type.toUpperCase() === 'SUV');
    assert(allSUVs && categoryJson.data.cars.length > 0, 'GET /cars?type=SUV filters category correctly');

    // C. Filter by Price Range
    const priceRes = await fetch(`${CARS_URL}?minPrice=30000&maxPrice=60000`);
    const priceJson = await priceRes.json();
    const correctPrices = priceJson.data.cars.every(car => car.price >= 30000 && car.price <= 60000);
    assert(correctPrices && priceJson.data.cars.length > 0, 'GET /cars?minPrice=30000&maxPrice=60000 filters price range correctly');

    // D. Pagination
    const pageRes = await fetch(`${CARS_URL}?page=1&limit=2`);
    const pageJson = await pageRes.json();
    assert(pageJson.data.cars.length === 2, 'GET /cars?page=1&limit=2 respects limit correctly');
    assert(pageJson.data.pagination.currentPage === 1 && pageJson.data.pagination.limit === 2, 'Pagination metadata is accurate');

    // E. Sorting
    const sortRes = await fetch(`${CARS_URL}?sortBy=price&sortOrder=asc`);
    const sortJson = await sortRes.json();
    const isSorted = sortJson.data.cars.slice(1).every((car, i) => car.price >= sortJson.data.cars[i].price);
    assert(isSorted, 'GET /cars?sortBy=price&sortOrder=asc sorts ascending correctly');

  } catch (err) {
    console.error('Filters verification failed:', err);
    process.exit(1);
  }

  // 7. Test Update Car (Admin only)
  console.log('\n--- 7. Testing Update Car (Admin) ---');
  try {
    const updateRes = await fetch(`${CARS_URL}/${testCarId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        price: 99000,
        model: 'Carbon GT Sport'
      })
    });
    const updateJson = await updateRes.json();
    assert(updateRes.status === 200, 'PUT /cars/:id returns 200 (OK)');
    assert(updateJson.success === true, 'Response payload success is true');
    assert(updateJson.data.price === 99000 && updateJson.data.model === 'Carbon GT Sport', 'Hoped details updated correctly');
  } catch (err) {
    console.error('Update Car test failed:', err);
    process.exit(1);
  }

  // 8. Test Delete Car (Admin only)
  console.log('\n--- 8. Testing Delete Car (Admin) ---');
  try {
    const deleteRes = await fetch(`${CARS_URL}/${testCarId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const deleteJson = await deleteRes.json();
    assert(deleteRes.status === 200, 'DELETE /cars/:id returns 200 (OK)');
    assert(deleteJson.success === true, 'Response payload success is true');
    
    // Verify it is gone
    const verifyRes = await fetch(`${CARS_URL}/${testCarId}`);
    assert(verifyRes.status === 404, 'Deleted car is no longer accessible (returns 404)');
  } catch (err) {
    console.error('Delete Car test failed:', err);
    process.exit(1);
  }

  console.log('\n================================================');
  console.log('🎉 ALL CARS MODULE INTEGRATION TESTS PASSED!');
  console.log('================================================');
  process.exit(0);
}

runCarsVerification();
