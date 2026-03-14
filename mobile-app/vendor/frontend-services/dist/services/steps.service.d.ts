import { Step, CreateStepDto, UpdateStepDto } from '../types';
export declare class StepsService {
    /**
     * Get all steps for a task
     */
    getByTask(taskId: string): Promise<Step[]>;
    /**
     * Create a new step
     */
    create(taskId: string, data: CreateStepDto): Promise<Step>;
    /**
     * Update step
     */
    update(id: string, data: UpdateStepDto): Promise<Step>;
    /**
     * Delete step (soft delete)
     */
    delete(id: string): Promise<Step>;
    /**
     * Reorder steps for a task
     */
    reorder(taskId: string, stepIds: string[]): Promise<Step[]>;
}
export declare const stepsService: StepsService;
