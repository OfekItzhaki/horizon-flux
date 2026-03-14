import { apiClient } from '../utils/api-client';
export class MeService {
    /**
     * Get my lists
     */
    async getLists() {
        return apiClient.get('/me/lists');
    }
    /**
     * Get my tasks
     */
    async getTasks(todoListId) {
        const path = todoListId ? `/me/tasks?todoListId=${todoListId}` : '/me/tasks';
        return apiClient.get(path);
    }
    /**
     * Get my trash (deleted items)
     */
    async getTrash() {
        return apiClient.get('/me/trash');
    }
    /**
     * Update profile picture
     */
    async uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/me/profile-picture', formData);
    }
}
export const meService = new MeService();
