import prisma from '../config/prisma.js';

/**
 * Service to book a new test drive session
 * @param {number} userId - The authenticated user ID (customer)
 * @param {object} bookingData - { date, time, location, carIds }
 */
export const bookTestDrive = async (userId, bookingData) => {
  const { date, time, location, carIds } = bookingData;

  if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
    const error = new Error('Please select at least one vehicle for the test drive session');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch the user details
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Validate all car models exist
  const cars = await prisma.car.findMany({
    where: { id: { in: carIds.map((id) => parseInt(id, 10)) } }
  });

  if (cars.length !== carIds.length) {
    const error = new Error('One or more selected vehicle models do not exist');
    error.statusCode = 404;
    throw error;
  }

  // 3. Create TestDrive session using transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the test drive session
    const testDrive = await tx.testDrive.create({
      data: {
        date,
        time,
        location,
        userId
      }
    });

    // Create TestDriveCar association records
    const testDriveCarPromises = carIds.map((carId) =>
      tx.testDriveCar.create({
        data: {
          testDriveId: testDrive.id,
          carId: parseInt(carId, 10)
        }
      })
    );
    await Promise.all(testDriveCarPromises);

    // Automatically register these as new entries in the Sales Leads pipeline
    const leadPromises = cars.map((car) =>
      tx.lead.create({
        data: {
          name: user.name,
          carId: car.id,
          status: 'New',
          date: date,
          userId: null // Unassigned sales rep by default
        }
      })
    );
    await Promise.all(leadPromises);

    return testDrive;
  });

  // Query final booked session details to return
  return await prisma.testDrive.findUnique({
    where: { id: result.id },
    include: {
      cars: {
        include: {
          car: true
        }
      }
    }
  });
};

/**
 * Service to fetch booked test drives (restricted based on role context)
 * @param {number} userId - Requesting user's ID
 * @param {string} userRole - Role string (CUSTOMER, SALES, ADMIN)
 */
export const getTestDrives = async (userId, userRole) => {
  const queryOptions = {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      cars: {
        include: {
          car: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  };

  // Customers can only see their own scheduled test drive sessions
  if (userRole === 'CUSTOMER') {
    queryOptions.where = { userId };
  }

  return await prisma.testDrive.findMany(queryOptions);
};

/**
 * Service to update scheduled details of a booking
 * @param {number} id
 * @param {number} userId
 * @param {string} userRole
 * @param {object} updateData - { date, time, location }
 */
export const updateBooking = async (id, userId, userRole, updateData) => {
  const bookingId = parseInt(id, 10);

  const existingBooking = await prisma.testDrive.findUnique({
    where: { id: bookingId }
  });

  if (!existingBooking) {
    const error = new Error('Test drive booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Access validation: customers can only edit their own bookings
  if (userRole === 'CUSTOMER' && existingBooking.userId !== userId) {
    const error = new Error('You do not have permission to modify this booking');
    error.statusCode = 403;
    throw error;
  }

  const data = {};
  if (updateData.date) data.date = updateData.date;
  if (updateData.time) data.time = updateData.time;
  if (updateData.location) data.location = updateData.location;

  return await prisma.testDrive.update({
    where: { id: bookingId },
    data,
    include: {
      cars: {
        include: {
          car: true
        }
      }
    }
  });
};

/**
 * Service to cancel a scheduled booking
 * @param {number} id
 * @param {number} userId
 * @param {string} userRole
 */
export const cancelBooking = async (id, userId, userRole) => {
  const bookingId = parseInt(id, 10);

  const existingBooking = await prisma.testDrive.findUnique({
    where: { id: bookingId }
  });

  if (!existingBooking) {
    const error = new Error('Test drive booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Access validation: customers can only cancel their own bookings
  if (userRole === 'CUSTOMER' && existingBooking.userId !== userId) {
    const error = new Error('You do not have permission to cancel this booking');
    error.statusCode = 403;
    throw error;
  }

  // Deleting the TestDrive cascaded deletes join records under TestDriveCar
  await prisma.testDrive.delete({
    where: { id: bookingId }
  });

  return { id: bookingId };
};
