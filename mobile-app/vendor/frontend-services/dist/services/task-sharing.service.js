import { apiClient } from '../utils/api-client';
export class TaskSharingService {
    /**
     * Share a task with a user
     */
    async shareTask(taskId, data) {
        return apiClient.post(`/task-shares/${taskId}/share`, data);
    }
    /**
     * Get all users a task is shared with
     */
    async getTaskShares(taskId) {
        return apiClient.get(`/task-shares/${taskId}/shares`);
    }
    /**
     * Unshare a task with a user
     */
    async unshareTask(taskId, userId) {
        return apiClient.delete(`/task-shares/${taskId}/share/${userId}`);
    }
    /**
     * Update share role for a user
     */
    async updateShareRole(taskId, userId, role) {
        return apiClient.patch(`/task-shares/${taskId}/share/${userId}/role`, { role });
    }
    /**
     * Get all tasks shared with the current user
     */
    async getTasksSharedWithMe() {
        return apiClient.get('/task-shares/my-shared-tasks');
    }
}
export const taskSharingService = new TaskSharingService();
