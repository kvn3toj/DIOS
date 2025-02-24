import { AuthService } from '../services/auth.service';
import { EmailService } from '../../shared/services/email.service';
export declare class PasswordController {
    private readonly authService;
    private readonly emailService;
    private readonly logger;
    constructor(authService: AuthService, emailService: EmailService);
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(userId: string, token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
