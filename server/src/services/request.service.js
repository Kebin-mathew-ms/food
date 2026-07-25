import { prisma } from '../config/database.js';
import requestRepository from '../repositories/request.repository.js';
import ngoRepository from '../repositories/ngo.repository.js';
import donationRepository from '../repositories/donation.repository.js';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import logger from '../utils/logger.js';

class RequestService {
  /**
   * Helper to write system notifications.
   * @private
   */
  async _triggerNotification(userId, title, message, type = 'SYSTEM') {
    if (!prisma) return;
    try {
      await prisma.notifications.create({
        data: {
          user_id: userId,
          title,
          message,
          type,
        },
      });
    } catch (err) {
      logger.error('[Notification Trigger Error]:', err.message);
    }
  }

  /**
   * Helper to write audit logs.
   * @private
   */
  async _writeAuditLog(userId, action, tableName, recordId, oldValues = null, newValues = null) {
    if (!prisma) return;
    try {
      await prisma.audit_logs.create({
        data: {
          user_id: userId,
          action,
          table_name: tableName,
          record_id: recordId,
          old_values: oldValues ? JSON.stringify(oldValues) : null,
          new_values: newValues ? JSON.stringify(newValues) : null,
        },
      });
    } catch (err) {
      logger.error('[Audit Logging Error]:', err.message);
    }
  }

  /**
   * NGO submits a request to claim available food.
   */
  async submitRequest(userId, requestData) {
    // 1. Verify User role is NGO and profile is verified
    const ngo = await ngoRepository.findByUserId(userId);
    if (!ngo) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'NGO Profile not completed.');
    }
    if (ngo.status !== 'VERIFIED') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Access Denied: Only VERIFIED organizations can request food.'
      );
    }

    const { donation_id, remarks, expected_pickup_time, estimated_arrival_time, special_requirements } = requestData;

    // 2. Locate donation and check status bounds
    const donation = await donationRepository.findById(donation_id);
    if (!donation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Food donation listing not found.');
    }

    // 3. Prevent duplicate active claims
    const activeReq = await requestRepository.findActiveRequest(ngo.id, donation_id);
    if (activeReq) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'You have already submitted an active claim request for this listing.'
      );
    }

    if (donation.status !== 'AVAILABLE') {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Cannot request: This food listing is no longer available.'
      );
    }

    if (new Date(donation.expiry_time) <= new Date()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot request: Food listing has expired.');
    }

    // 4. Create request
    const request = await requestRepository.create({
      donation_id,
      ngo_id: ngo.id,
      request_status: 'PENDING',
      remarks,
      expected_pickup_time: new Date(expected_pickup_time),
      estimated_arrival_time: new Date(estimated_arrival_time),
      special_requirements,
    });

    // 5. Update donation status to CLAIMED/REQUESTED so other NGOs cannot select it concurrently
    await prisma.food_donations.update({
      where: { id: donation_id },
      data: { status: 'REQUESTED' },
    });

    // 6. Record audits and notifications
    await this._writeAuditLog(userId, 'REQUEST_SUBMITTED', 'donation_requests', request.id, null, request);

    // Notify NGO
    await this._triggerNotification(
      userId,
      'Request Submitted',
      `Your claim request for "${donation.food_name}" has been recorded successfully.`,
      'SUCCESS'
    );

    // Notify Donor owner
    await this._triggerNotification(
      donation.donor_id,
      'Food Claim Request',
      `An organization has requested to claim your listing: "${donation.food_name}".`,
      'INFO'
    );

    return request;
  }

  /**
   * Cancel a pending request.
   */
  async cancelRequest(requestId, userId) {
    const ngo = await ngoRepository.findByUserId(userId);
    if (!ngo) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Access Denied: Invalid NGO profile.');
    }

    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Request record not found.');
    }

    // Authorization checks
    if (request.ngo_id !== ngo.id) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to manage this request.');
    }

    if (['DELIVERED', 'PICKED_UP'].includes(request.request_status)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot cancel request once pickup has initiated.');
    }

    const originalStatus = request.request_status;

    // Transition status to CANCELLED
    const updated = await requestRepository.updateStatus(requestId, 'CANCELLED');

    // Return donation back to AVAILABLE state
    await prisma.food_donations.update({
      where: { id: request.donation_id },
      data: { status: 'AVAILABLE' },
    });

    // Audit logs
    await this._writeAuditLog(userId, 'REQUEST_CANCELLED', 'donation_requests', requestId, { status: originalStatus }, { status: 'CANCELLED' });

    // Notify NGO
    await this._triggerNotification(
      userId,
      'Request Cancelled',
      'You have successfully cancelled your food claim request.',
      'WARNING'
    );

    // Notify Donor
    await this._triggerNotification(
      request.donation.donor_id,
      'Claim Request Cancelled',
      `The claim request for your listing "${request.donation.food_name}" was cancelled by the organization.`,
      'WARNING'
    );

    return updated;
  }

  /**
   * Retrieve request details.
   */
  async getDetails(requestId, userId, userRole) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Request record not found.');
    }

    // Verify role permissions
    if (userRole !== 'ADMIN') {
      const ngo = await ngoRepository.findByUserId(userId);
      if (ngo && request.ngo_id !== ngo.id) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to view this request.');
      }
      if (userRole === 'DONOR' && request.donation.donor_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to view this request.');
      }
    }

    return request;
  }

  /**
   * List paginated request history.
   */
  async getHistory(userId, filters) {
    const ngo = await ngoRepository.findByUserId(userId);
    if (!ngo) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'NGO profile not found.');
    }

    const records = await requestRepository.findHistory(ngo.id, filters);
    const total = await requestRepository.countHistory(ngo.id, filters);

    return {
      records,
      metadata: {
        page: Number(filters.page || 1),
        limit: Number(filters.limit || 10),
        last_page: Math.ceil(total / Number(filters.limit || 10)),
        total,
      },
    };
  }

  /**
   * Submit feedback ratings for a completed delivery.
   */
  async submitFeedback(userId, requestId, feedbackData) {
    const ngo = await ngoRepository.findByUserId(userId);
    if (!ngo) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Access Denied.');
    }

    const request = await requestRepository.findById(requestId);
    if (!request || request.ngo_id !== ngo.id) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Request not found.');
    }

    if (!request.delivery) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No delivery record associated with this request.');
    }

    const feedback = await prisma.feedback.create({
      data: {
        delivery_id: request.delivery.id,
        rating: feedbackData.rating,
        review: feedbackData.review || '',
      },
    });

    await this._writeAuditLog(userId, 'FEEDBACK_SUBMITTED', 'feedback', feedback.id, null, feedback);
    return feedback;
  }
}

export default new RequestService();
