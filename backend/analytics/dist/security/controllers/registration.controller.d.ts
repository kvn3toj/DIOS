import { AuthService } from '../services/auth.service';
import { EmailService } from '../../shared/services/email.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class RegistrationController {
    private readonly authService;
    private readonly emailService;
    private readonly prisma;
    private readonly logger;
    private readonly verificationTokens;
    constructor(authService: AuthService, emailService: EmailService, prisma: PrismaService);
    register(email: string, password: string, name: string): Promise<{
        success: boolean;
        message: string;
        userId: any;
    }>;
    verifyEmail(token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resendVerification(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
