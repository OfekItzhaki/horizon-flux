import { getApiUrl, getAuthUrl } from '../config';
import { TokenStorage } from './storage';
export class ApiClient {
    constructor(urlResolver = getApiUrl) {
        this.urlResolver = urlResolver;
        this.isRefreshing = false;
        this.refreshPromise = null;
    }
    async request(method, path, options = {}) {
        const url = this.urlResolver(path);
        const token = TokenStorage.getToken();
        const { headers: optionsHeaders, method: optionsMethod, ...restOptions } = options;
        const isFormData = restOptions.body instanceof FormData;
        const headers = {
            ...optionsHeaders,
        };
        if (!isFormData && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
        else if (isFormData && headers['Content-Type']) {
            delete headers['Content-Type'];
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const config = {
            ...restOptions,
            method,
            headers,
            credentials: 'include',
        };
        try {
            const response = await fetch(url, config);
            if (response.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
                return this.handleUnauthorized(method, path, options);
            }
            if (response.status === 204) {
                return undefined;
            }
            let data;
            try {
                const text = await response.text();
                data = text ? JSON.parse(text) : null;
            }
            catch (parseError) {
                if (parseError instanceof SyntaxError) {
                    throw {
                        statusCode: response.status,
                        message: 'Invalid JSON response from server',
                        error: 'JSON_PARSE_ERROR',
                    };
                }
                throw parseError;
            }
            if (!response.ok) {
                const error = {
                    statusCode: response.status,
                    message: data?.message || 'An error occurred',
                    error: data?.error,
                };
                throw error;
            }
            return data;
        }
        catch (error) {
            if (error && typeof error === 'object' && 'statusCode' in error) {
                throw error;
            }
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw {
                    statusCode: 0,
                    message: 'Network error: Could not connect to the server',
                };
            }
            throw {
                statusCode: 0,
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
            };
        }
    }
    async handleUnauthorized(method, path, options) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshPromise = this.refreshToken();
        }
        try {
            await this.refreshPromise;
            this.isRefreshing = false;
            this.refreshPromise = null;
            return this.request(method, path, options);
        }
        catch (refreshError) {
            this.isRefreshing = false;
            this.refreshPromise = null;
            TokenStorage.removeToken();
            throw refreshError;
        }
    }
    async refreshToken() {
        const url = this.urlResolver('/auth/refresh');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (!response.ok) {
            throw {
                statusCode: response.status,
                message: 'Session expired',
                error: 'REFRESH_TOKEN_EXPIRED',
            };
        }
        const data = await response.json();
        TokenStorage.setToken(data.accessToken);
        return data;
    }
    async get(path, options) {
        return this.request('GET', path, options);
    }
    async post(path, body, options) {
        const isFormData = body instanceof FormData;
        return this.request('POST', path, {
            ...options,
            body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
        });
    }
    async patch(path, body, options) {
        return this.request('PATCH', path, {
            ...options,
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    async delete(path, options) {
        return this.request('DELETE', path, options);
    }
}
export const apiClient = new ApiClient(getApiUrl);
export const authClient = new ApiClient(getAuthUrl);
