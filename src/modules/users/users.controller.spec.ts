/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from '../../common/entities/user.entity';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    locations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            getAllUsers: jest.fn(),
            findUserByUsername: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(
      UsersService,
    ) as jest.Mocked<UsersService>;
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('createUser', () => {
    it('should register a new user and return a success message', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
      };
      usersService.createUser.mockResolvedValue(mockUser);

      const result = await usersController.createUser(createUserDto);

      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        message: 'User registered successfully',
        user: mockUser,
      });
    });

    it('should throw a BAD_REQUEST error if user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
      };
      usersService.createUser.mockRejectedValue(
        new Error('User creation failed'),
      );

      await expect(usersController.createUser(createUserDto)).rejects.toThrow(
        new HttpException('User creation failed', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('getAllUsers', () => {
    it('should retrieve all users and return a success message', async () => {
      const users = [mockUser, { ...mockUser, id: 2, username: 'anotheruser' }];
      usersService.getAllUsers.mockResolvedValue(users);

      const result = await usersController.getAllUsers();

      expect(usersService.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Users retrieved successfully',
        users,
      });
    });

    it('should throw an INTERNAL_SERVER_ERROR if retrieving users fails', async () => {
      usersService.getAllUsers.mockRejectedValue(new Error('Database error'));

      await expect(usersController.getAllUsers()).rejects.toThrow(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('getUserByUsername', () => {
    it('should retrieve a user by username and return a success message', async () => {
      const username = 'testuser';
      usersService.findUserByUsername.mockResolvedValue(mockUser);

      const result = await usersController.getUserByUsername(username);

      expect(usersService.findUserByUsername).toHaveBeenCalledWith(username);
      expect(result).toEqual({
        message: 'User retrieved successfully',
        user: mockUser,
      });
    });

    it('should throw a NOT_FOUND error if user is not found', async () => {
      const username = 'nonexistent';
      usersService.findUserByUsername.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(usersController.getUserByUsername(username)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
