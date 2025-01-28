import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from '../../modules/users/users.service';
import { UserType, RegisterInput } from '../types';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/GqlAuthGuard';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserType], { description: 'Get all users' })
  @UseGuards(GqlAuthGuard)
  async getUsers() {
    return this.usersService.getAllUsers();
  }

  @Query(() => UserType, { description: 'Get a user by username' })
  async getUser(@Args('username') username: string) {
    return this.usersService.findUserByUsername(username);
  }

  @Mutation(() => UserType, { description: 'Register a new user' })
  async register(@Args('input') input: RegisterInput) {
    return this.usersService.createUser(input);
  }
}
