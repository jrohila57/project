export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  isEmailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastLoginAt?: string | Date;
  accountStatus: UserAccountStatus;

  // User settings
  theme: UserTheme;
  defaultSort: UserSort;
  showCompletedTodos: boolean;
  notificationsEnabled: boolean;
}

export enum UserTheme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum UserSort {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  EMAIL = 'email',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export type UserAccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
