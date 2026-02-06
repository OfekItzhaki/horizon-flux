import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ListType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TaskAccessHelper } from '../tasks/helpers/task-access.helper';
import { ShareRole } from '@prisma/client';
import { CreateToDoListDto } from './dto/create-todo-list.dto';
import { UpdateToDoListDto } from './dto/update-todo-list.dto';

@Injectable()
export class TodoListsService {
  private readonly logger = new Logger(TodoListsService.name);

  constructor(
    private prisma: PrismaService,
    private taskAccess: TaskAccessHelper,
  ) { }

  async create(createToDoListDto: CreateToDoListDto, ownerId: string) {
    const list = await (this.prisma.toDoList as any).create({
      data: {
        name: createToDoListDto.name,
        // List "type" is an internal scheduling/system detail.
        // User-created lists are always CUSTOM.
        type: ListType.CUSTOM,
        ownerId,
      },
    });
    this.logger.log(`List created: listId=${list.id} userId=${ownerId}`);
    return list;
  }

  async findAll(ownerId: string) {
    return (this.prisma.toDoList as any).findMany({
      where: {
        deletedAt: null,
        ownerId,
      },
      // Tasks are not needed for list view - only when viewing a specific list
      // This dramatically reduces payload size and improves performance
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    await this.taskAccess.ensureListAccess(id, userId);

    const list = await (this.prisma.toDoList as any).findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        tasks: {
          where: {
            deletedAt: null,
          },
          include: {
            steps: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!list) {
      throw new NotFoundException(`ToDoList with ID ${id} not found`);
    }

    return list;
  }

  async update(
    id: string,
    updateToDoListDto: UpdateToDoListDto,
    userId: string,
  ) {
    const list = await this.taskAccess.ensureListAccess(id, userId, ShareRole.EDITOR);

    const updated = await (this.prisma.toDoList as any).update({
      where: { id },
      data: {
        name: updateToDoListDto.name ?? (list as any).name,
      },
    });
    this.logger.log(`List updated: listId=${id} userId=${userId}`);
    return updated;
  }

  async remove(id: string, ownerId: string) {
    const list = await this.findOne(id, ownerId);

    // Prevent deletion of system lists (like "Finished Tasks")
    if (list.isSystem) {
      throw new Error('System lists cannot be deleted');
    }

    const result = await (this.prisma.toDoList as any).update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    this.logger.log(`List removed (soft): listId=${id} userId=${ownerId}`);
    return result;
  }

  async restore(id: string, ownerId: string) {
    const list = await (this.prisma.toDoList as any).findFirst({
      where: { id, ownerId, deletedAt: { not: null } },
    });
    if (!list) {
      throw new NotFoundException(`Deleted ToDoList with ID ${id} not found`);
    }

    const result = await (this.prisma.toDoList as any).update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
    this.logger.log(`List restored: listId=${id} userId=${ownerId}`);
    return result;
  }

  async permanentDelete(id: string, ownerId: string) {
    const list = await (this.prisma.toDoList as any).findFirst({
      where: { id, ownerId, deletedAt: { not: null } },
    });
    if (!list) {
      throw new NotFoundException(`Deleted ToDoList with ID ${id} not found`);
    }

    // Manual cleanup of relations if not cascading
    await (this.prisma.step as any).deleteMany({ where: { task: { todoListId: id } } });
    await (this.prisma.task as any).deleteMany({ where: { todoListId: id } });
    await (this.prisma.listShare as any).deleteMany({ where: { toDoListId: id } });

    const result = await (this.prisma.toDoList as any).delete({
      where: { id },
    });
    this.logger.log(`List permanently deleted: listId=${id} userId=${ownerId}`);
    return result;
  }
}
