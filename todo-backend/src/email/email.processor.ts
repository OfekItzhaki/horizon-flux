import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
<<<<<<< HEAD
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
=======
import { Inject, Logger } from '@nestjs/common';
import { Resend } from 'resend';
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

<<<<<<< HEAD
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<unknown, unknown, string>): Promise<unknown> {
=======
  constructor(@Inject('RESEND_CLIENT') private readonly resend: Resend | null) {
    super();
    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY not configured - email sending will be disabled',
      );
    }
  }

  async process(job: Job<unknown, unknown, string>): Promise<unknown> {
    if (!this.resend) {
      this.logger.warn(
        `Skipping email job "${job.name}" - Resend not configured`,
      );
      return;
    }

>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
    switch (job.name) {
      case 'sendVerificationEmail':
        return this.handleSendVerificationEmail(
          job.data as { email: string; otp: string; name?: string },
        );
      case 'sendReminderEmail':
        return this.handleSendReminderEmail(
          job.data as {
            email: string;
            taskDescription: string;
            message: string;
            title: string;
          },
        );
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleSendReminderEmail(data: {
    email: string;
    taskDescription: string;
    message: string;
    title: string;
  }) {
    const { email, taskDescription, message, title } = data;
    this.logger.log(`Processing reminder email for: ${email}`);

<<<<<<< HEAD
    try {
      await this.mailerService.sendMail({
=======
    if (!this.resend) {
      this.logger.warn('Resend client not configured, skipping email');
      return;
    }

    try {
      const { data: result, error } = await this.resend.emails.send({
        from: 'Horizon Flux <noreply@ofeklabs.dev>',
        replyTo: 'horizon-flux@ofeklabs.dev',
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
        to: email,
        subject: title,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
<<<<<<< HEAD
            <h1 style="color: #4f46e5;">Horizon Tasks</h1>
            <h2 style="color: #333;">Task Reminder</h2>
            <p><strong>Task:</strong> ${taskDescription}</p>
            <p>${message}</p>
=======
            <h1 style="color: #4f46e5;">Horizon Flux</h1>
            <h2 style="color: #333;">Task Reminder</h2>
            <p><strong>Task:</strong> ${taskDescription}</p>
            <p>${message}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">This is an automated reminder. For support, contact <a href="mailto:horizon-flux@ofeklabs.dev" style="color: #4f46e5;">horizon-flux@ofeklabs.dev</a></p>
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
          </div>
        </body>
        </html>
      `,
        text: `
        Task Reminder: ${taskDescription}
        
        ${message}
      `,
      });
<<<<<<< HEAD
      this.logger.log(`Successfully sent reminder email to: ${email}`);
=======

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(
        `Successfully sent reminder email to: ${email}, ID: ${result?.id}`,
      );
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
    } catch (error: unknown) {
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send reminder email to ${email}:`, stack);
      throw error;
    }
  }

  private async handleSendVerificationEmail(data: {
    email: string;
    otp: string;
    name?: string;
  }) {
    const { email, otp, name } = data;
    this.logger.log(`Processing verification email for: ${email}`);

<<<<<<< HEAD
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Horizon Tasks',
=======
    if (!this.resend) {
      this.logger.warn('Resend client not configured, skipping email');
      return;
    }

    try {
      const { data: result, error } = await this.resend.emails.send({
        from: 'Horizon Flux <noreply@ofeklabs.dev>',
        replyTo: 'horizon-flux@ofeklabs.dev>',
        to: email,
        subject: 'Welcome to Horizon Flux',
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
<<<<<<< HEAD
            <h1 style="color: #4f46e5;">Horizon Tasks</h1>
=======
            <h1 style="color: #4f46e5;">Horizon Flux</h1>
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
            <h2 style="color: #333;">Verify your email address</h2>
            ${name ? `<p>Hello ${name},</p>` : '<p>Hello,</p>'}
            <p>Thank you for signing up! Please verify your email address by entering the 6-digit code below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #4f46e5; color: white; padding: 12px 24px; font-size: 24px; font-weight: bold; border-radius: 5px; display: inline-block; letter-spacing: 5px;">${otp}</div>
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
<<<<<<< HEAD
=======
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">This is an automated message. For support, contact <a href="mailto:horizon-flux@ofeklabs.dev" style="color: #4f46e5;">horizon-flux@ofeklabs.dev</a></p>
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
          </div>
        </body>
        </html>
      `,
        text: `
        Verify your email address
        
        Hello${name ? ` ${name}` : ''},
        
        Thank you for signing up! Please verify your email address by using this 6-digit code:
        ${otp}
        
        This code will expire in 5 minutes.
        
        If you didn't create an account, you can safely ignore this email.
      `,
      });
<<<<<<< HEAD
      this.logger.log(`Successfully sent verification email to: ${email}`);
=======

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(
        `Successfully sent verification email to: ${email}, ID: ${result?.id}`,
      );
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
    } catch (error: unknown) {
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send email to ${email}:`, stack);
      throw error; // BullMQ will retry based on config
    }
  }
}
