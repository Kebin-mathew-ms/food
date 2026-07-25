import { prisma } from '../config/database.js';
import { successResponse } from '../helpers/response.helper.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';

class AnalyticsController {
  /**
   * Aggregate analytic trends coordinates.
   */
  async getAnalytics(req, res, next) {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      // 1. Fetch registrations counts
      const users = await prisma.users.findMany({
        where: { created_at: { gte: sixMonthsAgo } },
        select: { created_at: true },
      });

      // 2. Fetch donations counts
      const donations = await prisma.food_donations.findMany({
        where: { created_at: { gte: sixMonthsAgo } },
        select: { created_at: true, food_category: true, food_type: true },
      });

      // 3. Fetch deliveries counts
      const deliveries = await prisma.deliveries.findMany({
        where: { created_at: { gte: sixMonthsAgo } },
        select: { created_at: true, delivery_status: true },
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyTrends = {};

      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const label = monthNames[date.getMonth()];
        monthlyTrends[label] = { donations: 0, deliveries: 0, registrations: 0 };
      }

      users.forEach((u) => {
        const label = monthNames[u.created_at.getMonth()];
        if (monthlyTrends[label]) monthlyTrends[label].registrations++;
      });

      donations.forEach((d) => {
        const label = monthNames[d.created_at.getMonth()];
        if (monthlyTrends[label]) monthlyTrends[label].donations++;
      });

      deliveries.forEach((del) => {
        const label = monthNames[del.created_at.getMonth()];
        if (monthlyTrends[label]) monthlyTrends[label].deliveries++;
      });

      const monthlyTrendsDataset = Object.entries(monthlyTrends)
        .reverse()
        .map(([month, data]) => ({ month, ...data }));

      // Categories distribution
      const categoryCounts = {};
      donations.forEach((d) => {
        categoryCounts[d.food_category] = (categoryCounts[d.food_category] || 0) + 1;
      });
      const categoriesDistribution = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

      // Food type distributions
      const typeCounts = {};
      donations.forEach((d) => {
        typeCounts[d.food_type] = (typeCounts[d.food_type] || 0) + 1;
      });
      const foodTypeDistribution = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

      // Deliveries Success Rate
      let completed = 0;
      let failed = 0;
      let cancelled = 0;
      deliveries.forEach((d) => {
        if (d.delivery_status === 'DELIVERED') completed++;
        else if (d.delivery_status === 'FAILED') failed++;
        else if (d.delivery_status === 'CANCELLED') cancelled++;
      });
      const successRate = [
        { name: 'Completed', value: completed },
        { name: 'Failed', value: failed },
        { name: 'Cancelled', value: cancelled },
      ];

      return successResponse(res, HTTP_STATUS.OK, 'System analytics trends compiled successfully.', {
        monthlyTrends: monthlyTrendsDataset,
        categoriesDistribution,
        foodTypeDistribution,
        successRate,
      });
    } catch (error) {
      next(error);
    }
  }
}

const analyticsController = new AnalyticsController();
export default analyticsController;
