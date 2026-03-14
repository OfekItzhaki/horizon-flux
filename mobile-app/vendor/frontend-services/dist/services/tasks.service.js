import { apiClient } from '../utils/api-client';
export class TasksService {
    /**
     * Get all tasks (optionally filtered by list)
     */
    async getAll(todoListId) {
        const path = todoListId ? `/tasks?todoListId=${todoListId}` : '/tasks';
        return apiClient.get(path);
    }
    /**
     * Get tasks for a specific date
     */
    async getByDate(date) {
        if (date) {
            const encodedDate = encodeURIComponent(date);
            return apiClient.get(`/tasks/by-date?date=${encodedDate}`);
        }
        return apiClient.get('/tasks/by-date');
    }
    /**
     * Get task by ID
     */
    async getById(id) {
        return apiClient.get(`/tasks/${id}`);
    }
    /**
     * Create a task in a list
     */
    async create(todoListId, data) {
        return apiClient.post(`/tasks/todo-list/${todoListId}`, data);
    }
    /**
     * Update task
     */
    async update(id, data) {
        return apiClient.patch(`/tasks/${id}`, data);
    }
    /**
     * Delete task (soft delete)
     */
    async delete(id) {
        return apiClient.delete(`/tasks/${id}`);
    }
    /**
     * Reorder tasks (updates the order property)
     */
    async reorderTasks(tasks) {
        // Sequentially update for simplicity and to avoid race conditions on order
        for (const task of tasks) {
            await this.update(task.id, { order: task.order });
        }
    }
    /**
     * Bulk update tasks
     */
    async bulkUpdate(ids, data) {
        await Promise.all(ids.map((id) => this.update(id, data)));
    }
    /**
     * Bulk delete tasks
     */
    async bulkDelete(ids) {
        await Promise.all(ids.map((id) => this.delete(id)));
    }
    /**
     * Get user's tasks (optionally filtered by list)
     */
    async getMyTasks(todoListId) {
        const path = todoListId ? `/me/tasks?todoListId=${todoListId}` : '/me/tasks';
        return apiClient.get(path);
    }
}
export const tasksService = new TasksService();
