export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export const API_ENDPOINTS = {
  USERS: '/users',
  AUTH: '/auth',
  PROFILE: '/profile',
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
} as const;
