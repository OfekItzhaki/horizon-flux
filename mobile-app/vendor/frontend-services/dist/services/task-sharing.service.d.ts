import { TaskShare, ShareTaskDto, ShareRole } from '../types';
export declare class TaskSharingService {
    /**
     * Share a task with a user
     */
    shareTask(taskId: string, data: ShareTaskDto): Promise<TaskShare>;
    /**
     * Get all users a task is shared with
     */
    getTaskShares(taskId: string): Promise<TaskShare[]>;
    /**
     * Unshare a task with a user
     */
    unshareTask(taskId: string, userId: string): Promise<void>;
    /**
     * Update share role for a user
     */
    updateShareRole(taskId: string, userId: string, role: ShareRole): Promise<TaskShare>;
    /**
     * Get all tasks shared with the current user
     */
    getTasksSharedWithMe(): Promise<TaskShare[]>;
}
export declare const taskSharingService: TaskSharingService;
