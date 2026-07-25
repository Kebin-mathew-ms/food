import BaseRepository from './BaseRepository.js';

/**
 * FeedbackRepository managing feedback entity queries.
 */
class FeedbackRepository extends BaseRepository {
  constructor() {
    super('feedback');
  }

  /**
   * Find feedback by delivery.
   */
  async findByDeliveryId(deliveryId) {
    this._checkModel();
    return this.model.findFirst({
      where: {
        delivery_id: deliveryId,
        deleted_at: null,
      },
    });
  }

  /**
   * Calculate average feedback score for volunteer.
   * @param {string} volunteerId
   * @returns {Promise<number>}
   */
  async getAverageRatingForVolunteer(volunteerId) {
    this._checkModel();
    const aggregateResult = await this.model.aggregate({
      where: {
        delivery: {
          volunteer_id: volunteerId,
        },
        deleted_at: null,
      },
      _avg: {
        rating: true,
      },
    });
    return aggregateResult._avg.rating || 0;
  }
}

export default new FeedbackRepository();
