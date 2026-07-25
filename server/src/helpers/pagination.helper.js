/**
 * Pagination helper to compute database query skip/take values and format page data.
 * @param {number|string} [page=1] - Current page number
 * @param {number|string} [limit=10] - Number of items per page
 * @returns {{skip: number, take: number, page: number, limit: number}} Computed skip and take properties
 */
export const pagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;
  const take = parsedLimit;

  return {
    skip,
    take,
    page: parsedPage,
    limit: parsedLimit,
  };
};

/**
 * Format total count and query params into standardized metadata.
 * @param {number} totalItems - Total count of records
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {{totalItems: number, totalPages: number, page: number, limit: number}} Standard metadata object
 */
export const formatPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    page,
    limit,
  };
};
