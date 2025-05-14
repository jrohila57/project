export * from './api-response.interface';
export * from './user.interface';
export * from './todo.interface';
export * from './project.interface';

export enum TodoStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export enum TodoPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum UserTheme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum UserSort {
  PRIORITY = 'priority',
  DUE_DATE = 'dueDate',
  CREATED_AT = 'createdAt',
  TITLE = 'title',
}

export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  theme: UserTheme;
  defaultSort: UserSort;
  showCompletedTodos: boolean;
  notificationsEnabled: boolean;
  lastLoginAt?: Date;
  accountStatus: 'ACTIVE' | 'DELETED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: Date;
  completedAt?: Date;
  isPinned: boolean;
  tags: string[];
  projectId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isArchived: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
