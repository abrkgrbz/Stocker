import { apiClient } from './axios-client';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export class ApiService {
  /**
   * Generic GET request
   */
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.get(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  static async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.post(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  static async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.put(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  static async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.patch(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.delete(url, config);
    return response.data;
  }
}

export default ApiService;
