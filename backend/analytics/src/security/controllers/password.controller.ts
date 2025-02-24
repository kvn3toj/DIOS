import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../../shared/services/email.service';

@Controller('auth/password')
export class PasswordController {
  private readonly logger = new Logger(PasswordController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @Post('forgot')
  async forgotPassword(@Body('email') email: string) {
    try {
      const resetToken = await this.authService.generatePasswordResetToken(email);
      
      // Send reset email
      await this.emailService.sendPasswordResetEmail(email, resetToken);

      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      };
    } catch (error) {
      this.logger.error('Password reset request failed:', error);
      throw new HttpException(
        'Failed to process password reset request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reset')
  async resetPassword(
    @Body('userId') userId: string,
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    try {
      const success = await this.authService.resetPassword(userId, token, newPassword);

      if (success) {
        return {
          success: true,
          message: 'Password has been reset successfully.',
        };
      } else {
        throw new HttpException(
          'Invalid or expired reset token',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error('Password reset failed:', error);
      throw new HttpException(
        error.message || 'Failed to reset password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
} 