/**
 * Reusable Query Parser and Clause Builder Helpers for Prisma ORM.
 */

/**
 * Build take/skip pagination options.
 * @param {object} query - Express req.query object
 * @returns {{take: number, skip: number, page: number, limit: number}}
 */
export const buildPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  return {
    take: limit,
    skip,
    page,
    limit,
  };
};

/**
 * Build orderBy sorting clauses dynamically.
 * @param {object} query - req.query
 * @param {string} [defaultField='created_at']
 * @param {string} [defaultOrder='desc']
 * @returns {object} Prisma orderBy clause object
 */
export const buildSorting = (query = {}, defaultField = 'created_at', defaultOrder = 'desc') => {
  const sort = query.sort_by || defaultField;
  const order = (query.order || defaultOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

  return {
    [sort]: order,
  };
};

/**
 * Build Date Range filtering filter conditions.
 * @param {object} query - req.query
 * @param {string} [dateField='created_at']
 * @returns {object|null} Prisma date range clause or null
 */
export const buildDateRange = (query = {}, dateField = 'created_at') => {
  const { start_date, end_date } = query;
  if (!start_date && !end_date) return null;

  const dateCondition = {};
  if (start_date) {
    const start = new Date(start_date);
    if (!isNaN(start.getTime())) {
      dateCondition.gte = start;
    }
  }
  if (end_date) {
    const end = new Date(end_date);
    if (!isNaN(end.getTime())) {
      // Extend end-date to the end of the day boundary
      end.setHours(23, 59, 59, 999);
      dateCondition.lte = end;
    }
  }

  return Object.keys(dateCondition).length > 0 ? { [dateField]: dateCondition } : null;
};

/**
 * Build keyword search filters.
 * @param {string} searchQuery - Search keyword term
 * @param {string[]} fields - Field keys to perform contains search
 * @returns {object|null} Prisma search clause
 */
export const buildSearch = (searchQuery, fields = []) => {
  if (!searchQuery || fields.length === 0) return null;

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchQuery,
      },
    })),
  };
};

/**
 * Build dynamic where clause matching against filters and schema fields.
 * Handles string conversion of boolean and numbers automatically.
 * @param {object} queryParams - req.query
 * @param {string[]} schemaFields - List of allowed schema fields
 * @returns {object} Constructed where condition
 */
export const buildDynamicWhere = (queryParams = {}, schemaFields = []) => {
  const where = {
    deleted_at: null,
  };

  schemaFields.forEach((field) => {
    const rawVal = queryParams[field];
    if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
      let val = rawVal;

      // Attempt to convert type
      if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      } else if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
        const num = Number(val);
        val = Number.isInteger(num) ? parseInt(val, 10) : parseFloat(val);
      }

      where[field] = val;
    }
  });

  return where;
};

export default {
  buildPagination,
  buildSorting,
  buildDateRange,
  buildSearch,
  buildDynamicWhere,
};
