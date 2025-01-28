/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    locations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthenticatedUser: AuthenticatedUser = {
    id: 1,
    username: 'testuser',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(
      UsersService,
    ) as jest.Mocked<UsersService>;
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return an authenticated user if credentials are valid', async () => {
      usersService.validateUser.mockResolvedValue(mockUser);

      const result = await authService.validateUser('testuser', 'password123');

      expect(usersService.validateUser).toHaveBeenCalledWith(
        'testuser',
        'password123',
      );
      expect(result).toEqual(mockAuthenticatedUser);
    });

    it('should throw a NotFoundException if user validation fails', async () => {
      const mockUser = { username: 'testuser', password: 'hashedpassword' };

      jest
        .spyOn(usersService, 'validateUser')
        .mockRejectedValue(new NotFoundException('Invalid credentials'));

      await expect(
        authService.validateUser(mockUser.username, 'wrongpassword'),
      ).rejects.toThrow(NotFoundException);

      expect(usersService.validateUser).toHaveBeenCalledWith(
        mockUser.username,
        'wrongpassword',
      );
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token for the authenticated user', () => {
      const mockToken = 'mockJwtToken';
      jwtService.sign.mockReturnValue(mockToken);

      const result = authService.generateToken(mockAuthenticatedUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockAuthenticatedUser.username,
        sub: mockAuthenticatedUser.id,
      });
      expect(result).toEqual(mockToken);
    });

    it('should return undefined if user is null', () => {
      const mockAuthenticatedUser = null as unknown as AuthenticatedUser;

      const result = authService.generateToken(mockAuthenticatedUser);

      expect(result).toBeUndefined();
    });
  });
});
