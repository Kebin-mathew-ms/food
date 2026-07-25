import { prisma } from '../config/database.js';

class ReportService {
  /**
   * Fetch matching logs data based on type criteria and date bounds.
   */
  async generateReportData(type, start, end) {
    const fromDate = new Date(start);
    const toDate = new Date(end);
    toDate.setHours(23, 59, 59, 999);

    if (type === 'USERS') {
      return prisma.users.findMany({
        where: {
          created_at: { gte: fromDate, lte: toDate },
        },
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          status: true,
          created_at: true,
        },
      });
    }

    if (type === 'DONATIONS') {
      return prisma.food_donations.findMany({
        where: {
          created_at: { gte: fromDate, lte: toDate },
        },
        include: {
          donor: { select: { full_name: true } },
        },
      });
    }

    if (type === 'NGOS') {
      return prisma.ngos.findMany({
        where: {
          created_at: { gte: fromDate, lte: toDate },
        },
        include: {
          user: { select: { full_name: true, email: true } },
        },
      });
    }

    if (type === 'VOLUNTEERS') {
      return prisma.volunteers.findMany({
        where: {
          created_at: { gte: fromDate, lte: toDate },
        },
        include: {
          user: { select: { full_name: true, email: true } },
        },
      });
    }

    if (type === 'DELIVERIES') {
      return prisma.deliveries.findMany({
        where: {
          created_at: { gte: fromDate, lte: toDate },
        },
        include: {
          volunteer: { include: { user: { select: { full_name: true } } } },
          donation_request: { include: { ngo: true, donation: true } },
        },
      });
    }

    if (type === 'COMPLAINTS') {
      return prisma.complaints.findMany({
        where: {
          created_at: { gte: fromDate, lte: toDate },
        },
        include: {
          user: { select: { full_name: true } },
        },
      });
    }

    if (type === 'FOOD_WASTE') {
      // Fetch details of DELIVERED donations
      return prisma.food_donations.findMany({
        where: {
          status: 'DELIVERED',
          created_at: { gte: fromDate, lte: toDate },
        },
        select: {
          id: true,
          food_name: true,
          food_category: true,
          quantity: true,
          quantity_unit: true,
          prepared_at: true,
          created_at: true,
        },
      });
    }

    return [];
  }
}

const reportService = new ReportService();
export default reportService;
