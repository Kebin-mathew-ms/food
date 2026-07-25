import BaseRepository from './BaseRepository.js';

/**
 * DeliveryRepository managing deliveries entity queries.
 */
class DeliveryRepository extends BaseRepository {
  constructor() {
    super('deliveries');
  }

  /**
   * Find deliveries currently assigned to a volunteer courier.
   * @param {string} volunteerId
   * @param {object} [include]
   * @returns {Promise<object[]>}
   */
  async findActiveByVolunteer(volunteerId, include = null) {
    this._checkModel();
    const query = {
      where: {
        volunteer_id: volunteerId,
        delivery_status: {
          in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'],
        },
        deleted_at: null,
      },
    };
    if (include) query.include = include;
    return this.model.findMany(query);
  }

  /**
   * Find a delivery along with its nested donation request and original donation data.
   */
  async findDetailById(id) {
    this._checkModel();
    return this.model.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        donation_request: {
          include: {
            donation: {
              include: {
                donor: true,
              },
            },
            ngo: {
              include: {
                user: true,
              },
            },
          },
        },
        volunteer: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}

export default new DeliveryRepository();
