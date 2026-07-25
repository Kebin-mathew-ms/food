import { prisma } from '../config/database.js';

/**
 * DonationRepository wrapper for Food Donation database actions.
 */
class DonationRepository {
  /**
   * Create a new food donation.
   */
  async create(data) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');
    return prisma.food_donations.create({
      data,
      include: {
        donation_images: true,
      },
    });
  }

  /**
   * Update donation record.
   */
  async update(id, data) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');
    return prisma.food_donations.update({
      where: { id },
      data,
      include: {
        donation_images: {
          orderBy: { display_order: 'asc' },
        },
      },
    });
  }

  /**
   * Find single food donation by ID.
   */
  async findById(id) {
    if (!prisma) return null;
    return prisma.food_donations.findFirst({
      where: { id, deleted_at: null },
      include: {
        donor: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            profile_image: true,
          },
        },
        donation_images: {
          orderBy: { display_order: 'asc' },
        },
        donation_requests: {
          where: { deleted_at: null },
          include: {
            ngo: true,
          },
        },
      },
    });
  }

  /**
   * Soft-delete donation.
   */
  async delete(id) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');
    return prisma.food_donations.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Restore soft-deleted donation (Admin only).
   */
  async restore(id) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');
    return prisma.food_donations.update({
      where: { id },
      data: { deleted_at: null },
    });
  }

  /**
   * Find paginated list of donations matching filters.
   */
  async findAll({
    search,
    category,
    type,
    status,
    donorId,
    startDate,
    endDate,
    expiryToday,
    expired,
    availableOnly,
    city,
    state,
    sort = 'created_at',
    order = 'desc',
    skip = 0,
    take = 10,
  }) {
    if (!prisma) return [];

    const where = this._buildWhereClause({
      search,
      category,
      type,
      status,
      donorId,
      startDate,
      endDate,
      expiryToday,
      expired,
      availableOnly,
      city,
      state,
    });

    const orderBy = {};
    if (sort === 'expiry') {
      orderBy.expiry_time = order;
    } else {
      orderBy[sort] = order;
    }

    return prisma.food_donations.findMany({
      where,
      include: {
        donation_images: {
          orderBy: { display_order: 'asc' },
        },
        donor: {
          select: {
            id: true,
            full_name: true,
            profile_image: true,
          },
        },
      },
      orderBy,
      skip,
      take,
    });
  }

  /**
   * Count total record count matching filters.
   */
  async countAll(filters) {
    if (!prisma) return 0;
    const where = this._buildWhereClause(filters);
    return prisma.food_donations.count({ where });
  }

  /**
   * Save an image record link.
   */
  async createImage(data) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');
    return prisma.donation_images.create({ data });
  }

  /**
   * Delete an image record from DB.
   */
  async deleteImage(id) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');
    return prisma.donation_images.delete({ where: { id } });
  }

  /**
   * Find image metadata by image ID.
   */
  async findImageById(id) {
    if (!prisma) return null;
    return prisma.donation_images.findUnique({ where: { id } });
  }

  /**
   * Reorder image indexes in database.
   */
  async reorderImages(donationId, orderedImageIds) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');

    const updates = orderedImageIds.map((id, index) =>
      prisma.donation_images.update({
        where: { id, donation_id: donationId },
        data: { display_order: index },
      })
    );

    return prisma.$transaction(updates);
  }

  /**
   * Get donor metrics and statistics.
   */
  async findStatsByDonor(donorId) {
    if (!prisma) return {};

    const where = { donor_id: donorId, deleted_at: null };

    // Fetch grouped counts by status
    const groupStatus = await prisma.food_donations.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
      _sum: { quantity: true, number_of_people: true },
    });

    const stats = {
      ACTIVE: 0,
      PENDING: 0,
      APPROVED: 0,
      COMPLETED: 0,
      EXPIRED: 0,
      CANCELLED: 0,
      meals: 0,
      people: 0,
    };

    groupStatus.forEach((group) => {
      const cnt = group._count.id;
      if (group.status === 'AVAILABLE') stats.ACTIVE += cnt;
      if (group.status === 'REQUESTED') stats.PENDING += cnt;
      if (group.status === 'APPROVED') stats.APPROVED += cnt;
      if (group.status === 'PICKED_UP' || group.status === 'DELIVERED') stats.COMPLETED += cnt;
      if (group.status === 'EXPIRED') stats.EXPIRED += cnt;
      if (group.status === 'CANCELLED') stats.CANCELLED += cnt;

      stats.meals += group._sum.quantity || 0;
      stats.people += group._sum.number_of_people || 0;
    });

    return stats;
  }

  /**
   * Helper to build Prisma filters object.
   * @private
   */
  _buildWhereClause({
    search,
    category,
    type,
    status,
    donorId,
    startDate,
    endDate,
    expiryToday,
    expired,
    availableOnly,
    city,
    state,
  }) {
    const where = { deleted_at: null };

    if (donorId) where.donor_id = donorId;
    if (category) where.food_category = category;
    if (type) where.food_type = type;
    if (status) where.status = status;
    if (city) where.pickup_city = { contains: city };
    if (state) where.pickup_state = { contains: state };

    // Handle full-text search constraints
    if (search) {
      where.OR = [
        { food_name: { contains: search } },
        { description: { contains: search } },
        { pickup_address: { contains: search } },
      ];
    }

    // Handle date ranges
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    // Filter by availability / exps
    const now = new Date();
    if (expiryToday) {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      where.expiry_time = {
        gte: now,
        lte: endOfDay,
      };
      where.status = 'AVAILABLE';
    } else if (expired) {
      where.OR = [
        { status: 'EXPIRED' },
        { expiry_time: { lt: now } }
      ];
    } else if (availableOnly) {
      where.status = 'AVAILABLE';
      where.expiry_time = { gte: now };
    }

    return where;
  }
}

export default new DonationRepository();
