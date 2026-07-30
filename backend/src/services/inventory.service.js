import prisma from '../config/prisma.js';

/**
 * Service to create a new spare part
 * @param {object} partData - { partNo, name, description, price, stock, minStock, category }
 * @param {number} userId - user performing the creation
 */
export const createPart = async (partData, userId) => {
  const { partNo, name, description, price, stock, minStock, category } = partData;

  // Validate positive price and non-negative stock numbers
  if (parseFloat(price) < 0) {
    const error = new Error('Price must be a positive number');
    error.statusCode = 400;
    throw error;
  }
  if (parseInt(stock, 10) < 0) {
    const error = new Error('Initial stock cannot be negative');
    error.statusCode = 400;
    throw error;
  }
  if (parseInt(minStock, 10) < 0) {
    const error = new Error('Minimum stock threshold cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  // Check unique Part Number (even if soft-deleted, we check to prevent conflicts)
  const existing = await prisma.sparePart.findUnique({
    where: { partNo }
  });

  if (existing) {
    if (existing.isDeleted) {
      // Reactivate soft-deleted part
      return await prisma.$transaction(async (tx) => {
        const reactivated = await tx.sparePart.update({
          where: { id: existing.id },
          data: {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            minStock: parseInt(minStock, 10),
            category,
            isDeleted: false
          }
        });

        await tx.stockHistory.create({
          data: {
            partId: reactivated.id,
            type: 'ADJUST',
            quantity: parseInt(stock, 10),
            reason: 'Reactivated part with adjusted stock',
            userId
          }
        });

        return reactivated;
      });
    } else {
      const error = new Error('Part Number already exists');
      error.statusCode = 400;
      throw error;
    }
  }

  return await prisma.$transaction(async (tx) => {
    const part = await tx.sparePart.create({
      data: {
        partNo,
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        minStock: parseInt(minStock, 10),
        category,
        isDeleted: false
      }
    });

    // Record initial stock registration history
    await tx.stockHistory.create({
      data: {
        partId: part.id,
        type: 'ADJUST',
        quantity: parseInt(stock, 10),
        reason: 'Initial part registration in inventory',
        userId
      }
    });

    return part;
  });
};

/**
 * Service to retrieve paginated and filtered spare parts
 */
export const getParts = async (query = {}) => {
  const { search, category, sort, page = 1, limit = 10 } = query;

  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  // Default filter: only show non-deleted parts
  const where = { isDeleted: false };

  // Search by partNo, name, or category (case-insensitive)
  if (search) {
    where.OR = [
      { partNo: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Exact category filter
  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  // Sorting maps
  let orderBy = { createdAt: 'desc' };
  if (sort) {
    switch (sort) {
      case 'stock':
        orderBy = { stock: 'asc' };
        break;
      case 'price':
        orderBy = { price: 'asc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'recentlyUpdated':
        orderBy = { updatedAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
  }

  const [parts, total] = await Promise.all([
    prisma.sparePart.findMany({
      where,
      orderBy,
      skip,
      take: parsedLimit
    }),
    prisma.sparePart.count({ where })
  ]);

  return {
    parts,
    total,
    page: parsedPage,
    limit: parsedLimit,
    totalPages: Math.ceil(total / parsedLimit)
  };
};

/**
 * Service to fetch a single part by ID
 */
export const getPartById = async (id) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    const error = new Error('Invalid part ID format');
    error.statusCode = 400;
    throw error;
  }

  const part = await prisma.sparePart.findUnique({
    where: { id: parsedId }
  });

  if (!part || part.isDeleted) {
    const error = new Error('Spare part not found');
    error.statusCode = 404;
    throw error;
  }

  return part;
};

/**
 * Service to update spare part details
 */
export const updatePart = async (id, updateData, userId) => {
  const parsedId = parseInt(id, 10);
  const part = await getPartById(parsedId);

  const data = {};
  if (updateData.name) data.name = updateData.name;
  if (updateData.description !== undefined) data.description = updateData.description;
  if (updateData.category) data.category = updateData.category;

  if (updateData.price !== undefined) {
    const newPrice = parseFloat(updateData.price);
    if (newPrice < 0) {
      const error = new Error('Price must be a positive number');
      error.statusCode = 400;
      throw error;
    }
    data.price = newPrice;
  }

  if (updateData.minStock !== undefined) {
    const newMin = parseInt(updateData.minStock, 10);
    if (newMin < 0) {
      const error = new Error('Minimum stock cannot be negative');
      error.statusCode = 400;
      throw error;
    }
    data.minStock = newMin;
  }

  // If partNo is updated, verify it is unique
  if (updateData.partNo && updateData.partNo !== part.partNo) {
    const conflict = await prisma.sparePart.findUnique({
      where: { partNo: updateData.partNo }
    });
    if (conflict) {
      const error = new Error('Part Number already in use');
      error.statusCode = 400;
      throw error;
    }
    data.partNo = updateData.partNo;
  }

  return await prisma.sparePart.update({
    where: { id: parsedId },
    data
  });
};

/**
 * Service to soft-delete a part
 */
export const deletePart = async (id, userId) => {
  const parsedId = parseInt(id, 10);
  const part = await getPartById(parsedId);

  // Check if part is currently allocated to any active Job Cards
  const activeAllocations = await prisma.partAllocation.findFirst({
    where: { partId: parsedId }
  });

  if (activeAllocations) {
    const error = new Error('Cannot delete a spare part that is currently allocated to active job cards');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    const deletedPart = await tx.sparePart.update({
      where: { id: parsedId },
      data: { isDeleted: true }
    });

    // Record stock history deletion entry
    await tx.stockHistory.create({
      data: {
        partId: parsedId,
        type: 'ADJUST',
        quantity: 0,
        reason: 'Part soft-deleted from inventory catalog',
        userId
      }
    });

    return deletedPart;
  });
};

/**
 * Service to adjust stock levels (transaction safe, prevents negative stock, logs audit history)
 */
export const adjustStock = async (partId, adjustData, userId) => {
  const { quantity, type, reason } = adjustData;
  const parsedId = parseInt(partId, 10);
  const qtyNum = parseInt(quantity, 10);

  if (isNaN(qtyNum) || qtyNum < 0) {
    const error = new Error('Adjustment quantity must be a non-negative integer');
    error.statusCode = 400;
    throw error;
  }

  const allowedTypes = ['INCREASE', 'DECREASE', 'ADJUST'];
  if (!allowedTypes.includes(type)) {
    const error = new Error(`Invalid adjustment type. Allowed: ${allowedTypes.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current stock state inside transaction
    const part = await tx.sparePart.findUnique({
      where: { id: parsedId }
    });

    if (!part || part.isDeleted) {
      const error = new Error('Spare part not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Calculate new stock
    let newStock = part.stock;
    if (type === 'INCREASE') {
      newStock += qtyNum;
    } else if (type === 'DECREASE') {
      newStock -= qtyNum;
    } else if (type === 'ADJUST') {
      newStock = qtyNum;
    }

    // 3. Prevent Negative Inventory
    if (newStock < 0) {
      const error = new Error(`Transaction aborted. Stock level cannot fall below zero. (Requested: ${newStock})`);
      error.statusCode = 400;
      throw error;
    }

    // 4. Update stock count
    const updatedPart = await tx.sparePart.update({
      where: { id: parsedId },
      data: { stock: newStock }
    });

    // 5. Log audit trail in Stock History
    await tx.stockHistory.create({
      data: {
        partId: parsedId,
        type,
        quantity: qtyNum,
        reason: reason || `Manual stock adjustment: ${type}`,
        userId
      }
    });

    return updatedPart;
  });
};

/**
 * Service to allocate spare parts to a Job Card (transaction safe, prevents negative stock, logs audit, updates JobCard parts JSON list)
 */
export const allocatePart = async (allocationData, userId) => {
  const { partId, jobCardId, quantity } = allocationData;
  const pId = parseInt(partId, 10);
  const qty = parseInt(quantity, 10);

  if (isNaN(qty) || qty <= 0) {
    const error = new Error('Allocation quantity must be a positive integer greater than zero');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Read SparePart inside transaction
    const part = await tx.sparePart.findUnique({
      where: { id: pId }
    });
    if (!part || part.isDeleted) {
      const error = new Error('Spare part not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Read JobCard inside transaction
    const jobCard = await tx.jobCard.findUnique({
      where: { id: jobCardId }
    });
    if (!jobCard) {
      const error = new Error('Workshop job card not found');
      error.statusCode = 404;
      throw error;
    }

    // 3. Verify stock availability (Prevent Negative Inventory)
    if (part.stock < qty) {
      const error = new Error(`Transaction aborted. Insufficient inventory stock available for allocation. (Available: ${part.stock}, Requested: ${qty})`);
      error.statusCode = 400;
      throw error;
    }

    // 4. Update SparePart stock count
    await tx.sparePart.update({
      where: { id: pId },
      data: { stock: part.stock - qty }
    });

    // 5. Duplicate Allocation Protection: check if already allocated to this job card
    const existingAllocation = await tx.partAllocation.findFirst({
      where: { partId: pId, jobCardId }
    });

    if (existingAllocation) {
      // Increase quantity of existing allocation row
      await tx.partAllocation.update({
        where: { id: existingAllocation.id },
        data: { quantity: existingAllocation.quantity + qty }
      });
    } else {
      // Create new allocation record
      await tx.partAllocation.create({
        data: {
          partId: pId,
          jobCardId,
          quantity: qty,
          allocatedById: userId
        }
      });
    }

    // 6. Log audit history in StockHistory
    await tx.stockHistory.create({
      data: {
        partId: pId,
        type: 'DECREASE',
        quantity: qty,
        reason: `Allocated to Job Card ${jobCardId}`,
        userId
      }
    });

    // 7. Append allocation to JobCard's parts JSON array and recalculate invoice total
    const currentParts = Array.isArray(jobCard.parts) ? jobCard.parts : [];
    const partsToAppend = [];
    for (let i = 0; i < qty; i++) {
      partsToAppend.push({ name: `${part.name} (PartNo: ${part.partNo})`, price: part.price });
    }
    const updatedParts = [...currentParts, ...partsToAppend];

    // Recompute totalCost
    const newTotalCost = updatedParts.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

    const updatedJobCard = await tx.jobCard.update({
      where: { id: jobCardId },
      data: {
        parts: updatedParts,
        totalCost: newTotalCost
      }
    });

    return updatedJobCard;
  });
};

/**
 * Service to remove parts allocation from a Job Card (transaction safe, returns stock, logs audit, removes item from JobCard parts JSON)
 */
export const removePartAllocation = async (allocationId, userId) => {
  const allocId = parseInt(allocationId, 10);

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch allocation details
    const allocation = await tx.partAllocation.findUnique({
      where: { id: allocId }
    });
    if (!allocation) {
      const error = new Error('Allocation record not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Fetch associated SparePart
    const part = await tx.sparePart.findUnique({
      where: { id: allocation.partId }
    });
    if (!part) {
      const error = new Error('Associated spare part not found');
      error.statusCode = 404;
      throw error;
    }

    // 3. Fetch JobCard
    const jobCard = await tx.jobCard.findUnique({
      where: { id: allocation.jobCardId }
    });
    if (!jobCard) {
      const error = new Error('Associated workshop job card not found');
      error.statusCode = 404;
      throw error;
    }

    // 4. Restore stock to SparePart table
    await tx.sparePart.update({
      where: { id: part.id },
      data: { stock: part.stock + allocation.quantity }
    });

    // 5. Delete allocation record
    await tx.partAllocation.delete({
      where: { id: allocId }
    });

    // 6. Log audit history in StockHistory
    await tx.stockHistory.create({
      data: {
        partId: part.id,
        type: 'INCREASE',
        quantity: allocation.quantity,
        reason: `Deallocated from Job Card ${allocation.jobCardId}`,
        userId
      }
    });

    // 7. Clean up matching allocated items from JobCard's parts JSON array and recalculate invoice total
    const targetName = `${part.name} (PartNo: ${part.partNo})`;
    const currentParts = Array.isArray(jobCard.parts) ? jobCard.parts : [];
    
    // We want to filter out exactly `allocation.quantity` elements matching the part's name.
    let remainingToRemove = allocation.quantity;
    const updatedParts = currentParts.filter(item => {
      if (item.name === targetName && remainingToRemove > 0) {
        remainingToRemove--;
        return false;
      }
      return true;
    });

    // Recompute totalCost
    const newTotalCost = updatedParts.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

    const updatedJobCard = await tx.jobCard.update({
      where: { id: allocation.jobCardId },
      data: {
        parts: updatedParts,
        totalCost: newTotalCost
      }
    });

    return updatedJobCard;
  });
};

/**
 * Service to fetch low-stock parts (paginated)
 */
export const getLowStockParts = async (query = {}) => {
  const { page = 1, limit = 10 } = query;
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  // Criteria: stock <= minStock and stock > 0, isDeleted = false
  const where = {
    isDeleted: false,
    stock: {
      gt: 0
    },
    AND: [
      {
        stock: {
          lte: prisma.sparePart.fields?.minStock || 0 // fallback handled dynamically in DB query
        }
      }
    ]
  };

  // Raw SQL/alternative filter fallback since Prisma doesn't support comparing fields natively in where.
  // We can select all parts and filter in memory, or use $queryRaw.
  // Given SQLite or PostgreSQL pool details: let's query all active parts and filter in service layer, 
  // keeping pagination correct! This is extremely safe and prevents syntax issues.
  const allActiveParts = await prisma.sparePart.findMany({
    where: { isDeleted: false }
  });

  const lowStock = allActiveParts.filter(p => p.stock <= p.minStock && p.stock > 0);
  const paginated = lowStock.slice(skip, skip + parsedLimit);

  return {
    parts: paginated,
    total: lowStock.length,
    page: parsedPage,
    limit: parsedLimit,
    totalPages: Math.ceil(lowStock.length / parsedLimit)
  };
};

/**
 * Service to fetch out-of-stock parts (paginated)
 */
export const getOutOfStockParts = async (query = {}) => {
  const { page = 1, limit = 10 } = query;
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const where = {
    isDeleted: false,
    stock: 0
  };

  const [parts, total] = await Promise.all([
    prisma.sparePart.findMany({
      where,
      skip,
      take: parsedLimit
    }),
    prisma.sparePart.count({ where })
  ]);

  return {
    parts,
    total,
    page: parsedPage,
    limit: parsedLimit,
    totalPages: Math.ceil(total / parsedLimit)
  };
};

/**
 * Service to compute dashboard catalog KPI metrics
 */
export const getDashboardMetrics = async () => {
  const activeParts = await prisma.sparePart.findMany({
    where: { isDeleted: false }
  });

  const totalParts = activeParts.length;
  const outOfStockCount = activeParts.filter(p => p.stock === 0).length;
  const lowStockCount = activeParts.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const totalInventoryValue = activeParts.reduce((sum, p) => sum + (p.stock * p.price), 0);

  return {
    totalParts,
    lowStockCount,
    outOfStockCount,
    totalInventoryValue
  };
};

/**
 * Service to fetch paginated stock audit histories
 */
export const getStockHistory = async (query = {}) => {
  const { partId, page = 1, limit = 10 } = query;
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const where = {};
  if (partId) {
    where.partId = parseInt(partId, 10);
  }

  const [history, total] = await Promise.all([
    prisma.stockHistory.findMany({
      where,
      include: {
        part: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parsedLimit
    }),
    prisma.stockHistory.count({ where })
  ]);

  return {
    history,
    total,
    page: parsedPage,
    limit: parsedLimit,
    totalPages: Math.ceil(total / parsedLimit)
  };
};
