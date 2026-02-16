import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShareRole } from '@prisma/client';

@Injectable()
export class TaskAccessHelper {
  constructor(private readonly prisma: PrismaService) {}

  async ensureListAccess(
    todoListId: string,
    userId: string,
    requiredRole: ShareRole = ShareRole.VIEWER,
  ) {
    const list = await this.prisma.toDoList.findFirst({
      where: {
        id: todoListId,
        deletedAt: null,
      },
      include: {
        shares: {
          where: { sharedWithId: userId },
        },
      },
    });

    if (!list) {
      throw new NotFoundException(`ToDoList with ID ${todoListId} not found`);
    }

    // Owner always has access
    if (list.ownerId === userId) {
      return list;
    }

    const share = list.shares[0];
    if (!share) {
      throw new ForbiddenException('You do not have access to this list');
    }

    // RBAC: EDITOR can do everything a VIEWER can.
    // If required is VIEWER, both VIEWER and EDITOR are fine.
    // If required is EDITOR, only EDITOR is fine.
    if (requiredRole === ShareRole.EDITOR && share.role !== ShareRole.EDITOR) {
      throw new ForbiddenException('You need Editor permissions for this action');
    }

    return list;
  }

  async findTaskForUser(id: string, userId: string, requiredRole: ShareRole = ShareRole.VIEWER) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        steps: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        shares: {
          where: { sharedWithId: userId },
        },
        todoList: {
          include: {
            shares: {
              where: { sharedWithId: userId },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // 1. Owner check
    if (task.todoList.ownerId === userId) {
      return task;
    }

    // 2. List-level access check
    const listShare = task.todoList.shares[0];
    if (listShare) {
      if (requiredRole === ShareRole.VIEWER || listShare.role === ShareRole.EDITOR) {
        return task;
      }
    }

    // 3. Task-level access check
    const taskShare = task.shares[0];
    if (taskShare) {
      if (requiredRole === ShareRole.VIEWER || taskShare.role === ShareRole.EDITOR) {
        return task;
      }
    }

    throw new ForbiddenException(
      `You do not have ${requiredRole.toLowerCase()} access to this task`,
    );
  }
}
