import { prisma } from '../config/database.js';

class VolunteerRepository {
  /**
   * Find volunteer profile by user ID.
   */
  async findByUserId(userId) {
    return prisma.volunteers.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
            phone: true,
            profile_image: true,
          },
        },
      },
    });
  }

  /**
   * Find volunteer profile by primary ID.
   */
  async findById(id) {
    return prisma.volunteers.findUnique({
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
   * Upsert volunteer profile configuration.
   */
  async upsert(userId, data) {
    const existing = await prisma.volunteers.findUnique({
      where: { user_id: userId },
    });

    if (existing) {
      return prisma.volunteers.update({
        where: { user_id: userId },
        data: {
          ...data,
          updated_at: new Date(),
        },
      });
    }

    return prisma.volunteers.create({
      data: {
        user_id: userId,
        ...data,
      },
    });
  }

  /**
   * Toggle availability and online status.
   */
  async updateStatus(id, onlineStatus) {
    const isOnline = onlineStatus === 'ONLINE';
    return prisma.volunteers.update({
      where: { id },
      data: {
        online_status: onlineStatus,
        is_online: isOnline,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Update active GPS telemetry location.
   */
  async updateLocation(id, lat, lng) {
    return prisma.volunteers.update({
      where: { id },
      data: {
        current_latitude: lat,
        current_longitude: lng,
        last_location_update: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Fetch active counts metrics for volunteer dashboard cards.
   */
  async getDashboardStats(volunteerId) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // 1. Get deliveries count by status
    const deliveries = await prisma.deliveries.findMany({
      where: { volunteer_id: volunteerId },
      select: {
        delivery_status: true,
        completion_time: true,
        feedback: {
          select: {
            rating: true,
          },
        },
      },
    });

    let assigned = 0;
    let pendingPickup = 0;
    let inProgress = 0;
    let completedToday = 0;
    let completedMonth = 0;
    let totalCompleted = 0;
    let totalRating = 0;
    let ratedCount = 0;

    deliveries.forEach((d) => {
      const status = d.delivery_status;
      if (status === 'ASSIGNED') {
        assigned++;
      } else if (['ACCEPTED', 'ON_THE_WAY_TO_PICKUP', 'ARRIVED_AT_PICKUP'].includes(status)) {
        pendingPickup++;
      } else if (['PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_DESTINATION'].includes(status)) {
        inProgress++;
      } else if (status === 'DELIVERED') {
        totalCompleted++;
        if (d.completion_time >= todayStart) completedToday++;
        if (d.completion_time >= monthStart) completedMonth++;
      }

      if (d.feedback) {
        totalRating += d.feedback.rating;
        ratedCount++;
      }
    });

    const averageRating = ratedCount > 0 ? Number((totalRating / ratedCount).toFixed(1)) : 5.0;

    return {
      assigned,
      pendingPickup,
      inProgress,
      completedToday,
      completedMonth,
      totalCompleted,
      averageRating,
    };
  }

  /**
   * Fetch recharts graph data lists.
   */
  async getMonthlyDeliveries(volunteerId) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const deliveries = await prisma.deliveries.findMany({
      where: {
        volunteer_id: volunteerId,
        delivery_status: 'DELIVERED',
        completion_time: { gte: sixMonthsAgo },
      },
      select: {
        completion_time: true,
      },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const buckets = {};

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = monthNames[d.getMonth()];
      buckets[label] = 0;
    }

    deliveries.forEach((d) => {
      const label = monthNames[d.completion_time.getMonth()];
      if (buckets[label] !== undefined) {
        buckets[label]++;
      }
    });

    return Object.entries(buckets)
      .reverse()
      .map(([month, deliveriesCount]) => ({ month, deliveries: deliveriesCount }));
  }
}

const volunteerRepository = new VolunteerRepository();
export default volunteerRepository;
