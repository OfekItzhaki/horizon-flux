import { Task, CreateTaskDto, UpdateTaskDto } from '../types';
export declare class TasksService {
    /**
     * Get all tasks (optionally filtered by list)
     */
    getAll(todoListId?: string): Promise<Task[]>;
    /**
     * Get tasks for a specific date
     */
    getByDate(date?: string): Promise<Task[]>;
    /**
     * Get task by ID
     */
    getById(id: string): Promise<Task>;
    /**
     * Create a task in a list
     */
    create(todoListId: string, data: CreateTaskDto): Promise<Task>;
    /**
     * Update task
     */
    update(id: string, data: UpdateTaskDto): Promise<Task>;
    /**
     * Delete task (soft delete)
     */
    delete(id: string): Promise<Task>;
    /**
     * Reorder tasks (updates the order property)
     */
    reorderTasks(tasks: {
        id: string;
        order: number;
    }[]): Promise<void>;
    /**
     * Bulk update tasks
     */
    bulkUpdate(ids: string[], data: UpdateTaskDto): Promise<void>;
    /**
     * Bulk delete tasks
     */
    bulkDelete(ids: string[]): Promise<void>;
    /**
     * Get user's tasks (optionally filtered by list)
     */
    getMyTasks(todoListId?: string): Promise<Task[]>;
}
export declare const tasksService: TasksService;
