import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
<<<<<<< HEAD
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
=======
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Resend } from 'resend';
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
<<<<<<< HEAD
    ...(process.env.NODE_ENV === 'test'
      ? []
      : [
          MailerModule.forRootAsync({
            useFactory: (config: ConfigService) => ({
              transport: {
                host: config.get('SMTP_HOST'),
                port: config.get('SMTP_PORT'),
                secure: config.get('SMTP_SECURE') === 'true',
                auth: {
                  user: config.get('SMTP_USER'),
                  pass: config.get('SMTP_PASSWORD'),
                },
              },
              defaults: {
                from: `"Tasks Management" <${config.get('SMTP_FROM') || config.get('SMTP_USER') || 'noreply@tasksmanagement.com'}>`,
              },
            }),
            inject: [ConfigService],
          }),
        ]),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [
    EmailService,
    EmailProcessor,
    ...(process.env.NODE_ENV === 'test'
      ? [
          {
            provide: MailerService,
            useValue: { sendMail: jest.fn().mockResolvedValue(true) },
          },
        ]
      : []),
  ],
=======
    ...(process.env.REDIS_HOST
      ? [
          BullModule.registerQueue({
            name: 'email',
          }),
        ]
      : []),
  ],
  providers: [
    EmailService,
    EmailProcessor,
    {
      provide: 'RESEND_CLIENT',
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('RESEND_API_KEY');
        return apiKey ? new Resend(apiKey) : null;
      },
      inject: [ConfigService],
    },
    ...(process.env.REDIS_HOST
      ? []
      : [
          {
            provide: getQueueToken('email'),
            useValue: {
              add: async () => {},
              process: async () => {},
            },
          },
        ]),
  ],
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
  exports: [EmailService],
})
export class EmailModule {}
