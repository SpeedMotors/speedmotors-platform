import prisma from '../config/prisma.js';

/**
 * Service to fetch all job cards (customer sees only their own; staff/technicians see all)
 * @param {number} userId
 * @param {string} userRole
 */
export const getJobCards = async (userId, userRole) => {
  const queryOptions = {
    include: {
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      serviceBooking: {
        include: {
          user: {
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
    queryOptions.where = {
      serviceBooking: {
        userId: userId
      }
    };
  }

  return await prisma.jobCard.findMany(queryOptions);
};

/**
 * Service to retrieve a single job card by ID (string format)
 * @param {string} id
 */
export const getJobCardById = async (id) => {
  if (!id || typeof id !== 'string') {
    const error = new Error('Invalid job card ID format');
    error.statusCode = 400;
    throw error;
  }

  const jobCard = await prisma.jobCard.findUnique({
    where: { id },
    include: {
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      serviceBooking: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!jobCard) {
    const error = new Error('Job card not found');
    error.statusCode = 404;
    throw error;
  }

  return jobCard;
};

/**
 * Service to update job card fields (allows custom actions based on roles)
 * @param {string} id
 * @param {number} userId
 * @param {string} userRole
 * @param {object} updateData
 */
export const updateJobCard = async (id, userId, userRole, updateData) => {
  const jcId = id;

  // Validate existence
  const existingJob = await getJobCardById(jcId);

  const data = {};

  if (userRole === 'CUSTOMER') {
    // 1. Verify the job card belongs to the customer
    if (existingJob.serviceBooking.userId !== userId) {
      const error = new Error('You do not have permission to modify this job card');
      error.statusCode = 403;
      throw error;
    }

    // 2. Limit customer updates to payment status and ratings/feedback
    const customerFields = ['isPaid', 'rating', 'feedback'];
    const requestedFields = Object.keys(updateData);
    const hasRestricted = requestedFields.some(f => !customerFields.includes(f));

    if (hasRestricted) {
      const error = new Error('Customers are not authorized to update repair status or billing parameters');
      error.statusCode = 403;
      throw error;
    }

    if (updateData.isPaid !== undefined) data.isPaid = updateData.isPaid;
    if (updateData.rating !== undefined) data.rating = parseInt(updateData.rating, 10);
    if (updateData.feedback !== undefined) data.feedback = updateData.feedback;
  } else {
    // Staff / Admin updates
    if (updateData.status) {
      const allowed = ['Received', 'Diagnosis', 'Repair', 'QC', 'Ready'];
      if (!allowed.includes(updateData.status)) {
        const error = new Error(`Invalid status. Allowed: ${allowed.join(', ')}`);
        error.statusCode = 400;
        throw error;
      }
      data.status = updateData.status;
    }

    if (updateData.technicianId !== undefined) {
      if (updateData.technicianId === null) {
        data.technician = { disconnect: true };
      } else {
        const techId = parseInt(updateData.technicianId, 10);
        const tech = await prisma.user.findUnique({ where: { id: techId } });
        if (!tech || tech.role !== 'TECHNICIAN') {
          const error = new Error('Assignee must be a registered technician user account');
          error.statusCode = 400;
          throw error;
        }
        data.technician = { connect: { id: techId } };
      }
    }

    if (updateData.expectedCompletion !== undefined) {
      data.expectedCompletion = updateData.expectedCompletion;
    }

    if (updateData.parts) {
      data.parts = updateData.parts;
    }

    // Determine the totalCost
    if (updateData.parts && Array.isArray(updateData.parts)) {
      data.totalCost = updateData.parts.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    } else if (updateData.partsCost !== undefined || updateData.laborCost !== undefined) {
      const partsCost = parseFloat(updateData.partsCost) || 0;
      const laborCost = parseFloat(updateData.laborCost) || 0;
      data.totalCost = partsCost + laborCost;
    } else if (updateData.totalCost !== undefined) {
      data.totalCost = parseFloat(updateData.totalCost) || 0;
    }
  }

  return await prisma.jobCard.update({
    where: { id: jcId },
    data,
    include: {
      technician: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      serviceBooking: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  });
};
