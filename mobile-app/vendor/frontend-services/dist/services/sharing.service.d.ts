import { ListShare, ShareListDto, ToDoList } from '../types';
export declare class SharingService {
    /**
     * Share a list with a user
     */
    shareList(todoListId: string, data: ShareListDto): Promise<ListShare>;
    /**
     * Get all lists shared with a user
     */
    getSharedLists(userId: string): Promise<ToDoList[]>;
    /**
     * Get all users a list is shared with
     */
    getListShares(todoListId: string): Promise<ListShare[]>;
    /**
     * Unshare a list with a user
     */
    unshareList(todoListId: string, userId: string): Promise<void>;
}
export declare const sharingService: SharingService;
