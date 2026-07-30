import prisma from '../src/config/prisma.js';

async function runServiceRepairVerification() {
  console.log('================================================');
  console.log(' STARTING SERVICE & REPAIR INTEGRATION TESTS');
  console.log('================================================');

  const AUTH_URL = 'http://localhost:5000/api/auth';
  const BOOKINGS_URL = 'http://localhost:5000/api/service-bookings';
  const JOBCARDS_URL = 'http://localhost:5000/api/job-cards';

  let adminToken = '';
  let customerToken = '';
  let technicianToken = '';
  
  let adminId = null;
  let customerId = null;
  let technicianId = null;

  let testBookingId = null;
  let testJobCardId = null;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`[OK] ✅ ${message}`);
    } else {
      console.log(`[ERR] ❌ ${message}`);
      process.exit(1);
    }
  };

  // 1. Log in to get tokens & user IDs
  try {
    console.log('Retrieving account sessions...');
    const adminRes = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@admin.com', password: 'password123' })
    });
    const adminJson = await adminRes.json();
    adminToken = adminJson.data.token;
    adminId = adminJson.data.user.id;

    const custRes = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@customer.com', password: 'password123' })
    });
    const custJson = await custRes.json();
    customerToken = custJson.data.token;
    customerId = custJson.data.user.id;

    const techRes = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@technician.com', password: 'password123' })
    });
    const techJson = await techRes.json();
    technicianToken = techJson.data.token;
    technicianId = techJson.data.user.id;

    assert(adminToken && customerToken && technicianToken, 'Tokens retrieved successfully');
  } catch (err) {
    console.error('Session retrieval failed:', err);
    process.exit(1);
  }

  // 2. Test Booking - Create Booking (Customer)
  console.log('\n--- 2. Testing Create Service Booking & Auto-JobCard ---');
  try {
    const createRes = await fetch(BOOKINGS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        name: 'Valued Customer',
        phone: '123-456-7890',
        make: 'SpeedMotors',
        model: 'Aero Sedan',
        year: 2026,
        date: '2026-08-12',
        serviceType: 'Routine Maintenance',
        issue: 'Engine oil replacement and general check'
      })
    });
    const createJson = await createRes.json();
    assert(createRes.status === 211, 'POST /service-bookings creates appointment (211 Created)');
    assert(createJson.success === true, 'Response payload success is true');
    assert(createJson.data.serviceType === 'Routine Maintenance', 'Service type matches');
    testBookingId = createJson.data.id;

    // Verify a Job Card was automatically created in the database
    const dbJc = await prisma.jobCard.findUnique({
      where: { serviceBookingId: testBookingId }
    });
    assert(dbJc !== null, 'Autointegration: A pending Job Card was automatically created in PostgreSQL');
    assert(dbJc.status === 'Received', 'Job Card initial status is "Received"');
    testJobCardId = dbJc.id;
  } catch (err) {
    console.error('Create Booking failed:', err);
    process.exit(1);
  }

  // 3. Test Booking - Get Bookings (Customer Scoping Check)
  console.log('\n--- 3. Testing Get Bookings (Customer Scoping) ---');
  try {
    // Customer gets only their own bookings
    const custGetRes = await fetch(BOOKINGS_URL, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const custGetJson = await custGetRes.json();
    assert(custGetRes.status === 200, 'GET /service-bookings with CUSTOMER returns 200 (OK)');
    assert(custGetJson.data.every(b => b.userId === customerId), 'Customer sees only their own appointments');

    // Admin/Service staff gets all bookings
    const adminGetRes = await fetch(BOOKINGS_URL, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminGetJson = await adminGetRes.json();
    assert(adminGetRes.status === 200, 'GET /service-bookings with ADMIN returns 200 (OK)');
    assert(adminGetJson.data.length >= 1, 'Admin can query global shop bookings schedule');
  } catch (err) {
    console.error('Get Bookings scoping failed:', err);
    process.exit(1);
  }

  // 4. Test JobCards - Fetch Queue (Technician)
  console.log('\n--- 4. Testing Get Job Cards (Technician) ---');
  try {
    const techJcRes = await fetch(JOBCARDS_URL, {
      headers: { 'Authorization': `Bearer ${technicianToken}` }
    });
    const techJcJson = await techJcRes.json();
    assert(techJcRes.status === 200, 'GET /job-cards with TECHNICIAN returns 200 (OK)');
    assert(Array.isArray(techJcJson.data), 'Returns array of active job cards');
    assert(techJcJson.data.some(jc => jc.id === testJobCardId), 'Technician queue includes the auto-generated Job Card');
  } catch (err) {
    console.error('Get Job Cards failed:', err);
    process.exit(1);
  }

  // 5. Test JobCards - Update Card & Status & Assign Tech (Technician)
  console.log('\n--- 5. Testing Update Job Card (Technician) ---');
  try {
    const updateRes = await fetch(`${JOBCARDS_URL}/${testJobCardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${technicianToken}`
      },
      body: JSON.stringify({
        status: 'Repair',
        technicianId: technicianId,
        expectedCompletion: 'Today, 4:00 PM',
        partsCost: 110,
        laborCost: 150,
        parts: [
          { name: 'Oil Filter', price: 25 },
          { name: 'Labor charges', price: 150 }
        ]
      })
    });
    const updateJson = await updateRes.json();
    assert(updateRes.status === 200, 'PATCH /job-cards/:id returns 200 (OK) for Technician');
    assert(updateJson.data.status === 'Repair', 'Job status successfully updated to "Repair" (In Repair)');
    assert(updateJson.data.technicianId === technicianId, 'Technician assigned successfully');
    assert(updateJson.data.totalCost === 175, 'Total cost calculated and saved correctly');
    assert(Array.isArray(updateJson.data.parts) && updateJson.data.parts.length === 2, 'Parts list stored successfully in JSON column');
  } catch (err) {
    console.error('Update Job Card failed:', err);
    process.exit(1);
  }

  // 6. Test Customer Booking Cancellation (Cleanup)
  console.log('\n--- 6. Testing Cancellation Cleanup ---');
  try {
    const delRes = await fetch(`${BOOKINGS_URL}/${testBookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert(delRes.status === 200, 'DELETE /service-bookings/:id cancels appointment');

    // Confirm that the associated Job Card was cascaded deleted
    const jcCheck = await prisma.jobCard.findUnique({
      where: { id: testJobCardId }
    });
    assert(jcCheck === null, 'Associated Job Card record was cascaded deleted from database');
  } catch (err) {
    console.error('Cancellation cleanup failed:', err);
    process.exit(1);
  }

  console.log('\n================================================');
  console.log('🎉 ALL SERVICE & REPAIR INTEGRATION TESTS PASSED!');
  console.log('================================================');
  process.exit(0);
}

runServiceRepairVerification();
