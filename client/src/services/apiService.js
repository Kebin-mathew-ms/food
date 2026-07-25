import axiosInstance from '../api/axiosInstance.js';

/**
 * Reusable abstract Base API Service layer wrapper.
 * All feature service instances should delegate requests via this service.
 */
export const apiService = {
  /**
   * Send HTTP GET Request.
   */
  get: (url, config = {}) => {
    return axiosInstance.get(url, config);
  },

  /**
   * Send HTTP POST Request.
   */
  post: (url, data = {}, config = {}) => {
    return axiosInstance.post(url, data, config);
  },

  /**
   * Send HTTP PUT Request.
   */
  put: (url, data = {}, config = {}) => {
    return axiosInstance.put(url, data, config);
  },

  /**
   * Send HTTP PATCH Request.
   */
  patch: (url, data = {}, config = {}) => {
    return axiosInstance.patch(url, data, config);
  },

  /**
   * Send HTTP DELETE Request.
   */
  delete: (url, config = {}) => {
    return axiosInstance.delete(url, config);
  },
};

export default apiService;
