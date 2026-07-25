import { prisma } from '../config/database.js';
import donationRepository from '../repositories/donation.repository.js';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import logger from '../utils/logger.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

/**
 * DonationService executing business logic for food donations, auto-expiries, audit logging, and notifications.
 */
class DonationService {
  /**
   * Run background status updates for expired donations.
   * Auto-expires AVAILABLE donations whose expiry_time is in the past.
   * @private
   */
  async _autoExpireDonations() {
    if (!prisma) return;
    try {
      const now = new Date();
      const expiredCount = await prisma.food_donations.updateMany({
        where: {
          status: 'AVAILABLE',
          expiry_time: { lt: now },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      if (expiredCount.count > 0) {
        logger.info(`[Auto Expire] Automatically expired ${expiredCount.count} pending donations.`);
      }
    } catch (err) {
      logger.error('[Auto Expire Error]:', err.message);
    }
  }

  /**
   * Helper to write system notifications for a user.
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
   * Helper to create system audit logs.
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
   * Register a new food donation.
   */
  async createDonation(donorId, donationData) {
    // Save donation record
    const donation = await donationRepository.create({
      ...donationData,
      donor_id: donorId,
      status: 'AVAILABLE',
    });

    // Write audit trail
    await this._writeAuditLog(donorId, 'DONATION_CREATED', 'food_donations', donation.id, null, donation);

    // Trigger notification
    await this._triggerNotification(
      donorId,
      'Donation Created',
      `Your food donation listing for "${donation.food_name}" has been created successfully.`
    );

    return donation;
  }

  /**
   * List paginated food donations matching query filters.
   */
  async listDonations(queryParams) {
    // Run auto-expiration check first
    await this._autoExpireDonations();

    const { page = 1, limit = 10, ...filters } = queryParams;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      donationRepository.findAll({ ...filters, skip, take: limit }),
      donationRepository.countAll(filters),
    ]);

    return {
      records,
      metadata: {
        page,
        limit,
        last_page: Math.ceil(total / limit) || 1,
        total,
      },
    };
  }

  /**
   * Get single donation matching ID.
   */
  async getDonationById(id) {
    // Run auto-expiration check first
    await this._autoExpireDonations();

    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Food donation listing not found.');
    }

    return donation;
  }

  /**
   * Update food donation details.
   */
  async updateDonation(id, donorId, userRole, updateData) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Food donation listing not found.');
    }

    // Verify ownership
    if (userRole !== 'ADMIN' && donation.donor_id !== donorId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to edit this listing.');
    }

    // Disable edits on expired listings
    const now = new Date();
    if (donation.status === 'EXPIRED' || new Date(donation.expiry_time) < now) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Editing is disabled on expired donation listings.');
    }

    const updated = await donationRepository.update(id, updateData);

    // Audit and notify
    await this._writeAuditLog(donorId, 'DONATION_UPDATED', 'food_donations', id, donation, updated);
    await this._triggerNotification(
      donation.donor_id,
      'Donation Updated',
      `Your food donation listing for "${updated.food_name}" has been updated.`
    );

    return updated;
  }

  /**
   * Cancel an active donation listing.
   */
  async cancelDonation(id, donorId, userRole) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Food donation listing not found.');
    }

    // Verify ownership
    if (userRole !== 'ADMIN' && donation.donor_id !== donorId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to cancel this listing.');
    }

    const updated = await donationRepository.update(id, { status: 'CANCELLED' });

    // Audit and notify
    await this._writeAuditLog(donorId, 'DONATION_CANCELLED', 'food_donations', id, donation, updated);
    await this._triggerNotification(
      donation.donor_id,
      'Donation Cancelled',
      `Your food donation listing for "${updated.food_name}" was cancelled.`
    );

    return updated;
  }

  /**
   * Soft-delete donation listing.
   */
  async deleteDonation(id, donorId, userRole) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Food donation listing not found.');
    }

    // Verify ownership
    if (userRole !== 'ADMIN' && donation.donor_id !== donorId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to delete this listing.');
    }

    await donationRepository.delete(id);
    await this._writeAuditLog(donorId, 'DONATION_DELETED', 'food_donations', id, donation, null);
  }

  /**
   * Restore a soft-deleted donation (Admin only).
   */
  async restoreDonation(id, adminUserId) {
    const donation = await donationRepository.restore(id);
    await this._writeAuditLog(adminUserId, 'DONATION_RESTORED', 'food_donations', id, null, donation);
    return donation;
  }

  /**
   * Upload an image and link it to the donation.
   */
  async uploadDonationImage(donationId, donorId, userRole, file) {
    const donation = await donationRepository.findById(donationId);
    if (!donation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Food donation listing not found.');
    }

    // Verify ownership
    if (userRole !== 'ADMIN' && donation.donor_id !== donorId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to manage images for this listing.');
    }

    // Check maximum limit (5 images)
    if (donation.donation_images.length >= 5) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You can upload a maximum of 5 images per donation.');
    }

    let imageUrl = '';
    let publicId = '';

    // Check if Cloudinary is configured, otherwise fallback to local uploads URL
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: 'food_waste_redistribution/donations',
        });
        imageUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
        
        // Clean local temp file
        fs.unlinkSync(file.path);
      } catch (err) {
        logger.error('Cloudinary upload failure:', err.message);
        imageUrl = `/uploads/${file.filename}`;
      }
    } else {
      imageUrl = `/uploads/${file.filename}`;
    }

    const displayOrder = donation.donation_images.length;
    const newImage = await donationRepository.createImage({
      donation_id: donationId,
      image_url: imageUrl,
      public_id: publicId || null,
      display_order: displayOrder,
    });

    await this._writeAuditLog(donorId, 'DONATION_IMAGE_UPLOADED', 'donation_images', newImage.id, null, newImage);
    return newImage;
  }

  /**
   * Delete an image from a donation.
   */
  async deleteDonationImage(imageId, donorId, userRole) {
    const imageRecord = await donationRepository.findImageById(imageId);
    if (!imageRecord) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Image record not found.');
    }

    const donation = await donationRepository.findById(imageRecord.donation_id);
    if (!donation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Associated food donation listing not found.');
    }

    // Verify ownership
    if (userRole !== 'ADMIN' && donation.donor_id !== donorId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to delete this image.');
    }

    // If uploaded to Cloudinary, delete from Cloudinary
    if (imageRecord.public_id) {
      try {
        await cloudinary.uploader.destroy(imageRecord.public_id);
      } catch (err) {
        logger.error('Cloudinary image deletion failed:', err.message);
      }
    }

    await donationRepository.deleteImage(imageId);
    await this._writeAuditLog(donorId, 'DONATION_IMAGE_DELETED', 'donation_images', imageId, imageRecord, null);
  }

  /**
   * Reorder list of images.
   */
  async reorderDonationImages(donationId, donorId, userRole, orderedImageIds) {
    const donation = await donationRepository.findById(donationId);
    if (!donation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Food donation listing not found.');
    }

    // Verify ownership
    if (userRole !== 'ADMIN' && donation.donor_id !== donorId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to edit image orders.');
    }

    await donationRepository.reorderImages(donationId, orderedImageIds);
    await this._writeAuditLog(donorId, 'DONATION_IMAGES_REORDERED', 'food_donations', donationId, { orderedImageIds }, null);
  }

  /**
   * Get metrics statistics for a donor.
   */
  async getDonorStats(donorId) {
    // Run auto-expiration check first
    await this._autoExpireDonations();
    return donationRepository.findStatsByDonor(donorId);
  }
}

export default new DonationService();
