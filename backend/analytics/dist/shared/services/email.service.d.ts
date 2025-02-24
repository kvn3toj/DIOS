import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private readonly transporter;
    private readonly frontendUrl;
    constructor(configService: ConfigService);
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendWelcomeEmail(email: string, data: {
        name: string;
        firstStep: {
            title: string;
            description: string;
        };
    }): Promise<void>;
    sendOnboardingCompletionEmail(email: string, data: {
        name: string;
    }): Promise<void>;
}
