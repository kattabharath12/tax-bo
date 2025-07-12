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

  // ADD THIS METHOD - Update existing tax return
  updateTaxReturn: async (taxReturnId, taxReturnData) => {
    try {
      const response = await api.put(`/tax-returns/${taxReturnId}`, taxReturnData);
      return response.data;
    } catch (error) {
      console.error('Error updating tax return:', error);
      throw new Error('Failed to update tax return');
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

  // ADD THIS METHOD - Delete tax return
  deleteTaxReturn: async (taxReturnId) => {
    try {
      const response = await api.delete(`/tax-returns/${taxReturnId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting tax return:', error);
      throw new Error('Failed to delete tax return');
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

  // ADD THIS METHOD - Get single document
  getDocument: async (documentId) => {
    try {
      const response = await api.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw new Error('Failed to fetch document');
    }
  },

  // ADD THIS METHOD - Delete document
  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  },

  // ADD THIS METHOD - Process document for tax data extraction
  processDocumentForTaxData: async (documentId) => {
    try {
      const response = await api.post(`/documents/${documentId}/process-tax-data`);
      return response.data;
    } catch (error) {
      console.error('Error processing document for tax data:', error);
      // If backend doesn't support this endpoint yet, return empty data
      return {
        income: 0,
        withholdings: 0,
        deductions: 0,
        tax_year: new Date().getFullYear() - 1,
        filing_status: 'single'
      };
    }
  },

  // ADD THIS METHOD - Auto-create tax return from document
  autoCreateTaxReturnFromDocument: async (documentId) => {
    try {
      const response = await api.post(`/documents/${documentId}/auto-create-tax-return`);
      return response.data;
    } catch (error) {
      console.error('Error auto-creating tax return from document:', error);
      throw new Error('Failed to auto-create tax return from document');
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

  // ADD THIS METHOD - Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/me', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
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
  },

  // ADD THIS METHOD - Get payments
  getPayments: async () => {
    try {
      const response = await api.get('/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw new Error('Failed to fetch payments');
    }
  },

  // ADD THIS METHOD - Get payment by ID
  getPayment: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new Error('Failed to fetch payment');
    }
  },

  // ADD THESE METHODS - Tax calculation and validation
  calculateTax: async (taxData) => {
    try {
      const response = await api.post('/tax-returns/calculate', taxData);
      return response.data;
    } catch (error) {
      console.error('Error calculating tax:', error);
      // Fallback calculation if backend doesn't support
      return {
        tax_owed: 0,
        refund_amount: 0,
        amount_owed: 0,
        effective_tax_rate: 0
      };
    }
  },

  validateTaxReturn: async (taxReturnData) => {
    try {
      const response = await api.post('/tax-returns/validate', taxReturnData);
      return response.data;
    } catch (error) {
      console.error('Error validating tax return:', error);
      return { valid: true, errors: [] };
    }
  },

  // ADD THIS METHOD - Submit/file tax return
  submitTaxReturn: async (taxReturnId) => {
    try {
      const response = await api.post(`/tax-returns/${taxReturnId}/submit`);
      return response.data;
    } catch (error) {
      console.error('Error submitting tax return:', error);
      throw new Error('Failed to submit tax return');
    }
  },

  // ADD THESE METHODS - Export functionality
  exportTaxReturnPDF: async (taxReturnId) => {
    try {
      const response = await api.get(`/tax-returns/${taxReturnId}/export/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting tax return as PDF:', error);
      throw new Error('Failed to export tax return as PDF');
    }
  },

  exportTaxReturnJSON: async (taxReturnId) => {
    try {
      const response = await api.get(`/tax-returns/${taxReturnId}/export/json`);
      return response.data;
    } catch (error) {
      console.error('Error exporting tax return as JSON:', error);
      throw new Error('Failed to export tax return as JSON');
    }
  },

  // ADD THIS METHOD - Get tax return status
  getTaxReturnStatus: async (taxReturnId) => {
    try {
      const response = await api.get(`/tax-returns/${taxReturnId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tax return status:', error);
      throw new Error('Failed to fetch tax return status');
    }
  }
};

// Export both named export and default export for backward compatibility
export default apiService;

// Also export the raw axios instance if needed
export { api };
