import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/current-user.decorator';
import { TodoListsService } from '../todo-lists/todo-lists.service';
import { TasksService } from '../tasks/tasks.service';

@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(
    private readonly todoListsService: TodoListsService,
    private readonly tasksService: TasksService,
  ) {}

  @Get('lists')
  getMyLists(@CurrentUser() user: CurrentUserPayload) {
    return this.todoListsService.findAll(user.userId);
  }

  @Get('tasks')
  getMyTasks(
    @CurrentUser() user: CurrentUserPayload,
    @Query('todoListId') todoListId?: string,
  ) {
    const listId = todoListId ? parseInt(todoListId, 10) : undefined;
    return this.tasksService.findAll(user.userId, listId);
  }
}

