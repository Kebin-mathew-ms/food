import BaseRepository from './BaseRepository.js';

/**
 * ComplaintRepository managing complaints entity queries.
 */
class ComplaintRepository extends BaseRepository {
  constructor() {
    super('complaints');
  }

  /**
   * Find complaints logged by a user.
   */
  async findActiveByUser(userId) {
    this._checkModel();
    return this.model.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Find pending complaints requiring attention.
   */
  async findPending() {
    this._checkModel();
    return this.model.findMany({
      where: {
        status: 'PENDING',
        deleted_at: null,
      },
      include: {
        user: true,
      },
    });
  }
}

export default new ComplaintRepository();
