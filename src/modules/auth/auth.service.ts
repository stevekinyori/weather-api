import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(
    username: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    console.log(username, password);
    const user = await this.usersService.validateUser(username, password);
    if (user) {
      return { id: user.id, username: user.username };
    }
    return null;
  }

  /**
   * Generate a JWT token for the authenticated user
   */
  generateToken(user: AuthenticatedUser | null): string | undefined {
    if (!user) {
      return undefined;
    }
    const payload = { username: user.username, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
