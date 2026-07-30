import * as leadService from '../services/lead.service.js';
import { sendSuccess } from '../utils/responseHelper.js';

/**
 * Controller to fetch all customer leads
 */
export const getLeads = async (req, res, next) => {
  try {
    const leads = await leadService.getLeads();
    return sendSuccess(res, 200, 'Leads retrieved successfully', leads);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to create a new customer lead
 */
export const createLead = async (req, res, next) => {
  try {
    const lead = await leadService.createLead(req.body);
    return sendSuccess(res, 201, 'Lead created successfully', lead);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update a customer lead status
 */
export const updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead(req.params.id, req.body);
    return sendSuccess(res, 200, 'Lead updated successfully', lead);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete a customer lead (Admin only)
 */
export const deleteLead = async (req, res, next) => {
  try {
    const result = await leadService.deleteLead(req.params.id);
    return sendSuccess(res, 200, 'Lead deleted successfully', result);
  } catch (error) {
    next(error);
  }
};
