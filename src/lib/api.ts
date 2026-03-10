import axios from 'axios';

// 1. Base Configuration
// Dynamically determine API URL based on current window location
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocal ? 'http://localhost:8000/api' : 'https://skillapi.moajmalnk.in/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Attaches the Access Token
api.interceptors.request.use(
  (config) => {
    // Check for explicit skip auth header
    if (config.headers['x-skip-auth']) {
      delete config.headers['x-skip-auth'];
      return config;
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Handles Token Refresh Logic
api.interceptors.response.use(
  (response) => response, // If success, just return response
  async (error) => {
    const originalRequest = error.config;

    // CHECK: Only attempt refresh if we actually have a session to refresh
    const hasToken = !!localStorage.getItem('access_token');

    if (error.response?.status === 401 && !hasToken) {
      // If we don't have a token and get 401, we are just anonymous.
      // Do NOT refresh, Do NOT reload. Just let the request fail.
      return Promise.reject(error);
    }

    // If error is 401 (Unauthorized) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Call backend to get a new access token
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;

        // Save new token
        localStorage.setItem('access_token', newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // If refresh fails (token expired/invalid)
        console.error("Session expired", refreshError);

        // CHECK IMPERSONATION: If we are impersonating, just exit it instead of logging the admin out
        const adminAccess = localStorage.getItem('admin_access_token');
        const adminRefresh = localStorage.getItem('admin_refresh_token');
        const adminUser = localStorage.getItem('admin_user_backup');

        if (adminAccess && adminRefresh && adminUser) {
          // Restore Admin Session
          localStorage.setItem('access_token', adminAccess);
          localStorage.setItem('refresh_token', adminRefresh);
          localStorage.setItem('skillmount_user', adminUser);

          // Clear Backups
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user_backup');

          // Redirect to Admin safely
          window.location.href = '/admin';
          return Promise.reject(refreshError);
        }

        // Otherwise (normal user), force logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('skillmount_user');

        // ONLY redirect to login to avoid infinite reloads
        // And don't redirect if we are already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;