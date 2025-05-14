import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

// Mock the LoginUserDto
jest.mock('../users/dto', () => ({
  LoginUserDto: class LoginUserDto {
    email: string = '';
    password: string = '';
  },
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with the correct parameters', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const result = {
        access_token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          theme: 'light',
          defaultSort: 'priority',
        },
      };

      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(loginDto)).toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with user id and session id', async () => {
      const req = {
        user: {
          sub: 'user-id',
          sessionId: 'session-id',
        },
      };

      mockAuthService.logout.mockResolvedValue({ id: 'session-id', isRevoked: true });

      await controller.logout(req as any);
      expect(mockAuthService.logout).toHaveBeenCalledWith('user-id', 'session-id');
    });
  });

  describe('getProfile', () => {
    it('should return the user object from the request', () => {
      const user = {
        sub: 'user-id',
        email: 'test@example.com',
      };

      const req = { user };

      expect(controller.getProfile(req as any)).toEqual(user);
    });
  });
});
