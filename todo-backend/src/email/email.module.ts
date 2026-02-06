import { Module } from '@nestjs/common';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    ...(process.env.NODE_ENV === 'test'
      ? []
      : [
        MailerModule.forRoot({
          transport: {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
          defaults: {
            from: `"Tasks Management" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@tasksmanagement.com'}>`,
          },
        }),
      ]),
  ],
  providers: [
    EmailService,
    ...(process.env.NODE_ENV === 'test'
      ? [{ provide: MailerService, useValue: { sendMail: jest.fn().mockResolvedValue(true) } }]
      : []),
  ],
  exports: [EmailService],
})
export class EmailModule { }
