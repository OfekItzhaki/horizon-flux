import axios, { AxiosInstance, AxiosError } from 'axios';
import { getApiUrl, getAuthUrl } from '../config/api';
import { TokenStorage, UserStorage } from './storage';
import { normalizeBooleans } from './normalize';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(private getBaseUrl: (endpoint: string) => string) {
    this.instance = axios.create({
      baseURL: getBaseUrl(''),
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(async (config) => {
      const token = await TokenStorage.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      if (config.data instanceof FormData) delete config.headers['Content-Type'];
      return config;
    });

    this.instance.interceptors.response.use(
      (response) => {
        if (response.data) response.data = normalizeBooleans(response.data);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (error.response) {
          const statusCode = error.response.status;
          const serverMessage = (error.response.data as any)?.message;

          if (statusCode === 401 && originalRequest && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
            if (!this.isRefreshing) {
              this.isRefreshing = true;
              this.refreshPromise = (async () => {
                try {
                  const response = await axios.post(getAuthUrl('/auth/refresh'), {}, { withCredentials: true });
                  const newToken = response.data.accessToken;
                  await TokenStorage.setToken(newToken);
                  return newToken;
                } catch (refreshError) {
                  await TokenStorage.removeToken();
                  await UserStorage.removeUser();
                  throw refreshError;
                } finally {
                  this.isRefreshing = false;
                  this.refreshPromise = null;
                }
              })();
            }

            try {
              const token = await this.refreshPromise;
              if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            } catch (retryError) {
              return Promise.reject(retryError);
            }
          }

          if (statusCode === 401) {
            await TokenStorage.removeToken();
            await UserStorage.removeUser();
          }

          let message = serverMessage || 'An error occurred';
          switch (statusCode) {
            case 400: message = serverMessage || 'Invalid request.'; break;
            case 401: message = 'Session expired. Please log in again.'; break;
            case 403: message = 'Access forbidden.'; break;
            case 404: message = 'Not found.'; break;
            case 500: message = 'Server error.'; break;
          }
          throw new ApiError(statusCode, message, error.response.data);
        }
        throw new ApiError(0, 'Network error. Please check your connection.');
      }
    );
  }

  async get<T>(url: string, config = {}) { return this.instance.get<T>(url, config); }
  async post<T>(url: string, data = {}, config = {}) { return this.instance.post<T>(url, data, config); }
  async put<T>(url: string, data = {}, config = {}) { return this.instance.put<T>(url, data, config); }
  async patch<T>(url: string, data = {}, config = {}) { return this.instance.patch<T>(url, data, config); }
  async delete<T>(url: string, config = {}) { return this.instance.delete<T>(url, config); }
}

export const apiClient = new ApiClient(getApiUrl);
export const authClient = new ApiClient(getAuthUrl);
