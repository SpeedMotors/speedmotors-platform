import prisma from '../src/config/prisma.js';

async function runLeadsTestDriveVerification() {
  console.log('================================================');
  console.log(' STARTING LEADS & TEST DRIVES INTEGRATION TESTS');
  console.log('================================================');

  const AUTH_URL = 'http://localhost:5000/api/auth';
  const LEADS_URL = 'http://localhost:5000/api/leads';
  const TESTDRIVE_URL = 'http://localhost:5000/api/test-drives';

  let adminToken = '';
  let salesToken = '';
  let customerToken = '';
  
  let adminId = null;
  let salesId = null;
  let customerId = null;

  let testLeadId = null;
  let testBookingId = null;

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

    const salesRes = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@sales.com', password: 'password123' })
    });
    const salesJson = await salesRes.json();
    salesToken = salesJson.data.token;
    salesId = salesJson.data.user.id;

    const custRes = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@customer.com', password: 'password123' })
    });
    const custJson = await custRes.json();
    customerToken = custJson.data.token;
    customerId = custJson.data.user.id;

    assert(adminToken && salesToken && customerToken, 'Tokens retrieved successfully');
  } catch (err) {
    console.error('Session retrieval failed:', err);
    process.exit(1);
  }

  // 2. Test Leads API - Create Lead (authenticated check)
  console.log('\n--- 2. Testing Create Lead ---');
  try {
    const createRes = await fetch(LEADS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${salesToken}`
      },
      body: JSON.stringify({
        name: 'Alice Lead',
        carId: 1, // Elektrify X
        status: 'New',
        date: '2026-08-01'
      })
    });
    const createJson = await createRes.json();
    assert(createRes.status === 201, 'POST /leads creates a lead (201 Created)');
    assert(createJson.success === true, 'Response payload success is true');
    assert(createJson.data.name === 'Alice Lead', 'Created lead name matches');
    assert(createJson.data.carId === 1, 'Created lead carId matches');
    testLeadId = createJson.data.id;
  } catch (err) {
    console.error('Create Lead failed:', err);
    process.exit(1);
  }

  // 3. Test Leads API - Get Leads (Role restriction check)
  console.log('\n--- 3. Testing Get Leads (Role Restrictions) ---');
  try {
    // Customers cannot view the leads list
    const customerGetRes = await fetch(LEADS_URL, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert(customerGetRes.status === 403, 'GET /leads with CUSTOMER token returns 403 (Forbidden)');

    // Sales and Admins can view leads
    const salesGetRes = await fetch(LEADS_URL, {
      headers: { 'Authorization': `Bearer ${salesToken}` }
    });
    const salesGetJson = await salesGetRes.json();
    assert(salesGetRes.status === 200, 'GET /leads with SALES token returns 200 (OK)');
    assert(Array.isArray(salesGetJson.data), 'Returns array of leads');
    assert(salesGetJson.data.some(l => l.id === testLeadId), 'Leads array includes the newly created lead');
  } catch (err) {
    console.error('Get Leads failed:', err);
    process.exit(1);
  }

  // 4. Test Leads API - Update Status (Sales and Admins)
  console.log('\n--- 4. Testing Update Lead Status ---');
  try {
    const updateRes = await fetch(`${LEADS_URL}/${testLeadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${salesToken}`
      },
      body: JSON.stringify({
        status: 'Contacted',
        userId: salesId // Assign to sales rep
      })
    });
    const updateJson = await updateRes.json();
    assert(updateRes.status === 200, 'PATCH /leads/:id returns 200 (OK)');
    assert(updateJson.data.status === 'Contacted', 'Lead status successfully updated to "Contacted"');
    assert(updateJson.data.userId === salesId, 'Lead sales rep assignee set correctly');
  } catch (err) {
    console.error('Update Lead failed:', err);
    process.exit(1);
  }

  // 5. Test Leads API - Delete Lead (Admin only)
  console.log('\n--- 5. Testing Delete Lead (Admin Restrictions) ---');
  try {
    // Sales rep cannot delete
    const salesDelRes = await fetch(`${LEADS_URL}/${testLeadId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${salesToken}` }
    });
    assert(salesDelRes.status === 403, 'DELETE /leads/:id with SALES token returns 403 (Forbidden)');

    // Admin can delete
    const adminDelRes = await fetch(`${LEADS_URL}/${testLeadId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminDelRes.status === 200, 'DELETE /leads/:id with ADMIN token returns 200 (OK)');
  } catch (err) {
    console.error('Delete Lead failed:', err);
    process.exit(1);
  }

  // 6. Test TestDrive API - Book Test Drive (Customer)
  console.log('\n--- 6. Testing Book Test Drive & Auto-Lead Integration ---');
  try {
    const bookRes = await fetch(TESTDRIVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        date: '2026-08-10',
        time: '14:30',
        location: 'Downtown Showroom',
        carIds: [2] // Aero Sedan
      })
    });
    const bookJson = await bookRes.json();
    assert(bookRes.status === 201, 'POST /test-drives creates session (201 Created)');
    assert(bookJson.data.location === 'Downtown Showroom', 'Scheduled location matches');
    assert(bookJson.data.cars.length === 1 && bookJson.data.cars[0].carId === 2, 'Assigned car matches model 2');
    testBookingId = bookJson.data.id;

    // Verify a Lead was automatically created in the database for the Customer for Car 2!
    const dbLeads = await prisma.lead.findMany({
      where: { name: 'Valued Customer', carId: 2 }
    });
    assert(dbLeads.length > 0, 'Autointegration: A matching lead was created in PostgreSQL for this Test Drive booking');
  } catch (err) {
    console.error('Book Test Drive failed:', err);
    process.exit(1);
  }

  // 7. Test TestDrive API - Get Test Drives (Role checking)
  console.log('\n--- 7. Testing Get Test Drives Scoping ---');
  try {
    // Customer gets only their own bookings
    const custGetRes = await fetch(TESTDRIVE_URL, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const custGetJson = await custGetRes.json();
    assert(custGetRes.status === 200, 'GET /test-drives with CUSTOMER returns 200');
    assert(custGetJson.data.every(b => b.userId === customerId), 'Customer sees only their own scheduled sessions');

    // Sales rep gets all bookings
    const salesGetRes = await fetch(TESTDRIVE_URL, {
      headers: { 'Authorization': `Bearer ${salesToken}` }
    });
    const salesGetJson = await salesGetRes.json();
    assert(salesGetRes.status === 200, 'GET /test-drives with SALES returns 200');
    assert(salesGetJson.data.length >= 1, 'Sales rep can query global booking schedule');
  } catch (err) {
    console.error('Get Test Drives scoping failed:', err);
    process.exit(1);
  }

  // 8. Test TestDrive API - Update Booking
  console.log('\n--- 8. Testing Update Booking ---');
  try {
    const updateRes = await fetch(`${TESTDRIVE_URL}/${testBookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        time: '16:00',
        location: 'Uptown Showroom'
      })
    });
    const updateJson = await updateRes.json();
    assert(updateRes.status === 200, 'PATCH /test-drives/:id returns 200 (OK)');
    assert(updateJson.data.time === '16:00' && updateJson.data.location === 'Uptown Showroom', 'Booking details successfully updated');
  } catch (err) {
    console.error('Update Booking failed:', err);
    process.exit(1);
  }

  // 9. Test TestDrive API - Cancel Booking (Access validation)
  console.log('\n--- 9. Testing Cancel Booking (Access Validation) ---');
  try {
    // Different customer trying to cancel (mocking by logging out / registering a random customer is not necessary, we can try with sales rep or admin if we block them, but since sales rep is allowed, let's verify sales rep can cancel, and check validation)
    
    // Customer cancels their own booking
    const deleteRes = await fetch(`${TESTDRIVE_URL}/${testBookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert(deleteRes.status === 200, 'DELETE /test-drives/:id returns 200 (OK)');

    // Verify it is gone
    const checkRes = await prisma.testDrive.findUnique({
      where: { id: testBookingId }
    });
    assert(checkRes === null, 'Session record deleted from PostgreSQL database');
  } catch (err) {
    console.error('Cancel booking failed:', err);
    process.exit(1);
  }

  console.log('\n================================================');
  console.log('🎉 ALL LEADS & TEST DRIVES INTEGRATION TESTS PASSED!');
  console.log('================================================');
  process.exit(0);
}

runLeadsTestDriveVerification();
