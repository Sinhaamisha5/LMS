import axios from 'axios';

// Create an axios instance with credentials enabled for cookies
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Response interceptor to handle errors centrally if desired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can transform error messages here
    return Promise.reject(error);
  }
);

export default api;