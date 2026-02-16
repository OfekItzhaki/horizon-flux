import { Test, TestingModule } from '@nestjs/testing';
import { TaskSharesService } from './task-shares.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { TaskAccessHelper } from '../tasks/helpers/task-access.helper';
import { ShareRole } from '@prisma/client';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('TaskSharesService', () => {
  let service: TaskSharesService;
  let taskAccessHelper: TaskAccessHelper;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
    },
    taskShare: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockEventsGateway = {
    sendToUser: jest.fn(),
  };

  const mockTaskAccessHelper = {
    findTaskForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskSharesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventsGateway, useValue: mockEventsGateway },
        { provide: TaskAccessHelper, useValue: mockTaskAccessHelper },
      ],
    }).compile();

    service = module.get<TaskSharesService>(TaskSharesService);
    taskAccessHelper = module.get<TaskAccessHelper>(TaskAccessHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shareTask', () => {
    const taskId = 'task-1';
    const ownerId = 'owner-1';
    const shareDto = { email: 'user@example.com', role: ShareRole.EDITOR };

    it('should share a task successfully', async () => {
      const targetUser = { id: 'user-1', email: 'user@example.com' };
      taskAccessHelper.findTaskForUser = jest.fn().mockResolvedValue({ id: taskId });
      mockPrismaService.user.findFirst.mockResolvedValue(targetUser);
      mockPrismaService.taskShare.findUnique.mockResolvedValue(null);
      mockPrismaService.taskShare.create.mockResolvedValue({
        id: 'share-1',
        sharedWithId: targetUser.id,
        taskId: taskId,
        task: { id: taskId, description: 'Test Task' },
      });

      const result = await service.shareTask(taskId, shareDto, ownerId);

      expect(result).toBeDefined();
      expect(mockPrismaService.taskShare.create).toHaveBeenCalled();
      expect(mockEventsGateway.sendToUser).toHaveBeenCalledWith(
        targetUser.id,
        'task_shared',
        expect.anything(),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      await expect(service.shareTask(taskId, shareDto, ownerId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if sharing with self', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: ownerId });
      await expect(service.shareTask(taskId, shareDto, ownerId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if already shared', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.taskShare.findUnique.mockResolvedValue({ id: 'existing-share' });
      await expect(service.shareTask(taskId, shareDto, ownerId)).rejects.toThrow(ConflictException);
    });
  });

  describe('unshareTask', () => {
    it('should unshare a task', async () => {
      const taskId = 'task-1';
      const userId = 'user-1';
      const ownerId = 'owner-1';
      const shareId = 'share-1';

      mockPrismaService.taskShare.findUnique.mockResolvedValue({ id: shareId });
      mockPrismaService.taskShare.delete.mockResolvedValue({ id: shareId });

      await service.unshareTask(taskId, userId, ownerId);

      expect(mockPrismaService.taskShare.delete).toHaveBeenCalledWith({
        where: { id: shareId },
      });
      expect(mockEventsGateway.sendToUser).toHaveBeenCalledWith(userId, 'task_unshared', {
        id: taskId,
      });
    });
  });
});
