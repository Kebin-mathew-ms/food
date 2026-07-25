import { prisma } from '../config/database.js';
import { calculateDistance } from '../utils/distance.js';
import notificationService from './notification.service.js';
import logger from '../utils/logger.js';

class AssignmentService {
  /**
   * Automatically discover and match nearest volunteer within operating radius.
   * @param {string} deliveryId - Delivery UUID record
   */
  async autoAssignVolunteer(deliveryId) {
    try {
      const delivery = await prisma.deliveries.findUnique({
        where: { id: deliveryId },
        include: {
          donation_request: {
            include: {
              donation: true,
            },
          },
        },
      });

      if (!delivery) {
        logger.warn(`[Auto Assign] Delivery ${deliveryId} not found.`);
        return null;
      }

      const donation = delivery.donation_request?.donation;
      if (!donation) {
        logger.warn(`[Auto Assign] Donation record associated to ${deliveryId} not found.`);
        return null;
      }

      const pickupLat = donation.pickup_latitude;
      const pickupLng = donation.pickup_longitude;

      if (!pickupLat || !pickupLng) {
        logger.warn('[Auto Assign] Listing lacks coordinate geo parameters.');
        return null;
      }

      // Fetch all online volunteers who are not currently busy
      const volunteers = await prisma.volunteers.findMany({
        where: {
          online_status: 'ONLINE',
          deleted_at: null,
        },
        include: {
          user: true,
          deliveries: {
            where: {
              delivery_status: {
                in: ['ACCEPTED', 'ON_THE_WAY_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_DESTINATION'],
              },
            },
          },
        },
      });

      if (volunteers.length === 0) {
        logger.info('[Auto Assign] No online volunteers available currently.');
        return null;
      }

      const candidates = [];

      volunteers.forEach((v) => {
        const vLat = v.current_latitude;
        const vLng = v.current_longitude;

        if (!vLat || !vLng) return;

        const distance = calculateDistance(pickupLat, pickupLng, vLat, vLng);
        const radiusLimit = v.operating_radius || 10.0; // Fallback default 10 KM

        if (distance <= radiusLimit) {
          candidates.push({
            volunteer: v,
            distance,
            activeCount: v.deliveries.length,
          });
        }
      });

      if (candidates.length === 0) {
        logger.info('[Auto Assign] No online volunteers within range coordinates.');
        return null;
      }

      // Sort candidates:
      // 1. Lowest active delivery workload count.
      // 2. Shortest distance.
      candidates.sort((a, b) => {
        if (a.activeCount !== b.activeCount) {
          return a.activeCount - b.activeCount;
        }
        return a.distance - b.distance;
      });

      const bestCandidate = candidates[0].volunteer;

      // Perform assignment mutations
      await prisma.deliveries.update({
        where: { id: deliveryId },
        data: {
          volunteer_id: bestCandidate.id,
          delivery_status: 'ASSIGNED',
          updated_at: new Date(),
        },
      });

      // Send notifications to selected volunteer
      await notificationService.sendNotification({
        userId: bestCandidate.user_id,
        title: 'Auto Assigned New Delivery',
        message: `You have been automatically matched to list: "${donation.food_name}" (${candidates[0].distance.toFixed(1)} km away).`,
        category: 'DELIVERY',
        priority: 'HIGH',
        emailTemplate: 'volunteerAssigned',
        emailSubject: 'New Redistribution Task Assigned',
        emailContext: {
          foodName: donation.food_name,
          ngoName: 'Claiming NGO', // Fallback details
        },
      });

      logger.info(`[Auto Assign] Assigned delivery ${deliveryId} to Volunteer ${bestCandidate.id} (~${candidates[0].distance.toFixed(1)} km away)`);
      return bestCandidate;
    } catch (err) {
      logger.error(`[Auto Assign Heuristics Failed]: ${err.message}`);
      return null;
    }
  }
}

const assignmentService = new AssignmentService();
export default assignmentService;
