import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from '../../modules/auth/auth.service';
import { AuthPayloadType, LoginInput } from '../types';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './GqlAuthGuard';

@Resolver(() => AuthPayloadType)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayloadType, {
    description: 'Login and generate a token',
  })
  @UseGuards(GqlAuthGuard)
  async login(@Args('input') input: LoginInput) {
    const user = await this.authService.validateUser(
      input.username,
      input.password,
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const token = this.authService.generateToken(user);
    if (!token) {
      throw new Error('Invalid credentials');
    }
    return { token, user };
  }
}
