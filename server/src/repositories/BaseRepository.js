import { prisma } from '../config/database.js';

/**
 * Base Abstract Repository class implementation.
 * Encapsulates standard CRUD, pagination, soft-delete, and search operations.
 */
class BaseRepository {
  /**
   * @param {string} modelName - The model key in Prisma client (e.g. 'users')
   */
  constructor(modelName) {
    this.modelName = modelName;
    this.model = prisma ? prisma[modelName] : null;
  }

  /**
   * Internal validator to verify Prisma initialization.
   * @private
   */
  _checkModel() {
    if (!this.model) {
      throw new Error(
        `Prisma model '${this.modelName}' is unavailable. Verify that client is generated.`
      );
    }
  }

  /**
   * Find a single record by primary key ID (excludes soft-deleted).
   * @param {string} id - UUID primary key
   * @param {object} [include] - Relations to eager load
   * @returns {Promise<object|null>}
   */
  async findById(id, include = null) {
    this._checkModel();
    const query = {
      where: {
        id,
        deleted_at: null,
      },
    };
    if (include) query.include = include;
    return this.model.findFirst(query);
  }

  /**
   * Find all records matching a filter criteria (excludes soft-deleted).
   * @param {object} [filter={}] - Field match criteria
   * @param {object} [include=null] - Relations to load
   * @param {object} [orderBy=null] - Sorting settings
   * @returns {Promise<object[]>}
   */
  async findAll(filter = {}, include = null, orderBy = null) {
    this._checkModel();
    const query = {
      where: {
        ...filter,
        deleted_at: null,
      },
    };
    if (include) query.include = include;
    if (orderBy) query.orderBy = orderBy;
    return this.model.findMany(query);
  }

  /**
   * Create a new database record.
   * @param {object} data - Field data input mapping
   * @returns {Promise<object>}
   */
  async create(data) {
    this._checkModel();
    return this.model.create({ data });
  }

  /**
   * Update an existing database record by ID.
   * @param {string} id - Record ID
   * @param {object} data - Field values to update
   * @returns {Promise<object>}
   */
  async update(id, data) {
    this._checkModel();
    return this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft-delete a record by ID setting deleted_at timestamp.
   * @param {string} id - Record ID
   * @returns {Promise<object>}
   */
  async delete(id) {
    this._checkModel();
    return this.model.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Restore a soft-deleted record by ID setting deleted_at to null.
   * @param {string} id - Record ID
   * @returns {Promise<object>}
   */
  async restore(id) {
    this._checkModel();
    return this.model.update({
      where: { id },
      data: { deleted_at: null },
    });
  }

  /**
   * Count total active records matching a filter criteria.
   * @param {object} [filter={}] - Field filter criteria
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    this._checkModel();
    return this.model.count({
      where: {
        ...filter,
        deleted_at: null,
      },
    });
  }

  /**
   * Search across specified string fields for a query term.
   * @param {string} searchQuery - Search input string
   * @param {string[]} fields - Column names to search across
   * @param {object} [filter={}] - Additional fields to filter by
   * @returns {Promise<object[]>}
   */
  async search(searchQuery, fields = [], filter = {}) {
    this._checkModel();
    if (!searchQuery || fields.length === 0) {
      return this.findAll(filter);
    }
    const orConditions = fields.map((field) => ({
      [field]: {
        contains: searchQuery,
      },
    }));
    return this.model.findMany({
      where: {
        ...filter,
        deleted_at: null,
        OR: orConditions,
      },
    });
  }

  /**
   * Paginated record fetch utility.
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @param {object} [filter={}]
   * @param {object} [include=null]
   * @param {object} [orderBy=null]
   * @returns {Promise<{items: object[], meta: {totalItems: number, totalPages: number, page: number, limit: number}}>}
   */
  async paginate(page = 1, limit = 10, filter = {}, include = null, orderBy = null) {
    this._checkModel();
    const take = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * take;

    const where = {
      ...filter,
      deleted_at: null,
    };

    const query = {
      where,
      take,
      skip,
    };

    if (include) query.include = include;
    if (orderBy) query.orderBy = orderBy;

    const [items, totalItems] = await Promise.all([this.model.findMany(query), this.count(filter)]);

    const totalPages = Math.ceil(totalItems / take);

    return {
      items,
      meta: {
        totalItems,
        totalPages,
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: take,
      },
    };
  }
}

export default BaseRepository;
