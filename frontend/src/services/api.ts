import axios from 'axios';

const backendUrl = (
  import.meta.env.VITE_API_URL || ''
).replace(/\/$/, '');

const api = axios.create({
  baseURL: backendUrl
    ? `${backendUrl}/api/v1`
    : '/api/v1',

  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrivision_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname;

      if (
        !path.includes('/login') &&
        !path.includes('/register')
      ) {
        localStorage.removeItem('agrivision_token');
        localStorage.removeItem('agrivision_user');
      }
    }

    return Promise.reject(error);
  }
);

export default api;