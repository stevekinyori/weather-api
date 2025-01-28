import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login endpoint
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: { user: AuthenticatedUser }) {
    const token = this.authService.generateToken(req.user);
    if (!token) {
      throw new UnauthorizedException('Failed to generate token');
    }
    return { message: 'Login successful', token, user: req.user };
  }

  /**
   * Get the authenticated user's profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: AuthenticatedUser }) {
    if (!req.user) {
      throw new UnauthorizedException('No authenticated user found');
    }
    return { message: 'Profile retrieved successfully', user: req.user };
  }
}
