import * as jobCardService from '../services/jobCard.service.js';
import { sendSuccess } from '../utils/responseHelper.js';

/**
 * Controller to fetch all job cards (customer context vs global queue)
 */
export const getJobCards = async (req, res, next) => {
  try {
    const jobCards = await jobCardService.getJobCards(req.user.id, req.user.role);
    return sendSuccess(res, 200, 'Job cards retrieved successfully', jobCards);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch a specific job card by ID
 */
export const getJobCardById = async (req, res, next) => {
  try {
    const jobCard = await jobCardService.getJobCardById(req.params.id);
    return sendSuccess(res, 200, 'Job card retrieved successfully', jobCard);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update job card status, technician assignee, or pricing metrics (staff only)
 */
export const updateJobCard = async (req, res, next) => {
  try {
    const jobCard = await jobCardService.updateJobCard(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    return sendSuccess(res, 200, 'Job card updated successfully', jobCard);
  } catch (error) {
    next(error);
  }
};
