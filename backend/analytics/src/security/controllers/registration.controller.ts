import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../../shared/services/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Controller('auth/register')
export class RegistrationController {
  private readonly logger = new Logger(RegistrationController.name);
  private readonly verificationTokens = new Map<string, { token: string; expiresAt: Date }>();

  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
  ) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new HttpException('Email already registered', HttpStatus.CONFLICT);
      }

      // Validate password
      const { valid, errors } = await this.authService.validatePasswordPolicy(password);
      if (!valid) {
        throw new HttpException(
          `Invalid password: ${errors.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Hash password
      const hashedPassword = await this.authService.hashPassword(password);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user with unverified status
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          isVerified: false,
        },
      });

      // Store verification token
      this.verificationTokens.set(user.id, { token: verificationToken, expiresAt });

      // Send verification email
      await this.emailService.sendVerificationEmail(email, verificationToken);

      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user.id,
      };
    } catch (error) {
      this.logger.error('Registration failed:', error);
      throw error;
    }
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    try {
      // Find user with matching verification token
      let userId: string | undefined;
      let foundToken: { token: string; expiresAt: Date } | undefined;

      for (const [id, data] of this.verificationTokens.entries()) {
        if (data.token === token) {
          userId = id;
          foundToken = data;
          break;
        }
      }

      if (!userId || !foundToken) {
        throw new HttpException('Invalid verification token', HttpStatus.BAD_REQUEST);
      }

      if (foundToken.expiresAt < new Date()) {
        this.verificationTokens.delete(userId);
        throw new HttpException('Verification token expired', HttpStatus.BAD_REQUEST);
      }

      // Update user verification status
      await this.prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });

      // Remove used token
      this.verificationTokens.delete(userId);

      return {
        success: true,
        message: 'Email verified successfully. You can now log in.',
      };
    } catch (error) {
      this.logger.error('Email verification failed:', error);
      throw error;
    }
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Return success even if user not found to prevent email enumeration
        return {
          success: true,
          message: 'If an account exists with this email, a verification link has been sent.',
        };
      }

      if (user.isVerified) {
        throw new HttpException('Email already verified', HttpStatus.BAD_REQUEST);
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store new verification token
      this.verificationTokens.set(user.id, { token: verificationToken, expiresAt });

      // Send verification email
      await this.emailService.sendVerificationEmail(email, verificationToken);

      return {
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.',
      };
    } catch (error) {
      this.logger.error('Resend verification failed:', error);
      throw error;
    }
  }
} 