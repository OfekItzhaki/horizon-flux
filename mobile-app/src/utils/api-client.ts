import axios, { AxiosInstance, AxiosError } from 'axios';
import { getApiUrl } from '../config/api';
import { TokenStorage } from './storage';
import { normalizeBooleans } from './normalize';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Create and configure axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getApiUrl(''),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: Add auth token
  client.interceptors.request.use(
    async (config) => {
      const token = await TokenStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor: Normalize data and handle errors
  client.interceptors.response.use(
    (response) => {
      // Normalize boolean values in response data
      if (response.data) {
        response.data = normalizeBooleans(response.data);
      }
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        const statusCode = error.response.status;
        const message =
          (error.response.data as any)?.message ||
          error.message ||
          'An error occurred';
        throw new ApiError(statusCode, message, error.response.data);
      } else if (error.request) {
        // Enhanced error message for network issues
        const baseURL = getApiUrl('');
        const errorMessage = `Network error: Cannot reach server at ${baseURL}. ` +
          `Make sure:\n` +
          `1. Backend is running\n` +
          `2. Using your computer's IP (not localhost) on physical devices\n` +
          `3. Phone and computer are on the same network`;
        throw new ApiError(0, errorMessage);
      } else {
        throw new ApiError(0, error.message || 'An error occurred');
      }
    },
  );

  return client;
};

export const apiClient = createApiClient();


