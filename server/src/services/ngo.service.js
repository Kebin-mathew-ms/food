import { prisma } from '../config/database.js';
import ngoRepository from '../repositories/ngo.repository.js';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import logger from '../utils/logger.js';
import { calculateDistance } from '../utils/distance.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

class NgoService {
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
   * Retrieve NGO profile details by user ID.
   */
  async getProfile(userId) {
    const profile = await ngoRepository.findByUserId(userId);
    if (!profile) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'NGO Profile not completed yet.');
    }
    return profile;
  }

  /**
   * Upsert NGO profile details.
   */
  async upsertProfile(userId, profileData) {
    const existing = await ngoRepository.findByUserId(userId);
    
    // Default coords fallback to NYC if not provided
    const payload = {
      ...profileData,
      latitude: profileData.latitude !== undefined ? profileData.latitude : 40.7128,
      longitude: profileData.longitude !== undefined ? profileData.longitude : -74.0060,
      operating_radius: profileData.operating_radius !== undefined ? profileData.operating_radius : 10.0,
      status: existing ? existing.status : 'PENDING',
      verified: existing ? existing.verified : false,
    };

    const ngo = await ngoRepository.upsert(userId, payload);

    // Audit log profile updates
    await this._writeAuditLog(
      userId,
      existing ? 'NGO_PROFILE_UPDATED' : 'NGO_PROFILE_CREATED',
      'ngos',
      ngo.id,
      existing || null,
      ngo
    );

    // Notification alert
    await this._triggerNotification(
      userId,
      existing ? 'Profile Updated' : 'Profile Completed',
      'Your NGO profile details have been saved successfully.',
      'SUCCESS'
    );

    return ngo;
  }

  /**
   * Upload and process NGO registration files (Certificate, ID, License, Logo).
   */
  async uploadDocuments(userId, files) {
    const ngo = await ngoRepository.findByUserId(userId);
    if (!ngo) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'NGO Profile must be completed before uploading files.');
    }

    const uploadFile = async (file, folderName) => {
      if (!file) return null;
      
      // If Cloudinary configured, use it, otherwise use local fallback URL
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const res = await cloudinary.uploader.upload(file.path, {
            folder: `food_waste_redistribution/ngos/${folderName}`,
          });
          fs.unlinkSync(file.path);
          return res.secure_url;
        } catch (err) {
          logger.error('Cloudinary document upload failed, using fallback:', err.message);
          return `/uploads/${file.filename}`;
        }
      }
      return `/uploads/${file.filename}`;
    };

    const updateData = {};
    if (files.registration_certificate) {
      updateData.registration_certificate = await uploadFile(files.registration_certificate[0], 'certificates');
    }
    if (files.government_id) {
      updateData.government_id = await uploadFile(files.government_id[0], 'gov_ids');
    }
    if (files.ngo_license) {
      updateData.ngo_license = await uploadFile(files.ngo_license[0], 'licenses');
    }
    if (files.organization_logo) {
      updateData.organization_logo = await uploadFile(files.organization_logo[0], 'logos');
    }

    // Auto trigger Status to UNDER_REVIEW when documents are uploaded!
    updateData.status = 'UNDER_REVIEW';

    const updatedNgo = await prisma.ngos.update({
      where: { id: ngo.id },
      data: updateData,
    });

    await this._writeAuditLog(userId, 'NGO_DOCUMENTS_UPLOADED', 'ngos', ngo.id, null, updateData);
    await this._triggerNotification(
      userId,
      'Documents Uploaded',
      'NGO verification documents uploaded successfully. Profile status changed to Under Review.',
      'INFO'
    );

    return updatedNgo;
  }

  /**
   * Retrieve NGO dashboard metric stats.
   */
  async getDashboard(userId) {
    const ngo = await ngoRepository.findByUserId(userId);
    if (!ngo) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'NGO Profile not completed.');
    }

    // Standard aggregates (Approved, Pending, Completed, Meals, People)
    const baseStats = await ngoRepository.getDashboardStats(ngo.id);

    // Calculate Available nearby donations dynamically based on location coords
    let availableNearbyCount = 0;
    if (ngo.latitude && ngo.longitude) {
      const activeDonations = await prisma.food_donations.findMany({
        where: {
          status: 'AVAILABLE',
          deleted_at: null,
          expiry_time: { gt: new Date() },
        },
      });

      const radius = ngo.operating_radius || 10.0;
      activeDonations.forEach((d) => {
        if (d.pickup_latitude && d.pickup_longitude) {
          const dist = calculateDistance(ngo.latitude, ngo.longitude, d.pickup_latitude, d.pickup_longitude);
          if (dist <= radius) {
            availableNearbyCount++;
          }
        }
      });
    }

    return {
      availableNearby: availableNearbyCount,
      ...baseStats,
    };
  }
}

export default new NgoService();
