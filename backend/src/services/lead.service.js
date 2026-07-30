import prisma from '../config/prisma.js';

/**
 * Service to retrieve all leads
 */
export const getLeads = async () => {
  return await prisma.lead.findMany({
    include: {
      car: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          price: true
        }
      },
      salesRep: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * Service to create a new lead
 * @param {object} leadData - { name, carId, status, date, userId }
 */
export const createLead = async (leadData) => {
  const { name, carId, status, date, userId } = leadData;

  // Validate car existence
  const car = await prisma.car.findUnique({
    where: { id: parseInt(carId, 10) }
  });

  if (!car) {
    const error = new Error('Selected car model does not exist');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.lead.create({
    data: {
      name,
      carId: parseInt(carId, 10),
      status: status || 'New',
      date: date || new Date().toISOString().split('T')[0],
      userId: userId ? parseInt(userId, 10) : null
    },
    include: {
      car: true
    }
  });
};

/**
 * Service to update an existing lead status or assignee
 * @param {number} id
 * @param {object} updateData
 */
export const updateLead = async (id, updateData) => {
  const leadId = parseInt(id, 10);

  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId }
  });

  if (!existingLead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  // Format arguments
  const data = {};
  if (updateData.status) data.status = updateData.status;
  if (updateData.date) data.date = updateData.date;
  if (updateData.userId) data.userId = parseInt(updateData.userId, 10);

  return await prisma.lead.update({
    where: { id: leadId },
    data,
    include: {
      car: true
    }
  });
};

/**
 * Service to delete a lead (Admin only)
 * @param {number} id
 */
export const deleteLead = async (id) => {
  const leadId = parseInt(id, 10);

  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId }
  });

  if (!existingLead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.lead.delete({
    where: { id: leadId }
  });

  return { id: leadId };
};
