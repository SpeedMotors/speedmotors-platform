import prisma from '../config/prisma.js';

/**
 * Service to create a new service booking appointment
 * @param {number} userId
 * @param {object} bookingData - { carId, date, serviceType, issue, phone }
 */
export const createBooking = async (userId, bookingData) => {
  const { name, phone, make, model, year, date, serviceType, issue } = bookingData;

  // Create booking in database
  const booking = await prisma.serviceBooking.create({
    data: {
      name,
      phone,
      make,
      model,
      year: parseInt(year, 10),
      date,
      serviceType,
      issue,
      userId
    }
  });

  // Generate a random job card ID (e.g., JC-1234)
  const jobCardId = `JC-${Math.floor(1000 + Math.random() * 9000)}`;

  // Automatically spin up a pending Job Card for this service booking to kickstart repair tracking
  await prisma.jobCard.create({
    data: {
      id: jobCardId,
      customerName: name,
      carMake: `${year} ${make} ${model}`,
      issue: issue || serviceType,
      status: 'Received',
      expectedCompletion: 'Calculating...',
      totalCost: 0.0,
      parts: [],
      serviceBookingId: booking.id
    }
  });

  return booking;
};

/**
 * Service to fetch bookings (customers view their own; staff/admins view all)
 * @param {number} userId
 * @param {string} userRole
 */
export const getBookings = async (userId, userRole) => {
  const queryOptions = {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      jobCard: {
        include: {
          technician: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  };

  if (userRole === 'CUSTOMER') {
    queryOptions.where = { userId };
  }

  return await prisma.serviceBooking.findMany(queryOptions);
};

/**
 * Service to edit booking details
 * @param {number} id
 * @param {number} userId
 * @param {string} userRole
 * @param {object} updateData
 */
export const updateBooking = async (id, userId, userRole, updateData) => {
  const bookingId = parseInt(id, 10);

  const existingBooking = await prisma.serviceBooking.findUnique({
    where: { id: bookingId }
  });

  if (!existingBooking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: customers can only edit their own bookings
  if (userRole === 'CUSTOMER' && existingBooking.userId !== userId) {
    const error = new Error('You do not have permission to edit this booking');
    error.statusCode = 403;
    throw error;
  }

  const data = {};
  if (updateData.date) data.date = updateData.date;
  if (updateData.serviceType) data.serviceType = updateData.serviceType;
  if (updateData.issue) data.issue = updateData.issue;
  if (updateData.phone) data.phone = updateData.phone;

  return await prisma.serviceBooking.update({
    where: { id: bookingId },
    data
  });
};

/**
 * Service to cancel a booking appointment
 * @param {number} id
 * @param {number} userId
 * @param {string} userRole
 */
export const cancelBooking = async (id, userId, userRole) => {
  const bookingId = parseInt(id, 10);

  const existingBooking = await prisma.serviceBooking.findUnique({
    where: { id: bookingId }
  });

  if (!existingBooking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: customers can only cancel their own bookings
  if (userRole === 'CUSTOMER' && existingBooking.userId !== userId) {
    const error = new Error('You do not have permission to cancel this booking');
    error.statusCode = 403;
    throw error;
  }

  // We perform a transaction to delete the associated job card first to prevent foreign key issues
  await prisma.$transaction([
    prisma.jobCard.deleteMany({
      where: { serviceBookingId: bookingId }
    }),
    prisma.serviceBooking.delete({
      where: { id: bookingId }
    })
  ]);

  return { id: bookingId };
};
