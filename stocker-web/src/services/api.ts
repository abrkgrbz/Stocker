import { message } from 'antd';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.stoocker.app';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds for long operations
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
});

// Request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or session
    const token = localStorage.getItem('stocker_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant ID if available
    const tenantId = localStorage.getItem('stocker_tenant');
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    }
    
    // Add tenant code if available (for multi-tenant operations)
    const tenantCode = localStorage.getItem('X-Tenant-Code');
    if (tenantCode) {
      config.headers['X-Tenant-Code'] = tenantCode;
    }
    
    // Debug: Log request details in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        hasToken: !!token,
        hasTenantId: !!tenantId,
        hasTenantCode: !!tenantCode
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Ensure response is properly decoded as UTF-8
    if (response.headers['content-type']?.includes('application/json')) {
      // Response is already parsed by axios
      return response;
    }
    return response;
  },
  async (error) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 401:
          // Handle unauthorized access
          // Don't redirect if already on login or public pages
          const currentPath = window.location.pathname;
          const publicPaths = ['/', '/login', '/forgot-password', '/register', '/verify-email'];
          
          if (!publicPaths.includes(currentPath)) {
            message.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
            localStorage.removeItem('stocker_token');
            localStorage.removeItem('stocker_refresh_token');
            localStorage.removeItem('stocker_tenant');
            localStorage.removeItem('company_setup_complete');
            window.location.href = '/login';
          }
          break;
        
        case 403:
          message.error('Bu işlem için yetkiniz bulunmamaktadır.');
          break;
        
        case 404:
          message.error('İstenen kaynak bulunamadı.');
          break;
        
        case 422:
          // Validation errors
          if (response.data?.errors) {
            const errors = response.data.errors;
            const errorMessage = Object.values(errors).flat().join(', ');
            message.error(errorMessage);
          } else {
            message.error('Girdiğiniz bilgileri kontrol edin.');
          }
          break;
        
        case 500:
          message.error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
          break;
        
        default:
          message.error(response.data?.message || 'Bir hata oluştu.');
      }
    } else if (error.request) {
      // Request was made but no response received
      message.error('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
    } else {
      // Something else happened
      message.error('Beklenmeyen bir hata oluştu.');
    }

    return Promise.reject(error);
  }
);

// API methods
const api = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.get<T>(url, config);
  },

  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.post<T>(url, data, config);
  },

  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.put<T>(url, data, config);
  },

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch<T>(url, data, config);
  },

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete<T>(url, config);
  },

  // File upload
  upload: <T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<AxiosResponse<T>> => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },

  // Download file
  download: async (url: string, fileName?: string): Promise<void> => {
    try {
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      message.error('Dosya indirilemedi.');
      throw error;
    }
  },
};

export default api;
export { api, axiosInstance, API_BASE_URL };