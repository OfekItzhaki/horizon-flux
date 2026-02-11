import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { TasksModule } from '../tasks/tasks.module';
<<<<<<< HEAD
import { BullModule } from '@nestjs/bullmq';
=======
import { BullModule, getQueueToken } from '@nestjs/bullmq';
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
import { RemindersProcessor } from './reminders.processor';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    TasksModule,
    EmailModule,
    PrismaModule,
<<<<<<< HEAD
    BullModule.registerQueue({
      name: 'reminders',
    }),
  ],
  controllers: [RemindersController],
  providers: [RemindersService, RemindersProcessor],
=======
    ...(process.env.REDIS_HOST
      ? [
          BullModule.registerQueue({
            name: 'reminders',
          }),
        ]
      : []),
  ],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    RemindersProcessor,
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
  exports: [RemindersService],
})
export class RemindersModule {}
