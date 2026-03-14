import { LoginDto, LoginResponse, User } from '../types';
export declare class AuthService {
    /**
     * Login with email and password
     */
    login(credentials: LoginDto): Promise<LoginResponse>;
    /**
     * Refresh access token
     */
    refresh(): Promise<LoginResponse>;
    /**
     * Logout (removes token from storage)
     */
    logout(): void;
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Get stored token
     */
    getToken(): string | null;
    /**
     * Verify email with token
     */
    verifyEmail(token: string): Promise<User>;
    /**
     * Resend verification email
     */
    resendVerification(email: string): Promise<User>;
    /**
     * Start registration (send OTP)
     */
    registerStart(email: string, captchaToken?: string): Promise<{
        message: string;
    }>;
    /**
     * Verify OTP for registration
     */
    registerVerify(email: string, otp: string): Promise<{
        registrationToken: string;
    }>;
    /**
     * Complete registration with password
     */
    registerFinish(data: {
        registrationToken: string;
        password: string;
        passwordConfirm: string;
    }): Promise<LoginResponse>;
    /**
     * Request password reset OTP
     */
    forgotPassword(email: string, captchaToken?: string): Promise<{
        message: string;
    }>;
    /**
     * Verify reset OTP
     */
    verifyResetOtp(email: string, otp: string): Promise<{
        resetToken: string;
    }>;
    /**
     * Finish password reset
     */
    resetPassword(data: {
        email: string;
        token: string;
        password: string;
        passwordConfirm: string;
    }): Promise<{
        message: string;
    }>;
    /**
     * Get current authenticated user
     */
    getCurrentUser(): Promise<User>;
    /**
     * Check if user is authenticated (can be used for SSO validation)
     */
    validateSession(): Promise<boolean>;
}
export declare const authService: AuthService;
