/**
 * Date formatting utility.
 * @param {Date|string|number} date - Date representation
 * @param {string} [locales='en-US'] - Formatting locale
 * @param {object} [options={}] - Custom Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const dateFormatter = (date, locales = 'en-US', options = {}) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locales, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
};

/**
 * URL Slug generator utility.
 * @param {string} text - Raw input text
 * @returns {string} Sanitized slug string
 */
export const slugGenerator = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};
export default { dateFormatter, slugGenerator };
