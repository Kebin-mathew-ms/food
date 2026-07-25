import reportService from '../services/report.service.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { successResponse } from '../helpers/response.helper.js';

class ReportController {
  /**
   * Fetch matching report data index based on date bounds.
   */
  async getReportsData(req, res, next) {
    try {
      const type = req.query.type || 'USERS';
      const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = req.query.endDate || new Date().toISOString();

      const data = await reportService.generateReportData(type, startDate, endDate);
      return successResponse(res, HTTP_STATUS.OK, 'Report logs generated.', data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export reports tables index.
   */
  async exportReport(req, res, next) {
    try {
      const { type, startDate, endDate } = req.body;
      const data = await reportService.generateReportData(type, startDate, endDate);
      
      // Returns matching data payload which the client can convert to CSV/Excel/PDF directly.
      return successResponse(res, HTTP_STATUS.OK, `${type} report generated. ready to export.`, data);
    } catch (error) {
      next(error);
    }
  }
}

const reportController = new ReportController();
export default reportController;
