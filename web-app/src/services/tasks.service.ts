import {
  apiClient,
  tasksService as frontendTasksService,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
} from '@tasks-management/frontend-services';

class TasksService {
  async getAllTasks(todoListId?: string): Promise<Task[]> {
    return frontendTasksService.getAll(todoListId);
  }

  async getTasksByList(todoListId: string, ownerId?: string | null): Promise<Task[]> {
    if (todoListId === 'shared') {
      const { taskSharingService } = await import('@tasks-management/frontend-services');
      const shares = await taskSharingService.getTasksSharedWithMe();

      let filteredShares = shares;
      if (ownerId) {
        filteredShares = shares.filter(share => share.task?.todoList?.ownerId === ownerId);
      }

      return filteredShares.map(share => ({
        ...share.task!,
        role: share.role
      }));
    }
    return frontendTasksService.getAll(todoListId);
  }

  async getTasksByDate(date?: string): Promise<Task[]> {
    return frontendTasksService.getByDate(date);
  }

  async getTaskById(id: string): Promise<Task> {
    return frontendTasksService.getById(id);
  }

  async createTask(todoListId: string, data: CreateTaskDto): Promise<Task> {
    return frontendTasksService.create(todoListId, data);
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    return frontendTasksService.update(id, data);
  }

  async deleteTask(id: string): Promise<Task> {
    return frontendTasksService.delete(id);
  }

  async restoreTask(id: string): Promise<Task> {
    return apiClient.post<Task>(`/tasks/${id}/restore`);
  }

  async permanentDeleteTask(id: string): Promise<Task> {
    return apiClient.delete<Task>(`/tasks/${id}/permanent`);
  }

  async reorderTasks(tasks: { id: string; order: number }[]): Promise<void> {
    return frontendTasksService.reorderTasks(tasks);
  }

  async bulkUpdate(ids: string[], data: UpdateTaskDto): Promise<void> {
    return frontendTasksService.bulkUpdate(ids, data);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return frontendTasksService.bulkDelete(ids);
  }
}

export const tasksService = new TasksService();
