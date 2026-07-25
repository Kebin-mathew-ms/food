import { prisma } from '../config/database.js';

class DeliveryRepository {
  /**
   * Find details of a single delivery assignment.
   */
  async findById(id) {
    return prisma.deliveries.findUnique({
      where: { id },
      include: {
        donation_request: {
          include: {
            donation: {
              include: {
                donor: {
                  select: {
                    full_name: true,
                    phone: true,
                  },
                },
                donation_images: true,
              },
            },
            ngo: {
              select: {
                organization_name: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
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
        feedback: true,
      },
    });
  }

  /**
   * List available assignments or assigned directly.
   */
  async findAssignments(volunteerId) {
    // Return all ASSIGNED deliveries that are either:
    // 1. Assigned directly to this volunteer.
    // 2. Unassigned (broadcast pool), which volunteers can browse and claim.
    return prisma.deliveries.findMany({
      where: {
        delivery_status: 'ASSIGNED',
        OR: [
          { volunteer_id: volunteerId },
          { volunteer_id: null },
        ],
        deleted_at: null,
      },
      include: {
        donation_request: {
          include: {
            donation: {
              include: {
                donor: {
                  select: {
                    full_name: true,
                    phone: true,
                  },
                },
              },
            },
            ngo: {
              select: {
                organization_name: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * List active accepted deliveries of a volunteer.
   */
  async findActiveDeliveries(volunteerId) {
    return prisma.deliveries.findMany({
      where: {
        volunteer_id: volunteerId,
        delivery_status: {
          in: [
            'ACCEPTED',
            'ON_THE_WAY_TO_PICKUP',
            'ARRIVED_AT_PICKUP',
            'PICKED_UP',
            'IN_TRANSIT',
            'ARRIVED_AT_DESTINATION',
          ],
        },
        deleted_at: null,
      },
      include: {
        donation_request: {
          include: {
            donation: {
              include: {
                donor: {
                  select: {
                    full_name: true,
                    phone: true,
                  },
                },
              },
            },
            ngo: {
              select: {
                organization_name: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  /**
   * Update status transitions.
   */
  async updateStatus(id, status) {
    return prisma.deliveries.update({
      where: { id },
      data: {
        delivery_status: status,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Accept assignment.
   */
  async acceptAssignment(id, volunteerId) {
    return prisma.deliveries.update({
      where: { id },
      data: {
        volunteer_id: volunteerId,
        delivery_status: 'ACCEPTED',
        updated_at: new Date(),
      },
    });
  }

  /**
   * Reject assignment.
   */
  async rejectAssignment(id) {
    // Clear volunteer binding and revert to ASSIGNED for someone else
    return prisma.deliveries.update({
      where: { id },
      data: {
        volunteer_id: null,
        delivery_status: 'ASSIGNED',
        updated_at: new Date(),
      },
    });
  }

  /**
   * Record pickup proof.
   */
  async savePickupProof(id, photoUrl, lat, lng) {
    return prisma.deliveries.update({
      where: { id },
      data: {
        pickup_photo: photoUrl,
        pickup_latitude: lat,
        pickup_longitude: lng,
        pickup_time: new Date(),
        delivery_status: 'PICKED_UP',
        updated_at: new Date(),
      },
    });
  }

  /**
   * Record delivery completion proofs and signature.
   */
  async saveDeliveryProof(id, photoUrl, signatureUrl, notes, lat, lng) {
    return prisma.deliveries.update({
      where: { id },
      data: {
        delivery_photo: photoUrl,
        proof_signature: signatureUrl,
        delivery_notes: notes,
        delivery_latitude: lat,
        delivery_longitude: lng,
        completion_time: new Date(),
        delivery_time: new Date(),
        delivery_status: 'DELIVERED',
        updated_at: new Date(),
      },
    });
  }

  /**
   * Fetch deliveries history.
   */
  async findHistory(volunteerId, status) {
    const statuses = status
      ? [status]
      : ['DELIVERED', 'FAILED', 'CANCELLED'];

    return prisma.deliveries.findMany({
      where: {
        volunteer_id: volunteerId,
        delivery_status: { in: statuses },
        deleted_at: null,
      },
      include: {
        donation_request: {
          include: {
            donation: true,
            ngo: true,
          },
        },
        feedback: true,
      },
      orderBy: {
        completion_time: 'desc',
      },
    });
  }
}

const deliveryRepository = new DeliveryRepository();
export default deliveryRepository;
