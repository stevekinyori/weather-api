/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from '../../modules/users/users.service';
import { User } from '../../common/entities/user.entity';
import { RegisterInput } from '../types';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    locations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers: User[] = [
    mockUser,
    {
      id: 2,
      username: 'anotheruser',
      password: 'anotherhashedpassword',
      locations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: {
            getAllUsers: jest.fn(),
            findUserByUsername: jest.fn(),
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    usersService = module.get<UsersService>(
      UsersService,
    ) as jest.Mocked<UsersService>;
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      usersService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await resolver.getUsers();

      expect(usersService.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUser', () => {
    it('should return a user by username', async () => {
      usersService.findUserByUsername.mockResolvedValue(mockUser);

      const result = await resolver.getUser('testuser');

      expect(usersService.findUserByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      usersService.findUserByUsername.mockRejectedValue(
        new Error('User not found'),
      );
      await expect(resolver.getUser('nonexistentuser')).rejects.toThrow(
        'User not found',
      );

      expect(usersService.findUserByUsername).toHaveBeenCalledWith(
        'nonexistentuser',
      );
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const input: RegisterInput = {
        username: 'testuser',
        password: 'password123',
      };

      usersService.createUser.mockResolvedValue(mockUser);

      const result = await resolver.register(input);

      expect(usersService.createUser).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user creation fails', async () => {
      const input: RegisterInput = {
        username: 'testuser',
        password: 'password123',
      };

      usersService.createUser.mockRejectedValue(
        new Error('Failed to create user'),
      );

      await expect(resolver.register(input)).rejects.toThrow(
        'Failed to create user',
      );

      expect(usersService.createUser).toHaveBeenCalledWith(input);
    });
  });
});
