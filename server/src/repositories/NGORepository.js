import BaseRepository from './BaseRepository.js';

/**
 * NGORepository managing ngos entity queries.
 */
class NGORepository extends BaseRepository {
  constructor() {
    super('ngos');
  }

  /**
   * Find NGO profile details by User ID association.
   * @param {string} userId
   * @param {object} [include]
   * @returns {Promise<object|null>}
   */
  async findByUserId(userId, include = null) {
    this._checkModel();
    const query = {
      where: {
        user_id: userId,
        deleted_at: null,
      },
    };
    if (include) query.include = include;
    return this.model.findFirst(query);
  }

  /**
   * Get all unverified NGO profiles.
   */
  async findUnverified() {
    this._checkModel();
    return this.model.findMany({
      where: {
        verified: false,
        deleted_at: null,
      },
      include: {
        user: true,
      },
    });
  }
}

export default new NGORepository();
