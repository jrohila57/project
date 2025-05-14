import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

// Define local enums if needed
export enum TodoStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ARCHIVED = 'ARCHIVED',
}

export enum TodoPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTodoDto {
  @ApiProperty({
    example: 'Complete the project',
    description: 'The title of the todo',
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string = '';

  @ApiPropertyOptional({
    example: 'This is a detailed description of the task',
    description: 'The description of the todo',
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the project this todo belongs to',
  })
  @IsUUID(undefined, { message: 'Project ID must be a valid UUID' })
  @IsOptional()
  projectId?: string;

  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus = TodoStatus.TODO;

  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority = TodoPriority.MEDIUM;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];
}
