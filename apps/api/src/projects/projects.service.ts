import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectsService implements OnModuleInit {
  private demoUserId: string | null = null;

  constructor(private prisma: PrismaService) {}

  // Add some initial data when the module is initialized
  async onModuleInit() {
    // Check if there are any projects
    const projectCount = await this.prisma.project.count();

    if (projectCount === 0) {
      // Check if default user exists, if not create one
      let user = await this.prisma.user.findUnique({
        where: { email: 'demo@example.com' },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: 'demo@example.com',
            passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // password: secret42
            name: 'Demo User',
            isEmailVerified: true,
          },
        });
      }

      this.demoUserId = user.id;

      // Create sample projects
      await this.prisma.project.create({
        data: {
          name: 'Personal Tasks',
          description: 'My personal task list',
          color: '#1976d2',
          userId: user.id,
        },
      });

      await this.prisma.project.create({
        data: {
          name: 'Work Projects',
          description: 'Professional tasks and deadlines',
          color: '#388e3c',
          userId: user.id,
        },
      });
    } else {
      // Get the demo user ID for mock usage
      const user = await this.prisma.user.findUnique({
        where: { email: 'demo@example.com' },
      });

      if (user) {
        this.demoUserId = user.id;
      }
    }
  }

  // This method is used in the controller to get the demo user ID
  async getDemoUserId(): Promise<string> {
    if (!this.demoUserId) {
      const user = await this.prisma.user.findUnique({
        where: { email: 'demo@example.com' },
      });

      if (user) {
        this.demoUserId = user.id;
      } else {
        const newUser = await this.prisma.user.create({
          data: {
            email: 'demo@example.com',
            passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // password: secret42
            name: 'Demo User',
            isEmailVerified: true,
          },
        });
        this.demoUserId = newUser.id;
      }
    }

    return this.demoUserId;
  }

  async create(createProjectDto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId, isArchived: false },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { todos: true },
        },
        todos: {
          select: {
            id: true,
            status: true,
          },
          where: {
            status: 'DONE',
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        _count: {
          select: { todos: true },
        },
        todos: {
          select: {
            id: true,
            status: true,
          },
          where: {
            status: 'DONE',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    return {
      ...project,
      totalTodos: project._count.todos,
      completedTodos: project.todos.length,
      todos: undefined,
      _count: undefined,
    };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }
}
