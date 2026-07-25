import BaseRepository from './BaseRepository.js';

/**
 * DonationRepository managing food_donations entity queries.
 */
class DonationRepository extends BaseRepository {
  constructor() {
    super('food_donations');
  }

  /**
   * Find all active donations submitted by a specific donor.
   * @param {string} donorId - Donor User ID
   * @param {object} [include] - Relations to load
   * @returns {Promise<object[]>}
   */
  async findActiveByDonor(donorId, include = null) {
    this._checkModel();
    const query = {
      where: {
        donor_id: donorId,
        deleted_at: null,
      },
    };
    if (include) query.include = include;
    return this.model.findMany(query);
  }

  /**
   * Find available food donations by category.
   * @param {string} category
   * @returns {Promise<object[]>}
   */
  async findByCategory(category) {
    this._checkModel();
    return this.model.findMany({
      where: {
        food_category: category,
        status: 'AVAILABLE',
        deleted_at: null,
      },
    });
  }
}

export default new DonationRepository();
