import { authClient } from '../utils/api-client';
export class UsersService {
    /**
     * Register a new user
     */
    async create(data) {
        return authClient.post('/users', data);
    }
    /**
     * Get current authenticated user
     */
    async getCurrent() {
        return authClient.get('/users/me');
    }
    /**
     * Get user by ID
     */
    async getById(id) {
        return authClient.get(`/users/${id}`);
    }
    /**
     * Update user profile
     */
    async update(id, data) {
        return authClient.patch(`/users/${id}`, data);
    }
    /**
     * Soft delete user account
     */
    async delete(id) {
        return authClient.delete(`/users/${id}`);
    }
    /**
     * Upload profile picture
     */
    async uploadAvatar(id, file) {
        const formData = new FormData();
        formData.append('file', file);
        return authClient.post(`/users/${id}/upload-avatar`, formData);
    }
}
export const usersService = new UsersService();
