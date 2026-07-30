import prisma from '../src/config/prisma.js';

async function runInventoryVerification() {
  console.log('================================================');
  console.log(' STARTING INVENTORY MODULE INTEGRATION TESTS');
  console.log('================================================');

  const AUTH_URL = 'http://localhost:5000/api/auth';
  const INVENTORY_URL = 'http://localhost:5000/api/inventory';
  const BOOKINGS_URL = 'http://localhost:5000/api/service-bookings';

  let adminToken = '';
  let technicianToken = '';
  let customerToken = '';

  let adminId = null;
  let technicianId = null;
  let customerId = null;

  let testPartId = null;
  let testJobCardId = null;
  let testBookingId = null;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`[OK] ✅ ${message}`);
    } else {
      console.log(`[ERR] ❌ ${message}`);
      process.exit(1);
    }
  };

  // 1. Session Login
  try {
    console.log('Logging in to retrieve session tokens...');
    const adminRes = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@admin.com', password: 'password123' })
    });
    const adminJson = await adminRes.json();
    adminToken = adminJson.data.token;
    adminId = adminJson.data.user.id;

    const techRes = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@technician.com', password: 'password123' })
    });
    const techJson = await techRes.json();
    technicianToken = techJson.data.token;
    technicianId = techJson.data.user.id;

    const custRes = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@customer.com', password: 'password123' })
    });
    const custJson = await custRes.json();
    customerToken = custJson.data.token;
    customerId = custJson.data.user.id;

    assert(adminToken && technicianToken && customerToken, 'Tokens retrieved successfully');
  } catch (err) {
    console.error('Login failed:', err);
    process.exit(1);
  }

  // 2. Authorization Checks
  console.log('\n--- 2. Checking Role Authorization Barriers ---');
  try {
    // Try creating a part as Technician -> Should fail with 403
    const techCreate = await fetch(INVENTORY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${technicianToken}`
      },
      body: JSON.stringify({
        partNo: 'PART-TECH-ERR',
        name: 'Oil Filter X',
        price: 25.00,
        stock: 5,
        minStock: 2,
        category: 'Filters'
      })
    });
    assert(techCreate.status === 403, 'Technician blocked from creating spare parts (403 Forbidden)');

    // Try creating a part as Customer -> Should fail with 403
    const custCreate = await fetch(INVENTORY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        partNo: 'PART-CUST-ERR',
        name: 'Oil Filter Y',
        price: 25.00,
        stock: 5,
        minStock: 2,
        category: 'Filters'
      })
    });
    assert(custCreate.status === 403, 'Customer blocked from creating spare parts (403 Forbidden)');
  } catch (err) {
    console.error('Authorization check failed:', err);
    process.exit(1);
  }

  // 3. Validation and Prevent Negative Inventory on Creation
  console.log('\n--- 3. Checking Model Validation Checks ---');
  try {
    // Negative Price
    const negPrice = await fetch(INVENTORY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        partNo: 'PART-NEG-PRICE',
        name: 'Spark Plug',
        price: -10.00,
        stock: 50,
        minStock: 10,
        category: 'Engine'
      })
    });
    assert(negPrice.status === 400, 'Rejects creation with negative price (400 Bad Request)');

    // Negative Stock
    const negStock = await fetch(INVENTORY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        partNo: 'PART-NEG-STOCK',
        name: 'Spark Plug',
        price: 15.00,
        stock: -5,
        minStock: 10,
        category: 'Engine'
      })
    });
    assert(negStock.status === 400, 'Rejects creation with negative stock level (400 Bad Request)');

    // Negative Minimum Stock
    const negMinStock = await fetch(INVENTORY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        partNo: 'PART-NEG-MIN',
        name: 'Spark Plug',
        price: 15.00,
        stock: 50,
        minStock: -2,
        category: 'Engine'
      })
    });
    assert(negMinStock.status === 400, 'Rejects creation with negative minimum threshold (400 Bad Request)');
  } catch (err) {
    console.error('Validation checks failed:', err);
    process.exit(1);
  }

  // 4. Create Spare Parts (CRUD)
  console.log('\n--- 4. Testing CRUD Spare Parts ---');
  try {
    // Create Part 1: High Stock Engine Plugs
    const res1 = await fetch(INVENTORY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        partNo: 'SM-SPK-100',
        name: 'Platinum Spark Plug',
        description: 'High performance spark plug for luxury inline engines',
        price: 12.50,
        stock: 10,
        minStock: 5,
        category: 'Engine Parts'
      })
    });
    const json1 = await res1.json();
    assert(res1.status === 211, 'POST /inventory creates new spare part (211 Created)');
    testPartId = json1.data.id;

    // Check Stock History logged automatically
    const historyRes = await prisma.stockHistory.findFirst({
      where: { partId: testPartId }
    });
    assert(historyRes !== null, 'Auditing: Stock history logs part registration automatically');
    assert(historyRes.type === 'ADJUST' && historyRes.quantity === 10, 'History logs correct initial adjustment values');

    // Create Part 2: Low Stock Brake Pad (to trigger Alert)
    const res2 = await fetch(INVENTORY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        partNo: 'SM-BRK-200',
        name: 'Ceramic Brake Pads Set',
        price: 85.00,
        stock: 2,
        minStock: 5, // stock <= minStock and gt 0 -> should trigger alert!
        category: 'Brake Parts'
      })
    });
    assert(res2.status === 211, 'Created second spare part successfully');
  } catch (err) {
    console.error('CRUD operations failed:', err);
    process.exit(1);
  }

  // 5. Search, Filter, Pagination, and Sorting
  console.log('\n--- 5. Testing Search, Filter, Pagination, and Sorting ---');
  try {
    // Search
    const searchRes = await fetch(`${INVENTORY_URL}?search=Ceramic`, {
      headers: { 'Authorization': `Bearer ${technicianToken}` }
    });
    const searchJson = await searchRes.json();
    assert(searchJson.data.parts.length === 1 && searchJson.data.parts[0].partNo === 'SM-BRK-200', 'Search by term works correctly');

    // Filter by Category
    const catRes = await fetch(`${INVENTORY_URL}?category=Engine Parts`, {
      headers: { 'Authorization': `Bearer ${technicianToken}` }
    });
    const catJson = await catRes.json();
    assert(catJson.data.parts.every(p => p.category === 'Engine Parts'), 'Filtering by category matches');

    // Sorting by stock level (asc)
    const sortRes = await fetch(`${INVENTORY_URL}?sort=stock`, {
      headers: { 'Authorization': `Bearer ${technicianToken}` }
    });
    const sortJson = await sortRes.json();
    const stocks = sortJson.data.parts.map(p => p.stock);
    const sorted = [...stocks].sort((a, b) => a - b);
    assert(JSON.stringify(stocks) === JSON.stringify(sorted), 'Sorting by stock level works (ascending)');

    // Pagination limit check
    const pagRes = await fetch(`${INVENTORY_URL}?limit=1`, {
      headers: { 'Authorization': `Bearer ${technicianToken}` }
    });
    const pagJson = await pagRes.json();
    assert(pagJson.data.parts.length === 1, 'Pagination limit parameter respected');
  } catch (err) {
    console.error('Search/Sorting test failed:', err);
    process.exit(1);
  }

  // 6. Stock Adjustments & Prevent Negative Stock
  console.log('\n--- 6. Testing Stock Adjustments & Negative Stock Barriers ---');
  try {
    // Try adjusting below zero (e.g. decrease by 50 when stock is 10)
    const adjNeg = await fetch(`${INVENTORY_URL}/${testPartId}/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${technicianToken}`
      },
      body: JSON.stringify({
        quantity: 50,
        type: 'DECREASE',
        reason: 'Adjusting below zero'
      })
    });
    assert(adjNeg.status === 400, 'Rejects stock reduction that causes negative inventory');

    // Adjust stock upwards successfully (INCREASE by 10)
    const adjPos = await fetch(`${INVENTORY_URL}/${testPartId}/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${technicianToken}`
      },
      body: JSON.stringify({
        quantity: 10,
        type: 'INCREASE',
        reason: 'Restocking shipment'
      })
    });
    const adjPosJson = await adjPos.json();
    assert(adjPos.status === 200, 'Increases stock count (200 OK)');
    assert(adjPosJson.data.stock === 20, 'Stock count updated to 20');

    // Check StockHistory audit entry
    const histories = await prisma.stockHistory.findMany({
      where: { partId: testPartId },
      orderBy: { createdAt: 'desc' }
    });
    assert(histories[0].type === 'INCREASE' && histories[0].reason === 'Restocking shipment', 'Auditing: restock logged in StockHistory');
  } catch (err) {
    console.error('Stock adjustment tests failed:', err);
    process.exit(1);
  }

  // 7. Dynamic Part Allocation (Transaction Safe, Duplicate checking, JobCard JSON updating)
  console.log('\n--- 7. Testing Job Card Part Allocation ---');
  try {
    // 7.1 Book service to generate active Job Card
    const bookingRes = await fetch(BOOKINGS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        name: 'Workshop Client',
        phone: '999-888-7777',
        make: 'Tesla',
        model: 'Model S',
        year: 2024,
        date: '2026-09-01',
        serviceType: 'Routine Maintenance',
        issue: 'Tire rotation'
      })
    });
    const bookingJson = await bookingRes.json();
    testBookingId = bookingJson.data.id;

    const jc = await prisma.jobCard.findUnique({
      where: { serviceBookingId: testBookingId }
    });
    testJobCardId = jc.id;
    assert(testJobCardId !== null, 'Job Card generated successfully for part allocation testing');

    // 7.2 Allocate Part to Job Card (qty: 2 Spark Plugs @ $12.50 each)
    const allocRes = await fetch(`${INVENTORY_URL}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${technicianToken}`
      },
      body: JSON.stringify({
        partId: testPartId,
        jobCardId: testJobCardId,
        quantity: 2
      })
    });
    const allocJson = await allocRes.json();
    assert(allocRes.status === 200, 'POST /inventory/allocate maps part to job card');

    // Verify stock decreased by 2 (20 -> 18)
    const updatedPart = await prisma.sparePart.findUnique({ where: { id: testPartId } });
    assert(updatedPart.stock === 18, 'Part stock level reduced by allocation amount');

    // Verify Job Card parts list has the items, and totalCost has increased by $25.00
    const updatedJc = await prisma.jobCard.findUnique({ where: { id: testJobCardId } });
    assert(updatedJc.parts.length === 2, 'Job card parts JSON array successfully appended');
    assert(updatedJc.totalCost === 25.00, 'Job card invoice total cost updated');

    // 7.3 Duplicate Allocation Check: allocate same part again (qty: 3)
    const dupRes = await fetch(`${INVENTORY_URL}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${technicianToken}`
      },
      body: JSON.stringify({
        partId: testPartId,
        jobCardId: testJobCardId,
        quantity: 3
      })
    });
    assert(dupRes.status === 200, 'Allocation of duplicate part allowed');

    // Verify no duplicate row exists: quantity in table should sum to 5 (2 + 3)
    const allocationCount = await prisma.partAllocation.count({
      where: { partId: testPartId, jobCardId: testJobCardId }
    });
    assert(allocationCount === 1, 'Duplicate protection: increases quantity in same row, no duplicate rows created');

    const totalAlloc = await prisma.partAllocation.findFirst({
      where: { partId: testPartId, jobCardId: testJobCardId }
    });
    assert(totalAlloc.quantity === 5, 'Allocation quantity matches sum total (5 units)');
  } catch (err) {
    console.error('Part allocation tests failed:', err);
    process.exit(1);
  }

  // 8. Deallocation & Stock Return
  console.log('\n--- 8. Testing Allocation Removal & Stock Restores ---');
  try {
    const alloc = await prisma.partAllocation.findFirst({
      where: { partId: testPartId, jobCardId: testJobCardId }
    });

    const removeRes = await fetch(`${INVENTORY_URL}/allocate/${alloc.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${technicianToken}` }
    });
    assert(removeRes.status === 200, 'DELETE /inventory/allocate/:id removes allocation');

    // Verify stock returned (15 remaining allocated returned. Plugs stock should return from 15 to 20!)
    // Wait, we allocated 2, then 3 (total 5). Plugs stock was 20. Allocated 5 -> stock became 15.
    // Deallocating 5 plugs should return stock to 20!
    const restoredPart = await prisma.sparePart.findUnique({ where: { id: testPartId } });
    assert(restoredPart.stock === 20, 'Stock restored in inventory after deallocation');

    // Verify Job Card parts array and cost cleared
    const clearedJc = await prisma.jobCard.findUnique({ where: { id: testJobCardId } });
    assert(clearedJc.parts.length === 0, 'Job card parts invoice list cleaned up');
    assert(clearedJc.totalCost === 0.00, 'Invoice total cost cleared to zero');
  } catch (err) {
    console.error('Deallocation tests failed:', err);
    process.exit(1);
  }

  // 9. Alerts and Dashboard KPI Metrics
  console.log('\n--- 9. Testing Low-Stock Alerts & Metrics ---');
  try {
    // Low stock API
    const alertRes = await fetch(`${INVENTORY_URL}/alerts/low`, {
      headers: { 'Authorization': `Bearer ${technicianToken}` }
    });
    const alertJson = await alertRes.json();
    assert(alertJson.data.parts.some(p => p.partNo === 'SM-BRK-200'), 'Low stock parts contains Ceramic Brake Pads');

    // Metrics API
    const metricsRes = await fetch(`${INVENTORY_URL}/metrics`, {
      headers: { 'Authorization': `Bearer ${technicianToken}` }
    });
    const metricsJson = await metricsRes.json();
    assert(metricsJson.data.totalParts >= 2, 'Metrics: total parts counted');
    assert(metricsJson.data.lowStockCount >= 1, 'Metrics: low stock count calculated');
  } catch (err) {
    console.error('Alerts & metrics tests failed:', err);
    process.exit(1);
  }

  // 10. Clean up
  try {
    console.log('\nCleaning up test allocations...');
    // Resolve foreign key constraints sequentially
    await prisma.partAllocation.deleteMany({ where: { jobCardId: testJobCardId } });
    await prisma.jobCard.deleteMany({ where: { id: testJobCardId } });
    await prisma.serviceBooking.deleteMany({ where: { id: testBookingId } });
    await prisma.stockHistory.deleteMany({ 
      where: { 
        part: { 
          partNo: { in: ['SM-SPK-100', 'SM-BRK-200'] } 
        } 
      } 
    });
    await prisma.sparePart.deleteMany({ where: { partNo: { in: ['SM-SPK-100', 'SM-BRK-200'] } } });
    console.log('[OK] ✅ Database cleaned up.');
  } catch (err) {
    console.error('Cleanup failed:', err);
  }

  console.log('\n================================================');
  console.log('🎉 ALL INVENTORY MANAGEMENT TESTS PASSED!');
  console.log('================================================');
  process.exit(0);
}

runInventoryVerification();
