import { authClient } from '../utils/api-client';
import { TokenStorage } from '../utils/storage';
export class AuthService {
    /**
     * Login with email and password
     */
    async login(credentials) {
        const response = await authClient.post('/auth/login', credentials);
        TokenStorage.setToken(response.accessToken);
        return response;
    }
    /**
     * Refresh access token
     */
    async refresh() {
        const response = await authClient.post('/auth/refresh');
        TokenStorage.setToken(response.accessToken);
        return response;
    }
    /**
     * Logout (removes token from storage)
     */
    logout() {
        TokenStorage.removeToken();
    }
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return TokenStorage.hasToken();
    }
    /**
     * Get stored token
     */
    getToken() {
        return TokenStorage.getToken();
    }
    /**
     * Verify email with token
     */
    async verifyEmail(token) {
        // Encode token in path segment to handle special characters
        const encodedToken = encodeURIComponent(token);
        return authClient.post(`/auth/verify-email/${encodedToken}`);
    }
    /**
     * Resend verification email
     */
    async resendVerification(email) {
        return authClient.post('/auth/resend-verification', { email });
    }
    /**
     * Start registration (send OTP)
     */
    async registerStart(email, captchaToken) {
        return authClient.post('/auth/register/start', {
            email,
            captchaToken,
        });
    }
    /**
     * Verify OTP for registration
     */
    async registerVerify(email, otp) {
        return authClient.post('/auth/register/verify', {
            email,
            otp,
        });
    }
    /**
     * Complete registration with password
     */
    async registerFinish(data) {
        const response = await authClient.post('/auth/register/finish', data);
        TokenStorage.setToken(response.accessToken);
        return response;
    }
    /**
     * Request password reset OTP
     */
    async forgotPassword(email, captchaToken) {
        return authClient.post('/auth/forgot-password', {
            email,
            captchaToken,
        });
    }
    /**
     * Verify reset OTP
     */
    async verifyResetOtp(email, otp) {
        return authClient.post('/auth/reset-password/verify', {
            email,
            otp,
        });
    }
    /**
     * Finish password reset
     */
    async resetPassword(data) {
        return authClient.post('/auth/reset-password/finish', data);
    }
    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        return authClient.get('/users/me');
    }
    /**
     * Check if user is authenticated (can be used for SSO validation)
     */
    async validateSession() {
        try {
            await this.getCurrentUser();
            return true;
        }
        catch {
            return false;
        }
    }
}
export const authService = new AuthService();
