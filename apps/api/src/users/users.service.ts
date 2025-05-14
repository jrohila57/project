import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        accountStatus: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name, bio } = createUserDto;

    // Check if user with email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        bio: bio === undefined ? null : bio,
        theme: 'light',
        defaultSort: 'priority',
        showCompletedTodos: true,
        notificationsEnabled: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.findOne(id);

    // Update user
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string): Promise<User> {
    // Check if user exists
    await this.findOne(id);

    // Soft delete user by updating accountStatus
    return this.prisma.user.update({
      where: { id },
      data: { accountStatus: 'DELETED' },
    });
  }
}
