import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../../common/entities/user.entity';
import { bcryptValidate } from '../../common/utils/helpers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      let salt: string;
      try {
        salt = await bcrypt.genSalt();
      } catch (error: unknown) {
        throw new Error(
          `Failed to generate salt: ${
            error instanceof Error ? error.message : 'Unknown error occurred'
          }`,
        );
      }
      let hashedPassword: string;
      try {
        hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      } catch (error: unknown) {
        throw new Error(
          `Failed to hash password: ${
            error instanceof Error ? error.message : 'Unknown error occurred'
          }`,
        );
      }

      const user: User = this.userRepository.create({
        username: createUserDto.username,
        password: hashedPassword,
      });

      const userRes = await this.userRepository.save(user);
      return sanitizeUser(userRes);
    } catch (error: unknown) {
      throw new Error(
        `Failed to create user: ${
          error instanceof Error ? error.message : 'Unknown error occurred'
        }`,
      );
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    return (await this.userRepository.find()).map((user) => sanitizeUser(user));
  }

  /**
   * Find a user by username
   */
  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return sanitizeUser(user);
  }

  /**
   * Validate user credentials
   */
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.findUserByUsername(username);
    const isPasswordValid = await bcryptValidate(password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    return user;
  }
}
const sanitizeUser = (user: User) => {
  user.password = '😊';
  return user;
};
