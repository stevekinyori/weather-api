/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from '../../modules/auth/auth.service';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: jest.Mocked<AuthService>;

  const mockUser: AuthenticatedUser = {
    id: 1,
    username: 'testuser',
  };

  const mockToken = 'mockJwtToken';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            generateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    it('should return a token and user when login is successful', async () => {
      authService.validateUser.mockResolvedValue(mockUser);
      authService.generateToken.mockReturnValue(mockToken);

      const result = await resolver.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(authService.validateUser).toHaveBeenCalledWith(
        'testuser',
        'password123',
      );
      expect(authService.generateToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ token: mockToken, user: mockUser });
    });

    it('should throw an error if user validation fails', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(
        resolver.login({ username: 'invaliduser', password: 'wrongpassword' }),
      ).rejects.toThrow('Invalid credentials');

      expect(authService.validateUser).toHaveBeenCalledWith(
        'invaliduser',
        'wrongpassword',
      );
      expect(authService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw an error if token generation fails', async () => {
      authService.validateUser.mockResolvedValue(mockUser);
      authService.generateToken.mockReturnValue(undefined);

      await expect(
        resolver.login({ username: 'testuser', password: 'password123' }),
      ).rejects.toThrow('Invalid credentials');

      expect(authService.validateUser).toHaveBeenCalledWith(
        'testuser',
        'password123',
      );
      expect(authService.generateToken).toHaveBeenCalledWith(mockUser);
    });
  });
});
