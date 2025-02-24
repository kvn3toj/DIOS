import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SecurityPolicy } from '../entities/security-policy.entity';
export declare class SecurityService implements OnModuleInit {
    private securityPolicyRepository;
    constructor(securityPolicyRepository: Repository<SecurityPolicy>);
    onModuleInit(): Promise<void>;
    private createDefaultPolicy;
    validatePassword(password: string, policyId?: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    validateSession(sessionData: any, policyId?: string): Promise<boolean>;
    validateMfaSetup(mfaData: any, policyId?: string): Promise<boolean>;
    encryptSensitiveData(data: string, policyId?: string): Promise<{
        encrypted: string;
        iv: string;
    }>;
    decryptSensitiveData(encrypted: string, iv: string, policyId?: string): Promise<string>;
    private getActivePolicy;
    private getEncryptionKey;
}
