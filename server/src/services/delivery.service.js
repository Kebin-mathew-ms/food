import deliveryRepository from '../repositories/delivery.repository.js';
import volunteerRepository from '../repositories/volunteer.repository.js';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { calculateDistance } from '../utils/distance.js';
import { prisma } from '../config/database.js';
import logger from '../utils/logger.js';
import { broadcastToRoom } from '../config/socket.js';

class DeliveryService {
  /**
   * Log audit trails helper.
   */
  async logAuditTrail(userId, action, recordId, details = {}) {
    try {
      await prisma.audit_logs.create({
        data: {
          user_id: userId,
          action,
          table_name: 'deliveries',
          record_id: recordId,
          new_values: JSON.stringify(details),
        },
      });
    } catch (err) {
      logger.error('[Audit Logging Error]:', err.message);
    }
  }

  /**
   * Find nearby available or assigned assignments.
   */
  async getAssignments(userId) {
    const volunteer = await volunteerRepository.findByUserId(userId);
    if (!profileCompleted(volunteer)) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer profile not completed.');
    }

    const rawList = await deliveryRepository.findAssignments(volunteer.id);

    // Compute distance coordinates filters
    const volLat = volunteer.current_latitude || 40.7128;
    const volLng = volunteer.current_longitude || -74.0060;
    const operatingRadius = volunteer.operating_radius || 10.0;

    const filtered = rawList.map((item) => {
      const donation = item.donation_request?.donation;
      const pickupLat = donation?.pickup_latitude || 40.7128;
      const pickupLng = donation?.pickup_longitude || -74.0060;
      const distance = calculateDistance(volLat, volLng, pickupLat, pickupLng);
      return { ...item, distance };
    }).filter((item) => {
      // Return if assigned directly, or unassigned and within operating radius
      return item.volunteer_id === volunteer.id || item.distance <= operatingRadius;
    });

    return filtered;
  }

  /**
   * List active accepted deliveries.
   */
  async getActiveDeliveries(userId) {
    const volunteer = await volunteerRepository.findByUserId(userId);
    if (!profileCompleted(volunteer)) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer profile not completed.');
    }
    return deliveryRepository.findActiveDeliveries(volunteer.id);
  }

  /**
   * Accept an assignment delivery.
   */
  async acceptAssignment(userId, deliveryId) {
    const volunteer = await volunteerRepository.findByUserId(userId);
    if (!profileCompleted(volunteer)) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer profile not completed.');
    }

    // Business rule: MUST be online
    if (volunteer.online_status !== 'ONLINE') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Cannot accept assignment: You must go ONLINE first.'
      );
    }

    // Business rule: Cannot accept another delivery while BUSY
    const active = await deliveryRepository.findActiveDeliveries(volunteer.id);
    if (active.length > 0) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'Cannot accept assignment: You currently have an active delivery in progress.'
      );
    }

    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    if (delivery.delivery_status !== 'ASSIGNED') {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'Cannot accept assignment: This listing is already accepted by another volunteer.'
      );
    }

    // Update status to ACCEPTED
    const updated = await deliveryRepository.acceptAssignment(deliveryId, volunteer.id);

    // Update volunteer status to BUSY
    await volunteerRepository.updateStatus(volunteer.id, 'BUSY');

    // Broadcast update
    broadcastToRoom(deliveryId, 'volunteer:accepted', { deliveryId, volunteerId: volunteer.id });

    // Audits
    await this.logAuditTrail(userId, 'ASSIGNMENT_ACCEPTED', deliveryId, { volunteerId: volunteer.id });

    return updated;
  }

  /**
   * Reject assignment.
   */
  async rejectAssignment(userId, deliveryId) {
    const volunteer = await volunteerRepository.findByUserId(userId);
    if (!volunteer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer profile not found.');
    }

    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assignment not found.');
    }

    // Check if volunteer is assigned to it
    if (delivery.volunteer_id !== volunteer.id) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Access Denied: You are not assigned to this delivery.');
    }

    const updated = await deliveryRepository.rejectAssignment(deliveryId);

    // Update status back to ONLINE if volunteer has no other active deliveries
    const active = await deliveryRepository.findActiveDeliveries(volunteer.id);
    if (active.length === 0) {
      await volunteerRepository.updateStatus(volunteer.id, 'ONLINE');
    }

    broadcastToRoom(deliveryId, 'volunteer:rejected', { deliveryId });
    await this.logAuditTrail(userId, 'ASSIGNMENT_REJECTED', deliveryId);

    return updated;
  }

  /**
   * Transition stages start (accepted -> way to pickup, or picked -> in transit)
   */
  async startTransit(userId, deliveryId) {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Delivery not found.');

    let nextStatus = 'ON_THE_WAY_TO_PICKUP';
    if (delivery.delivery_status === 'PICKED_UP') {
      nextStatus = 'IN_TRANSIT';
    } else if (delivery.delivery_status !== 'ACCEPTED') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot start transit from current status.');
    }

    const updated = await deliveryRepository.updateStatus(deliveryId, nextStatus);
    await this.logAuditTrail(userId, 'TRANSIT_STARTED', deliveryId, { nextStatus });
    return updated;
  }

  /**
   * Transition arrived at donor.
   */
  async arrivedAtPickup(userId, deliveryId) {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Delivery not found.');

    if (delivery.delivery_status !== 'ON_THE_WAY_TO_PICKUP') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot transition to arrived at pickup.');
    }

    const updated = await deliveryRepository.updateStatus(deliveryId, 'ARRIVED_AT_PICKUP');
    await this.logAuditTrail(userId, 'ARRIVED_AT_PICKUP', deliveryId);
    return updated;
  }

  /**
   * Transition arrived at destination NGO.
   */
  async arrivedAtDestination(userId, deliveryId) {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Delivery not found.');

    if (delivery.delivery_status !== 'IN_TRANSIT') {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot transition to arrived at destination.');
    }

    const updated = await deliveryRepository.updateStatus(deliveryId, 'ARRIVED_AT_DESTINATION');
    await this.logAuditTrail(userId, 'ARRIVED_AT_DESTINATION', deliveryId);
    return updated;
  }

  /**
   * Record pickup proof.
   */
  async pickupFood(userId, deliveryId, photoUrl, lat, lng) {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Delivery not found.');

    const donation = delivery.donation_request?.donation;
    if (new Date(donation.expiry_time) <= new Date()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot pickup expired food listings.');
    }

    const updated = await deliveryRepository.savePickupProof(deliveryId, photoUrl, lat, lng);

    // Update request and donation status to PICKED_UP
    await prisma.donation_requests.update({
      where: { id: delivery.donation_request_id },
      data: { request_status: 'PICKED_UP' },
    });
    await prisma.food_donations.update({
      where: { id: donation.id },
      data: { status: 'PICKED_UP' },
    });

    broadcastToRoom(deliveryId, 'delivery:picked_up', { deliveryId });
    await this.logAuditTrail(userId, 'FOOD_PICKED_UP', deliveryId, { lat, lng });

    return updated;
  }

  /**
   * Record delivery completion.
   */
  async completeDelivery(userId, deliveryId, photoUrl, signatureUrl, notes, lat, lng) {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Delivery not found.');

    if (delivery.delivery_status !== 'ARRIVED_AT_DESTINATION') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Cannot complete delivery: You must arrive at the destination first.'
      );
    }

    const updated = await deliveryRepository.saveDeliveryProof(
      deliveryId,
      photoUrl,
      signatureUrl,
      notes,
      lat,
      lng
    );

    // Update request and donation status to DELIVERED
    await prisma.donation_requests.update({
      where: { id: delivery.donation_request_id },
      data: { request_status: 'DELIVERED' },
    });
    await prisma.food_donations.update({
      where: { id: delivery.donation_request.donation_id },
      data: { status: 'DELIVERED' },
    });

    // Restore volunteer online status back to ONLINE
    const volunteer = await volunteerRepository.findById(delivery.volunteer_id);
    await volunteerRepository.updateStatus(volunteer.id, 'ONLINE');

    broadcastToRoom(deliveryId, 'delivery:completed', { deliveryId });
    await this.logAuditTrail(userId, 'DELIVERY_COMPLETED', deliveryId, { lat, lng });

    return updated;
  }

  /**
   * Fetch history.
   */
  async getHistory(userId, status) {
    const volunteer = await volunteerRepository.findByUserId(userId);
    if (!volunteer) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer profile not found.');

    return deliveryRepository.findHistory(volunteer.id, status);
  }
}

function profileCompleted(volunteer) {
  return volunteer && volunteer.vehicle_type && volunteer.driving_license_number;
}

const deliveryService = new DeliveryService();
export default deliveryService;
