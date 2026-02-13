import {
  sharingService as frontendSharingService,
  ListShare,
  ShareListDto,
  ToDoList,
} from '@tasks-management/frontend-services';

class SharingService {
  async shareList(todoListId: string, data: ShareListDto): Promise<ListShare> {
    return frontendSharingService.shareList(todoListId, data);
  }

  async getSharedLists(userId: string): Promise<ToDoList[]> {
    return frontendSharingService.getSharedLists(userId);
  }

  async getListShares(todoListId: string): Promise<ListShare[]> {
    return frontendSharingService.getListShares(todoListId);
  }

  async unshareList(todoListId: string, userId: string): Promise<void> {
    return frontendSharingService.unshareList(todoListId, userId);
  }
}

export const sharingService = new SharingService();
