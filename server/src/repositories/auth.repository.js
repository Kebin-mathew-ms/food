import { prisma } from '../config/database.js';

/**
 * AuthRepository handling database reads/writes for user verification, passwords, and sessions.
 */
class AuthRepository {
  /**
   * Get user by ID.
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findUserById(id) {
    if (!prisma) return null;
    return prisma.users.findFirst({
      where: { id, deleted_at: null },
    });
  }

  /**
   * Find user profile by email address.
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findUserByEmail(email) {
    if (!prisma) return null;
    return prisma.users.findFirst({
      where: { email, deleted_at: null },
    });
  }

  /**
   * Find user profile by phone number.
   * @param {string} phone
   * @returns {Promise<object|null>}
   */
  async findUserByPhone(phone) {
    if (!prisma) return null;
    return prisma.users.findFirst({
      where: { phone, deleted_at: null },
    });
  }

  /**
   * Create a new user record.
   * @param {object} userData
   * @returns {Promise<object>}
   */
  async createUser(userData) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');
    return prisma.users.create({
      data: userData,
    });
  }

  /**
   * Update user details.
   * @param {string} id - User ID
   * @param {object} userData - Fields to update
   * @returns {Promise<object>}
   */
  async updateUser(id, userData) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');
    return prisma.users.update({
      where: { id },
      data: userData,
    });
  }

  /**
   * Find user matching a verification token.
   * @param {string} token
   * @returns {Promise<object|null>}
   */
  async findUserByVerificationToken(token) {
    if (!prisma) return null;
    return prisma.users.findFirst({
      where: {
        verification_token: token,
        deleted_at: null,
      },
    });
  }

  /**
   * Find user matching a password reset token.
   * @param {string} token
   * @returns {Promise<object|null>}
   */
  async findUserByResetToken(token) {
    if (!prisma) return null;
    return prisma.users.findFirst({
      where: {
        reset_token: token,
        deleted_at: null,
      },
    });
  }

  /**
   * Persist a new refresh token session mapping.
   * @param {string} userId
   * @param {string} hashedToken
   * @param {Date} expiresAt
   * @param {string|null} [deviceInfo=null]
   * @param {string|null} [ipAddress=null]
   * @returns {Promise<object>}
   */
  async saveRefreshToken(userId, hashedToken, expiresAt, deviceInfo = null, ipAddress = null) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');
    return prisma.refresh_tokens.create({
      data: {
        user_id: userId,
        token: hashedToken,
        expires_at: expiresAt,
        device_info: deviceInfo,
        ip_address: ipAddress,
      },
    });
  }

  /**
   * Retrieve active refresh token details.
   * @param {string} hashedToken
   * @returns {Promise<object|null>}
   */
  async findRefreshToken(hashedToken) {
    if (!prisma) return null;
    return prisma.refresh_tokens.findFirst({
      where: {
        token: hashedToken,
        is_revoked: false,
        deleted_at: null,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Revoke a single refresh token by record ID.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async revokeRefreshToken(id) {
    if (!prisma) throw new Error('Prisma database client is not loaded.');
    return prisma.refresh_tokens.update({
      where: { id },
      data: { is_revoked: true },
    });
  }

  /**
   * Delete a single refresh token from storage.
   * @param {string} hashedToken
   */
  async deleteRefreshToken(hashedToken) {
    if (!prisma) return;
    return prisma.refresh_tokens.deleteMany({
      where: { token: hashedToken },
    });
  }

  /**
   * Revoke all active refresh tokens/sessions for a user (logout all devices).
   * @param {string} userId
   */
  async deleteAllRefreshTokens(userId) {
    if (!prisma) return;
    return prisma.refresh_tokens.updateMany({
      where: {
        user_id: userId,
        is_revoked: false,
      },
      data: {
        is_revoked: true,
      },
    });
  }

  /**
   * Purge expired refresh tokens from database.
   */
  async deleteExpiredTokens() {
    if (!prisma) return;
    return prisma.refresh_tokens.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
  }
}

export default new AuthRepository();
