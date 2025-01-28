/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../common/entities/user.entity';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

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
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
      };

      const salt = 'randomSalt';
      const hashedPassword = 'hashedPassword';

      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue(salt as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      userRepository.create.mockReturnValue({
        ...mockUser,
        password: hashedPassword,
      } as User);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      } as User);

      const result = await usersService.createUser(createUserDto);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, salt);
      expect(userRepository.create).toHaveBeenCalledWith({
        username: createUserDto.username,
        password: hashedPassword,
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        id: 1,
        username: createUserDto.username,
        password: hashedPassword,
        locations: [],
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      });
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        password: '😊',
        locations: [],
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      });
    });

    it('should throw an error if hashing fails', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
      };

      jest
        .spyOn(bcrypt, 'genSalt')
        .mockRejectedValue(new Error('Salt error') as never);

      await expect(usersService.createUser(createUserDto)).rejects.toThrow(
        'Salt error',
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with sanitized passwords', async () => {
      const users = [
        { ...mockUser, password: 'hashedpassword' },
        {
          ...mockUser,
          id: 2,
          username: 'anotheruser',
          password: 'anotherhashedpassword',
        },
      ];

      userRepository.find.mockResolvedValue(users);

      const result = await usersService.getAllUsers();

      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual([
        { ...mockUser, password: '😊' },
        { ...mockUser, id: 2, username: 'anotheruser', password: '😊' },
      ]);
    });
  });

  describe('findUserByUsername', () => {
    it('should return the user if found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersService.findUserByUsername('testuser');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toEqual({ ...mockUser, password: '😊' });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        usersService.findUserByUsername('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateUser', () => {
    it('should validate and return the user if credentials are correct', async () => {
      const password = 'password123';
      userRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never); 

      const result = await usersService.validateUser(
        mockUser.username,
        password,
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: mockUser.username },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toEqual(mockUser);
    });

    it('should throw a NotFoundException if password is invalid', async () => {
      const password = 'wrongpassword';
      userRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never); 

      await expect(
        usersService.validateUser(mockUser.username, password),
      ).rejects.toThrow(NotFoundException);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: mockUser.username },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null); 

      await expect(
        usersService.validateUser('nonexistent', 'password123'),
      ).rejects.toThrow(NotFoundException);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
      });
    });
  });
});
