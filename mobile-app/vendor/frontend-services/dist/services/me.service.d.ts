import { ToDoList, Task, TrashResponse, UpdateProfilePictureResponse } from '../types';
export declare class MeService {
    /**
     * Get my lists
     */
    getLists(): Promise<ToDoList[]>;
    /**
     * Get my tasks
     */
    getTasks(todoListId?: string): Promise<Task[]>;
    /**
     * Get my trash (deleted items)
     */
    getTrash(): Promise<TrashResponse>;
    /**
     * Update profile picture
     */
    uploadProfilePicture(file: File): Promise<UpdateProfilePictureResponse>;
}
export declare const meService: MeService;
