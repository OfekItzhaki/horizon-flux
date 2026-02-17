import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    async sendVerificationEmail(email: string, otp: string, name?: string) {
        this.logger.log(`[EmailService] Sending verification OTP ${otp} to ${email}`);
        // Implement actual sending logic here (e.g., using Resend or nodemailer)
    }

    async sendPasswordResetEmail(email: string, otp: string, name?: string) {
        this.logger.log(`[EmailService] Sending password reset OTP ${otp} to ${email}`);
        // Implement actual sending logic here
    }
}
