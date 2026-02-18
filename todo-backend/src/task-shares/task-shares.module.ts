import { Module } from '@nestjs/common';
import { TaskSharesService } from './task-shares.service';
import { TaskSharesController } from './task-shares.controller';
import { EventsModule } from '../events/events.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [EventsModule, TasksModule],
  controllers: [TaskSharesController],
  providers: [TaskSharesService],
  exports: [TaskSharesService],
})
export class TaskSharesModule { }
