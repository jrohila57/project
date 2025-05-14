import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if credentials are valid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        theme: 'light',
        defaultSort: 'priority',
        showCompletedTodos: true,
        notificationsEnabled: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        accountStatus: 'ACTIVE',
        bio: null,
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed_password');
    });

    it('should return null if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        theme: 'light',
        defaultSort: 'priority',
        showCompletedTodos: true,
        notificationsEnabled: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        accountStatus: 'ACTIVE',
        bio: null,
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', 'wrong_password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong_password' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update lastLoginAt and create session for valid credentials', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        theme: 'light',
        defaultSort: 'priority',
        showCompletedTodos: true,
        notificationsEnabled: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        accountStatus: 'ACTIVE',
        bio: null,
      };

      const session = {
        id: 'session-id',
        userId: '1',
        expiresAt: new Date(),
        createdAt: new Date(),
        isRevoked: false,
        ipAddress: null,
        userAgent: null,
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue({ ...user, lastLoginAt: new Date() });
      mockPrismaService.session.create.mockResolvedValue(session);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({ email: 'test@example.com', password: 'password' });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { lastLoginAt: expect.any(Date) },
      });

      expect(mockPrismaService.session.create).toHaveBeenCalledWith({
        data: {
          userId: '1',
          expiresAt: expect.any(Date),
        },
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@example.com',
        sessionId: 'session-id',
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          theme: 'light',
          defaultSort: 'priority',
        },
      });
    });
  });

  describe('logout', () => {
    it('should revoke the session', async () => {
      mockPrismaService.session.update.mockResolvedValue({
        id: 'session-id',
        isRevoked: true,
      });

      await service.logout('user-id', 'session-id');

      expect(mockPrismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-id' },
        data: { isRevoked: true },
      });
    });
  });
});
