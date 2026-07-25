import requestService from '../services/request.service.js';
import { createRequestSchema } from '../validators/ngo.validator.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import logger from '../utils/logger.js';

class RequestController {
  /**
   * Submit food claim request.
   */
  async submitRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const request = await requestService.submitRequest(userId, req.body);

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Food claim request submitted successfully.',
        data: request,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieve single request details.
   */
  async getRequestDetails(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const request = await requestService.getDetails(id, userId, role);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Request details retrieved successfully.',
        data: request,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Cancel pending claim request.
   */
  async cancelRequest(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const cancelled = await requestService.cancelRequest(id, userId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Food request cancelled successfully.',
        data: cancelled,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * List paginated request history.
   */
  async getRequestHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 10),
        search: req.query.search || '',
        status: req.query.status || '',
        category: req.query.category || '',
      };

      const result = await requestService.getHistory(userId, filters);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Request history retrieved successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Submit delivery feedback.
   */
  async submitFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { rating, review } = req.body;

      const feedback = await requestService.submitFeedback(userId, id, { rating, review });

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Delivery feedback submitted successfully.',
        data: feedback,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new RequestController();
