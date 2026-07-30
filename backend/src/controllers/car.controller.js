import * as carService from '../services/car.service.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryHelper.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

/**
 * Format flat Car object into frontend-compatible nested spec format
 */
const formatCarResponse = (car) => {
  if (!car) return null;
  const { power, acceleration, range, topSpeed, ...rest } = car;
  return {
    ...rest,
    specs: {
      power: power || '',
      acceleration: acceleration || '',
      range: range || '',
      topSpeed: topSpeed || ''
    }
  };
};

/**
 * Controller to fetch all cars matching query filters
 */
export const getCars = async (req, res, next) => {
  try {
    const result = await carService.getCars(req.query);
    const formattedCars = result.cars.map(formatCarResponse);
    return sendSuccess(res, 200, 'Cars retrieved successfully', {
      cars: formattedCars,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch a single car by its ID
 */
export const getCarById = async (req, res, next) => {
  try {
    const car = await carService.getCarById(req.params.id);
    return sendSuccess(res, 200, 'Car retrieved successfully', formatCarResponse(car));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to create a new car listing (Admin only)
 */
export const createCar = async (req, res, next) => {
  try {
    const carData = { ...req.body };
    const uploadedImages = [];

    // Parse uploaded image files via Multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadBufferToCloudinary(file.buffer);
        uploadedImages.push(uploadResult.secure_url);
      }
      carData.images = uploadedImages;
      
      // Auto-populate the main thumbnail to the first uploaded file if not explicitly set
      if (!carData.image && uploadedImages.length > 0) {
        carData.image = uploadedImages[0];
      }
    }

    // Default fallback image if none provided
    if (!carData.image) {
      carData.image = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800';
    }

    const car = await carService.createCar(carData);
    return sendSuccess(res, 201, 'Car created successfully', formatCarResponse(car));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update a car listing (Admin only)
 */
export const updateCar = async (req, res, next) => {
  try {
    const carData = { ...req.body };
    const uploadedImages = [];

    // Parse newly uploaded image files via Multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadBufferToCloudinary(file.buffer);
        uploadedImages.push(uploadResult.secure_url);
      }
      carData.images = uploadedImages;
      
      // Auto-populate main thumbnail to the first uploaded file if not explicitly set
      if (!carData.image && uploadedImages.length > 0) {
        carData.image = uploadedImages[0];
      }
    }

    const car = await carService.updateCar(req.params.id, carData);
    return sendSuccess(res, 200, 'Car updated successfully', formatCarResponse(car));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete a car listing (Admin only)
 */
export const deleteCar = async (req, res, next) => {
  try {
    const result = await carService.deleteCar(req.params.id);
    return sendSuccess(res, 200, 'Car deleted successfully', result);
  } catch (error) {
    next(error);
  }
};
