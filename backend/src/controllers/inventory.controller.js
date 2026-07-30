import * as inventoryService from '../services/inventory.service.js';
import { sendSuccess } from '../utils/responseHelper.js';

export const createPart = async (req, res, next) => {
  try {
    const part = await inventoryService.createPart(req.body, req.user.id);
    return sendSuccess(res, 211, 'Spare part registered successfully', part);
  } catch (error) {
    next(error);
  }
};

export const getParts = async (req, res, next) => {
  try {
    const result = await inventoryService.getParts(req.query);
    return sendSuccess(res, 200, 'Spare parts retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getPartById = async (req, res, next) => {
  try {
    const part = await inventoryService.getPartById(req.params.id);
    return sendSuccess(res, 200, 'Spare part retrieved successfully', part);
  } catch (error) {
    next(error);
  }
};

export const updatePart = async (req, res, next) => {
  try {
    const part = await inventoryService.updatePart(req.params.id, req.body, req.user.id);
    return sendSuccess(res, 200, 'Spare part updated successfully', part);
  } catch (error) {
    next(error);
  }
};

export const deletePart = async (req, res, next) => {
  try {
    const part = await inventoryService.deletePart(req.params.id, req.user.id);
    return sendSuccess(res, 200, 'Spare part soft-deleted successfully', part);
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const part = await inventoryService.adjustStock(req.params.id, req.body, req.user.id);
    return sendSuccess(res, 200, 'Stock adjusted successfully', part);
  } catch (error) {
    next(error);
  }
};

export const allocatePart = async (req, res, next) => {
  try {
    const jobCard = await inventoryService.allocatePart(req.body, req.user.id);
    return sendSuccess(res, 200, 'Part allocated to job card successfully', jobCard);
  } catch (error) {
    next(error);
  }
};

export const removePartAllocation = async (req, res, next) => {
  try {
    const jobCard = await inventoryService.removePartAllocation(req.params.id, req.user.id);
    return sendSuccess(res, 200, 'Part deallocated from job card successfully', jobCard);
  } catch (error) {
    next(error);
  }
};

export const getLowStockParts = async (req, res, next) => {
  try {
    const result = await inventoryService.getLowStockParts(req.query);
    return sendSuccess(res, 200, 'Low stock alerts retrieved', result);
  } catch (error) {
    next(error);
  }
};

export const getOutOfStockParts = async (req, res, next) => {
  try {
    const result = await inventoryService.getOutOfStockParts(req.query);
    return sendSuccess(res, 200, 'Out of stock items retrieved', result);
  } catch (error) {
    next(error);
  }
};

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await inventoryService.getDashboardMetrics();
    return sendSuccess(res, 200, 'Dashboard inventory metrics retrieved', metrics);
  } catch (error) {
    next(error);
  }
};

export const getStockHistory = async (req, res, next) => {
  try {
    const result = await inventoryService.getStockHistory(req.query);
    return sendSuccess(res, 200, 'Stock history log retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};
