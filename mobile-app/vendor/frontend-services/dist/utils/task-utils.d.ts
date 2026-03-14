import { Task } from '../types';
/**
 * Normalize tasks - ensure boolean fields are properly typed
 */
export declare function normalizeTasks(tasks: Task[]): Task[];
/**
 * Normalize a single task
 */
export declare function normalizeTask(task: Task): Task;
/**
 * Check if a task is overdue
 */
export declare function isOverdue(task: Task): boolean;
/**
 * Filter tasks by search query
 */
export declare function filterTasksByQuery(tasks: Task[], query: string): Task[];
/**
 * Sort tasks by various criteria
 */
export type SortOption = 'default' | 'dueDate' | 'completed' | 'alphabetical';
export declare function sortTasks(tasks: Task[], sortBy: SortOption): Task[];
/**
 * Get formatted sort option label
 */
export declare function getSortLabel(sortBy: SortOption): string;
/**
 * Calculate steps progress percentage
 */
export declare function calculateStepsProgress(steps: {
    completed: boolean;
}[]): number;
