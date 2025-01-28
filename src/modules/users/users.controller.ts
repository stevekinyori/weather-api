import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import { getErrorMessage } from '../../common/utils/helpers';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Register a new user
   */
  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.createUser(createUserDto);
      return { message: 'User registered successfully', user };
    } catch (error) {
      throw new HttpException(getErrorMessage(error), HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get all users
   */
  @Get()
  async getAllUsers() {
    try {
      const users = await this.usersService.getAllUsers();
      return { message: 'Users retrieved successfully', users };
    } catch (error) {
      throw new HttpException(
        getErrorMessage(error),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific user by username
   */
  @Get(':username')
  async getUserByUsername(@Param('username') username: string) {
    try {
      const user = await this.usersService.findUserByUsername(username);
      return { message: 'User retrieved successfully', user };
    } catch (error) {
      throw new HttpException(getErrorMessage(error), HttpStatus.NOT_FOUND);
    }
  }
}
