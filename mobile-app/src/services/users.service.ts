import { apiClient, ApiError } from '../utils/api-client';
import { TokenStorage } from '../utils/storage';
import { User, UpdateUserDto } from '../types';

export class UsersService {
  /**
   * Get current authenticated user
   */
  async getCurrent(): Promise<User> {
    try {
      const response = await apiClient.get<User[]>('/users');
      if (!response.data || response.data.length === 0) {
        throw new ApiError(404, 'No authenticated user found');
      }
      return response.data[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Failed to get current user');
    }
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Failed to get user');
    }
  }

  /**
   * Update user profile
   */
  async update(id: string, data: UpdateUserDto): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Failed to update user');
    }
  }

  /**
   * Upload profile picture
   */
  async uploadAvatar(
    id: string,
    fileUri: string,
    fileName: string,
    fileType: string,
  ): Promise<User> {
    try {
      const url = apiClient.defaults.baseURL + `/users/${id}/upload-avatar`;
      const token = await TokenStorage.getToken();

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);

      console.log('[UsersService] Uploading via fetch to:', url);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Mobile-Client': 'true',
          // Note: DO NOT set Content-Type, fetch will set it with boundary
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UsersService] Upload failed:', response.status, errorText);
        throw new ApiError(response.status, `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[UsersService] Upload error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Failed to upload avatar via network');
    }
  }
}

export const usersService = new UsersService();
