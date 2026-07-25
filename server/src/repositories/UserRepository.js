import BaseRepository from './BaseRepository.js';

/**
 * UserRepository managing User entity queries.
 */
class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  /**
   * Find an active user by email.
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    this._checkModel();
    return this.model.findFirst({
      where: {
        email,
        deleted_at: null,
      },
    });
  }

  /**
   * Find an active user by phone.
   * @param {string} phone
   * @returns {Promise<object|null>}
   */
  async findByPhone(phone) {
    this._checkModel();
    return this.model.findFirst({
      where: {
        phone,
        deleted_at: null,
      },
    });
  }
}

export default new UserRepository();
