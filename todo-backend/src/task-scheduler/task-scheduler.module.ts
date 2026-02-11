import { Module } from '@nestjs/common';
import { TaskSchedulerService } from './task-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
<<<<<<< HEAD
import { BullModule } from '@nestjs/bullmq';
=======
import { BullModule, getQueueToken } from '@nestjs/bullmq';
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b

@Module({
  imports: [
    PrismaModule,
<<<<<<< HEAD
    BullModule.registerQueue({
      name: 'reminders',
    }),
  ],
  providers: [TaskSchedulerService],
=======
    ...(process.env.REDIS_HOST
      ? [
          BullModule.registerQueue({
            name: 'reminders',
          }),
        ]
      : []),
  ],
  providers: [
    TaskSchedulerService,
    ...(process.env.REDIS_HOST
      ? []
      : [
          {
            provide: getQueueToken('reminders'),
            useValue: {
              add: async () => {},
              process: async () => {},
            },
          },
        ]),
  ],
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
  exports: [TaskSchedulerService],
})
export class TaskSchedulerModule {}
