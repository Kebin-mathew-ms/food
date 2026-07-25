import { prisma } from '../config/database.js';

class NgoRepository {
  /**
   * Find NGO profile details by User ID.
   */
  async findByUserId(userId) {
    return prisma.ngos.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Find NGO profile details by NGO ID.
   */
  async findById(id) {
    return prisma.ngos.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Complete or update NGO profile info.
   */
  async upsert(userId, profileData) {
    const existing = await prisma.ngos.findUnique({
      where: { user_id: userId },
    });

    if (existing) {
      return prisma.ngos.update({
        where: { user_id: userId },
        data: {
          ...profileData,
          updated_at: new Date(),
        },
      });
    }

    return prisma.ngos.create({
      data: {
        user_id: userId,
        ...profileData,
      },
    });
  }

  /**
   * Update NGO verification status.
   */
  async updateStatus(id, status, verified = false) {
    return prisma.ngos.update({
      where: { id },
      data: {
        status,
        verified,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Aggregate NGO Dashboard stats.
   */
  async getDashboardStats(ngoId) {
    // Counts approved requests
    const approvedCount = await prisma.donation_requests.count({
      where: {
        ngo_id: ngoId,
        request_status: 'APPROVED',
        deleted_at: null,
      },
    });

    // Counts pending requests
    const pendingCount = await prisma.donation_requests.count({
      where: {
        ngo_id: ngoId,
        request_status: 'PENDING',
        deleted_at: null,
      },
    });

    // Counts rejected requests
    const rejectedCount = await prisma.donation_requests.count({
      where: {
        ngo_id: ngoId,
        request_status: 'REJECTED',
        deleted_at: null,
      },
    });

    // Counts completed deliveries (status = DELIVERED)
    const completedCount = await prisma.donation_requests.count({
      where: {
        ngo_id: ngoId,
        request_status: 'DELIVERED',
        deleted_at: null,
      },
    });

    // Estimate meals & people served sum from completed requests
    const completedRequests = await prisma.donation_requests.findMany({
      where: {
        ngo_id: ngoId,
        request_status: 'DELIVERED',
        deleted_at: null,
      },
      include: {
        donation: {
          select: {
            quantity: true,
            number_of_people: true,
          },
        },
      },
    });

    const meals = completedRequests.reduce((sum, req) => sum + (req.donation?.quantity || 0), 0);
    const people = completedRequests.reduce((sum, req) => sum + (req.donation?.number_of_people || 0), 0);

    return {
      APPROVED: approvedCount,
      PENDING: pendingCount,
      REJECTED: rejectedCount,
      COMPLETED: completedCount,
      meals,
      people,
    };
  }
}

export default new NgoRepository();
