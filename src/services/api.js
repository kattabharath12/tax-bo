// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://tax-box-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Get auth token
  getAuthToken: () => localStorage.getItem('token'),
  
  // Filing status endpoints
  getStandardDeductions: async (taxYear = 2024) => {
    try {
      const response = await api.get(`/filing-status/standard-deductions?tax_year=${taxYear}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching standard deductions:', error);
      throw new Error('Failed to fetch standard deductions');
    }
  },

  getFilingStatusOptions: async () => {
    try {
      const response = await api.get('/filing-status/options');
      return response.data;
    } catch (error) {
      console.error('Error fetching filing status options:', error);
      throw new Error('Failed to fetch filing status options');
    }
  },

  // Tax return endpoints
  createTaxReturn: async (taxReturnData) => {
    try {
      const response = await api.post('/tax-returns', taxReturnData);
      return response.data;
    } catch (error) {
      console.error('Error creating tax return:', error);
      throw new Error('Failed to create tax return');
    }
  },

  updateFilingStatus: async (taxReturnId, filingStatusData) => {
    try {
      const response = await api.put(`/tax-returns/${taxReturnId}/filing-status`, filingStatusData);
      return response.data;
    } catch (error) {
      console.error('Error updating filing status:', error);
      throw new Error('Failed to update filing status');
    }
  },

  getTaxReturns: async () => {
    try {
      const response = await api.get('/tax-returns');
      return response.data;
    } catch (error) {
      console.error('Error fetching tax returns:', error);
      throw new Error('Failed to fetch tax returns');
    }
  },

  getTaxReturn: async (taxReturnId) => {
    try {
      const response = await api.get(`/tax-returns/${taxReturnId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tax return:', error);
      throw new Error('Failed to fetch tax return');
    }
  },

  // Document endpoints
  uploadDocument: async (formData) => {
    try {
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  },

  getDocuments: async () => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }
  },

  // User endpoints
  getProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Failed to fetch profile');
    }
  },

  // Payment endpoints
  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }
};

// Export both named export and default export for backward compatibility
export default apiService;

// Also export the raw axios instance if needed
export { api };
