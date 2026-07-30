import prisma from '../config/prisma.js';

/**
 * Service to retrieve a list of cars with pagination, search, filters, and sorting
 * @param {object} filters - { search, type, minPrice, maxPrice, page, limit, sortBy, sortOrder }
 */
export const getCars = async (filters = {}) => {
  const {
    search,
    type,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  // Build Prisma where filter object
  const where = {};

  if (search) {
    where.OR = [
      { make: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (type) {
    where.type = { equals: type, mode: 'insensitive' };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) {
      where.price.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      where.price.lte = parseFloat(maxPrice);
    }
  }

  // Count total records matching filters
  const totalItems = await prisma.car.count({ where });

  // Query database
  const cars = await prisma.car.findMany({
    where,
    skip,
    take: limitNum,
    orderBy: {
      [sortBy]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc'
    }
  });

  const totalPages = Math.ceil(totalItems / limitNum);

  return {
    cars,
    pagination: {
      totalItems,
      totalPages,
      currentPage: pageNum,
      limit: limitNum
    }
  };
};

/**
 * Service to fetch a single car by its ID
 * @param {number} id
 */
export const getCarById = async (id) => {
  const carId = parseInt(id, 10);
  if (isNaN(carId)) {
    const error = new Error('Invalid car ID format');
    error.statusCode = 400;
    throw error;
  }

  const car = await prisma.car.findUnique({
    where: { id: carId }
  });

  if (!car) {
    const error = new Error('Car not found');
    error.statusCode = 404;
    throw error;
  }

  return car;
};

/**
 * Service to create a new car listing
 * @param {object} carData
 */
export const createCar = async (carData) => {
  const {
    make,
    model,
    year,
    price,
    type,
    image,
    images = [],
    power,
    acceleration,
    range,
    topSpeed
  } = carData;

  const car = await prisma.car.create({
    data: {
      make,
      model,
      year: parseInt(year, 10),
      price: parseFloat(price),
      type,
      image,
      images,
      power,
      acceleration,
      range,
      topSpeed
    }
  });

  return car;
};

/**
 * Service to update an existing car listing
 * @param {number} id
 * @param {object} carData
 */
export const updateCar = async (id, carData) => {
  const carId = parseInt(id, 10);

  // Validate existence
  await getCarById(carId);

  const parsedData = { ...carData };
  if (parsedData.year) parsedData.year = parseInt(parsedData.year, 10);
  if (parsedData.price) parsedData.price = parseFloat(parsedData.price);

  const car = await prisma.car.update({
    where: { id: carId },
    data: parsedData
  });

  return car;
};

/**
 * Service to delete a car listing
 * @param {number} id
 */
export const deleteCar = async (id) => {
  const carId = parseInt(id, 10);

  // Validate existence
  await getCarById(carId);

  await prisma.car.delete({
    where: { id: carId }
  });

  return { id: carId };
};
