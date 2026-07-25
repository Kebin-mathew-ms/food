import axios from 'axios';

let isRefreshing = false;
let failedQueue = [];

/**
 * Helper to process the request queue when the token rotates.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Create configuration for Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token refresh and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    const apiError = {
      message: error.response?.data?.message || 'Something went wrong with the connection.',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
      raw: error,
    };

    // Trigger token refresh if request fails with 401 (unauthorized) and has not been retried
    if (apiError.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        isRefreshing = false;
        // Raise logout event to Auth Context
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(apiError);
      }

      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken: storedRefreshToken,
        });

        // Extract tokens from API standard format
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        // Clean credentials and raise logout event
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth:logout'));

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(apiError);
  }
);

export default axiosInstance;
