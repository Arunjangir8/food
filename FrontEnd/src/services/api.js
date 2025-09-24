import axios from 'axios';

const API_BASE_URL = 'https://food-f5l3.vercel.app/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  registerRestaurant: (formData) => api.post('/auth/restaurant/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  loginRestaurant: (credentials) => api.post('/auth/restaurant/login', credentials),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};


export const restaurantAPI = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  getMyRestaurant: () => api.get('/restaurants/my-restaurant'),
  getCuisines: () => api.get('/restaurants/cuisines/all'),
  uploadImages: (id, formData) => api.post(`/restaurants/${id}/upload-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};


export const menuAPI = {
  getByRestaurant: (restaurantId) => api.get(`/menu/restaurant/${restaurantId}`),
  createItem: (data) => {
    const config = data instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.post('/menu/items', data, config);
  },
  updateItem: (id, data) => {
    const config = data instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.put(`/menu/items/${id}`, data, config);
  },
  deleteItem: (id) => api.delete(`/menu/items/${id}`),
};


export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getUserOrders: (params) => api.get('/orders', { params }),
  getRestaurantOrders: (params) => api.get('/orders/restaurant/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};


export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => {
    const config = data instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.put('/users/profile', data, config);
  },
  changePassword: (data) => api.put('/users/change-password', data),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  

  getCart: () => api.get('/users/cart'),
  addToCart: (data) => api.post('/users/cart', data),
  updateCartItem: (id, data) => api.put(`/users/cart/${id}`, data),
  removeFromCart: (id) => api.delete(`/users/cart/${id}`),
  clearCart: () => api.delete('/users/cart'),
  

  getFavorites: () => api.get('/users/favorites'),
  addToFavorites: (data) => api.post('/users/favorites', data),
  removeFromFavorites: (id) => api.delete(`/users/favorites/${id}`),
};

export default api;