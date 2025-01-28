/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from './passport/jwt-auth.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser: AuthenticatedUser = {
    id: 1,
    username: 'testuser',
  };

  const mockToken = 'mockJwtToken';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            generateToken: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('local'))
      .useValue({
        canActivate: jest
          .fn()
          .mockImplementation((context: ExecutionContext) => {
            const req = context
              .switchToHttp()
              .getRequest<{ user: AuthenticatedUser }>();
            req.user = mockUser;
            return true;
          }),
      })
      .overrideGuard(AuthGuard('local'))
      .useValue({
        canActivate: jest.fn((context: ExecutionContext) => {
          const req = context
            .switchToHttp()
            .getRequest<{ user: AuthenticatedUser }>();
          req.user = mockUser;
          return true;
        }),
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest
          .fn()
          .mockImplementation((context: ExecutionContext) => {
            const req = context
              .switchToHttp()
              .getRequest<{ user: AuthenticatedUser }>();
            req.user = mockUser;
            return true;
          }),
      })
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return a token and user data when login is successful', () => {
      authService.generateToken.mockReturnValue(mockToken);

      const req = { user: mockUser };
      const result = authController.login(req);

      expect(authService.generateToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        message: 'Login successful',
        token: mockToken,
        user: mockUser,
      });
    });
    it('should throw an UnauthorizedException if user is not authenticated', () => {
      authService.generateToken.mockReturnValue(undefined);

      const req = { user: mockUser } as { user: AuthenticatedUser };

      expect(() => authController.login(req)).toThrow(UnauthorizedException);

      expect(authService.generateToken).toHaveBeenCalledWith(mockUser);
    });

    describe('getProfile', () => {
      it('should return the authenticated user profile', () => {
        const req = { user: mockUser };
        const result = authController.getProfile(req);

        expect(result).toEqual({
          message: 'Profile retrieved successfully',
          user: mockUser,
        });
      });

      it('should throw an UnauthorizedException if no user is authenticated', () => {
        const req = { user: null } as unknown as { user: AuthenticatedUser };

        expect(() => authController.getProfile(req)).toThrow(
          UnauthorizedException,
        );
      });
    });
  });
});
