import BaseRepository from './BaseRepository.js';

/**
 * VolunteerRepository managing volunteers entity queries.
 */
class VolunteerRepository extends BaseRepository {
  constructor() {
    super('volunteers');
  }

  /**
   * Find volunteer profile by User ID.
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
   * Find all volunteers currently online and marked available.
   */
  async findOnlineActive() {
    this._checkModel();
    return this.model.findMany({
      where: {
        is_online: true,
        availability: true,
        deleted_at: null,
      },
    });
  }
}

export default new VolunteerRepository();
