import { prisma } from '../config/database.js';

class AdminRepository {
  /**
   * Fetch all stats cards counts.
   */
  async getDashboardStats() {
    const totalUsers = await prisma.users.count({ where: { deleted_at: null } });
    const totalDonors = await prisma.users.count({ where: { role: 'DONOR', deleted_at: null } });
    const totalNgos = await prisma.ngos.count({ where: { deleted_at: null } });
    const verifiedNgos = await prisma.ngos.count({ where: { status: 'VERIFIED', deleted_at: null } });
    const pendingNgos = await prisma.ngos.count({ where: { status: 'PENDING', deleted_at: null } });
    const totalVolunteers = await prisma.volunteers.count({ where: { deleted_at: null } });
    const onlineVolunteers = await prisma.volunteers.count({ where: { online_status: 'ONLINE', deleted_at: null } });
    const offlineVolunteers = await prisma.volunteers.count({ where: { online_status: 'OFFLINE', deleted_at: null } });
    const activeDonations = await prisma.food_donations.count({ where: { status: 'AVAILABLE', deleted_at: null } });
    const pendingRequests = await prisma.donation_requests.count({ where: { request_status: 'PENDING', deleted_at: null } });
    const activeDeliveries = await prisma.deliveries.count({ where: { delivery_status: { in: ['ACCEPTED', 'ON_THE_WAY_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_DESTINATION'] }, deleted_at: null } });
    const completedDeliveries = await prisma.deliveries.count({ where: { delivery_status: 'DELIVERED', deleted_at: null } });
    const expiredDonations = await prisma.food_donations.count({ where: { status: 'EXPIRED', deleted_at: null } });
    const cancelledDonations = await prisma.food_donations.count({ where: { status: 'CANCELLED', deleted_at: null } });
    const pendingComplaints = await prisma.complaints.count({ where: { status: 'PENDING', deleted_at: null } });
    const resolvedComplaints = await prisma.complaints.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] }, deleted_at: null } });

    // Calculate food totals saved
    const completedDonations = await prisma.food_donations.findMany({
      where: { status: 'DELIVERED', deleted_at: null },
      select: { quantity: true, number_of_people: true },
    });

    let foodSaved = 0;
    let peopleHelped = 0;
    completedDonations.forEach((d) => {
      foodSaved += d.quantity || 0;
      peopleHelped += d.number_of_people || 0;
    });

    const mealsServed = Math.round(foodSaved * 2.5); // Fallback conversion: 1 KG = 2.5 meals

    return {
      totalUsers,
      totalDonors,
      totalNgos,
      verifiedNgos,
      pendingNgos,
      totalVolunteers,
      onlineVolunteers,
      offlineVolunteers,
      activeDonations,
      pendingRequests,
      activeDeliveries,
      completedDeliveries,
      expiredDonations,
      cancelledDonations,
      foodSaved: Number(foodSaved.toFixed(1)),
      estimatedMealsServed: mealsServed,
      peopleHelped,
      pendingComplaints,
      resolvedComplaints,
    };
  }

  /**
   * Fetch all users matching pagination filters.
   */
  async findUsers({ page = 1, limit = 10, search = '', status = '', role = '' }) {
    const offset = (page - 1) * limit;
    const where = {
      deleted_at: null,
      AND: [
        search
          ? {
              OR: [
                { full_name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
              ],
            }
          : {},
        status ? { status } : {},
        role ? { role } : {},
      ],
    };

    const [total, list] = await Promise.all([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return { total, list };
  }

  /**
   * Fetch specific user details with audit events.
   */
  async findUserById(id) {
    return prisma.users.findUnique({
      where: { id },
      include: {
        ngos: true,
        volunteers: true,
        audit_logs: {
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Update user details.
   */
  async updateUser(id, data) {
    return prisma.users.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Suspend/activate/block user status.
   */
  async updateUserStatus(id, status) {
    return prisma.users.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Soft delete user profile.
   */
  async deleteUser(id) {
    return prisma.users.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        status: 'INACTIVE',
      },
    });
  }

  /**
   * Restore soft-deleted user profile.
   */
  async restoreUser(id) {
    return prisma.users.update({
      where: { id },
      data: {
        deleted_at: null,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Fetch NGOs lists.
   */
  async findNgos({ status = '' }) {
    const where = {
      deleted_at: null,
      status: status ? status : undefined,
    };
    return prisma.ngos.findMany({
      where,
      include: { user: true },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Fetch NGO detailed specifications.
   */
  async findNgoById(id) {
    return prisma.ngos.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  /**
   * Verify/reject NGO status.
   */
  async updateNgoStatus(id, status, verified) {
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
   * Fetch Volunteers lists.
   */
  async findVolunteers() {
    return prisma.volunteers.findMany({
      where: { deleted_at: null },
      include: {
        user: true,
        deliveries: {
          select: { id: true, delivery_status: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Fetch active coordinate telemetries for Leaflet live map.
   */
  async getLiveTrackingPoints() {
    const activeDeliveries = await prisma.deliveries.findMany({
      where: {
        delivery_status: {
          in: ['ON_THE_WAY_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_DESTINATION'],
        },
        deleted_at: null,
      },
      include: {
        volunteer: {
          include: { user: true },
        },
        donation_request: {
          include: {
            donation: true,
            ngo: true,
          },
        },
      },
    });

    return activeDeliveries.map((d) => ({
      deliveryId: d.id,
      status: d.delivery_status,
      volunteer: {
        id: d.volunteer?.id,
        name: d.volunteer?.user?.full_name,
        lat: d.volunteer?.current_latitude,
        lng: d.volunteer?.current_longitude,
        phone: d.volunteer?.user?.phone,
      },
      pickup: {
        name: d.donation_request?.donation?.food_name,
        address: d.donation_request?.donation?.pickup_address,
        lat: d.donation_request?.donation?.pickup_latitude,
        lng: d.donation_request?.donation?.pickup_longitude,
      },
      destination: {
        ngoName: d.donation_request?.ngo?.organization_name,
        address: d.donation_request?.ngo?.address,
        lat: d.donation_request?.ngo?.latitude,
        lng: d.donation_request?.ngo?.longitude,
      },
    }));
  }

  /**
   * Fetch complaints lists.
   */
  async findComplaints({ status = '' }) {
    const where = {
      deleted_at: null,
      status: status ? status : undefined,
    };
    return prisma.complaints.findMany({
      where,
      include: { user: true },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Update complaint status.
   */
  async updateComplaint(id, status, responseText) {
    return prisma.complaints.update({
      where: { id },
      data: {
        status,
        admin_response: responseText,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Fetch audit logs indices.
   */
  async findAuditLogs({ search = '', limit = 100 }) {
    return prisma.audit_logs.findMany({
      where: {
        deleted_at: null,
        OR: search
          ? [
              { action: { contains: search } },
              { table_name: { contains: search } },
            ]
          : undefined,
      },
      include: { user: true },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }
}

const adminRepository = new AdminRepository();
export default adminRepository;
