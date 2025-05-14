import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto, TodoStatus, UpdateTodoDto } from './dto';
import { Todo } from '@prisma/client';

// Interface for project where clause
interface ProjectWhere {
  userId: string;
  id?: string;
}

// Interface for todo where clause
interface TodoWhere {
  userId: string;
  isArchived: boolean;
  projectId?: string;
}

// Interface for todo create data
interface TodoCreateData {
  title: string;
  description?: string | undefined;
  userId: string;
  projectId?: string;
  isPinned?: boolean;
  tags?: string[];
  status?: TodoStatus;
  priority?: string;
  dueDate?: string;
}

// Interface for todo update data
interface TodoUpdateData {
  title?: string;
  description?: string | undefined;
  projectId?: string;
  isPinned?: boolean;
  tags?: string[];
  status?: TodoStatus;
  priority?: string;
  dueDate?: string;
  completedAt?: Date | null;
}

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTodoDto: CreateTodoDto): Promise<Todo> {
 
    // Get default project if not specified
    let projectId = createTodoDto.projectId;
    
    if (!projectId) {
      // Find or create a default project for the user
      const defaultProject = await this.prisma.project.findFirst({
        where: { 
          userId,
          name: 'Personal Tasks'
        },
      });
      
      if (defaultProject) {
        projectId = defaultProject.id;
      } else {
        // Create a default project if none exists
        const newProject = await this.prisma.project.create({
          data: {
            name: 'Personal Tasks',
            description: 'Default project for tasks',
            userId
          }
        });
        projectId = newProject.id;
      }
    } else {
      // Verify the project exists and belongs to the user
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          userId
        }
      });
      
      if (!project) {
        throw new NotFoundException(`Project id:${projectId} not found or does not belong to user id: ${userId}`);
      }
    }

    // Create the todo with the project ID
    return this.prisma.todo.create({
      data: {
        title: createTodoDto.title,
        description: createTodoDto.description || null,
        userId,
        projectId,
        isPinned: createTodoDto.isPinned || false,
        tags: createTodoDto.tags || [],
        status: createTodoDto.status || 'TODO',
        priority: createTodoDto.priority || 'MEDIUM',
        dueDate: createTodoDto.dueDate || null,
      }
    });
  }

  async findAll(userId: string, projectId?: string): Promise<Todo[]> {
    const where = {
      userId,
      isArchived: false,
    };

    if (projectId) {
      Object.assign(where, { projectId });
    }

    return this.prisma.todo.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { priority: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string): Promise<Todo> {
    const todo = await this.prisma.todo.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found or does not belong to user`);
    }

    return todo;
  }

  async update(userId: string, id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    // Check if todo exists and belongs to user
    const todo = await this.findOne(userId, id);

    // If updating projectId, check if the project exists and belongs to user
    if (updateTodoDto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: updateTodoDto.projectId,
          userId,
        },
      });

      if (!project) {
        throw new NotFoundException(`Project not found or does not belong to user`);
      }
    }

    // Handle specially processed fields
    let completedAt = undefined;
    
    // If status is being updated to DONE, set completedAt
    if (updateTodoDto.status === TodoStatus.DONE && todo.status !== TodoStatus.DONE) {
      completedAt = new Date();
    }

    // If status is being updated from DONE, clear completedAt
    if (updateTodoDto.status && updateTodoDto.status !== TodoStatus.DONE && todo.status === TodoStatus.DONE) {
      completedAt = null;
    }

    // Use a more direct approach for the update
    const updateData: Record<string, any> = {};
    
    if (updateTodoDto.title !== undefined) updateData.title = updateTodoDto.title;
    if (updateTodoDto.description !== undefined) updateData.description = updateTodoDto.description;
    if (updateTodoDto.isPinned !== undefined) updateData.isPinned = updateTodoDto.isPinned;
    if (updateTodoDto.tags !== undefined) updateData.tags = updateTodoDto.tags;
    if (updateTodoDto.status !== undefined) updateData.status = updateTodoDto.status;
    if (updateTodoDto.priority !== undefined) updateData.priority = updateTodoDto.priority;
    if (updateTodoDto.dueDate !== undefined) updateData.dueDate = updateTodoDto.dueDate;
    if (updateTodoDto.isArchived !== undefined) updateData.isArchived = updateTodoDto.isArchived; 
    if (completedAt !== undefined) updateData.completedAt = completedAt;
    
    return this.prisma.todo.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(userId: string, id: string): Promise<Todo> {
    // Check if todo exists and belongs to user
    await this.findOne(userId, id);

    // Soft delete by archiving
    return this.prisma.todo.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async hardRemove(userId: string, id: string): Promise<Todo> {
    // Check if todo exists and belongs to user
    await this.findOne(userId, id);

    // Hard delete
    return this.prisma.todo.delete({
      where: { id },
    });
  }
}
