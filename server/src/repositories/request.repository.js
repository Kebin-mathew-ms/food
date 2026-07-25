import { prisma } from '../config/database.js';

class RequestRepository {
  /**
   * Submit a new claim request for a donation.
   */
  async create(data) {
    return prisma.donation_requests.create({
      data,
      include: {
        donation: {
          include: {
            donation_images: true,
          },
        },
      },
    });
  }

  /**
   * Find request by ID, including donation details and volunteer status.
   */
  async findById(id) {
    return prisma.donation_requests.findUnique({
      where: { id },
      include: {
        donation: {
          include: {
            donation_images: true,
            donor: {
              select: {
                full_name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        ngo: true,
        delivery: {
          include: {
            volunteer: {
              include: {
                user: {
                  select: {
                    full_name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Check if a PENDING or APPROVED request already exists from this NGO for this donation.
   */
  async findActiveRequest(ngoId, donationId) {
    return prisma.donation_requests.findFirst({
      where: {
        ngo_id: ngoId,
        donation_id: donationId,
        request_status: {
          in: ['PENDING', 'APPROVED', 'ASSIGNED', 'PICKED_UP'],
        },
        deleted_at: null,
      },
    });
  }

  /**
   * Update request status.
   */
  async updateStatus(id, request_status) {
    return prisma.donation_requests.update({
      where: { id },
      data: {
        request_status,
        updated_at: new Date(),
        // If approved or rejected, capture timestamp
        approved_at: request_status === 'APPROVED' ? new Date() : undefined,
        rejected_at: request_status === 'REJECTED' ? new Date() : undefined,
      },
      include: {
        donation: true,
        ngo: true,
      },
    });
  }

  /**
   * Retrieve request list history with filtering, searching, and pagination.
   */
  async findHistory(ngoId, filters = {}) {
    const { page = 1, limit = 10, search = '', status = '', category = '' } = filters;
    const skip = (page - 1) * limit;

    const whereClause = {
      ngo_id: ngoId,
      deleted_at: null,
      ...(status ? { request_status: status } : {}),
      donation: {
        ...(category ? { food_category: category } : {}),
        OR: [
          { food_name: { contains: search } },
          { description: { contains: search } },
          { pickup_city: { contains: search } },
        ],
      },
    };

    const records = await prisma.donation_requests.findMany({
      where: whereClause,
      include: {
        donation: {
          include: {
            donation_images: true,
            donor: {
              select: {
                full_name: true,
              },
            },
          },
        },
        delivery: {
          include: {
            volunteer: {
              include: {
                user: {
                  select: {
                    full_name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: Number(skip),
      take: Number(limit),
    });

    return records;
  }

  /**
   * Count historical records matching query filters.
   */
  async countHistory(ngoId, filters = {}) {
    const { search = '', status = '', category = '' } = filters;

    const whereClause = {
      ngo_id: ngoId,
      deleted_at: null,
      ...(status ? { request_status: status } : {}),
      donation: {
        ...(category ? { food_category: category } : {}),
        OR: [
          { food_name: { contains: search } },
          { description: { contains: search } },
          { pickup_city: { contains: search } },
        ],
      },
    };

    return prisma.donation_requests.count({
      where: whereClause,
    });
  }
}

export default new RequestRepository();
