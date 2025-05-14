export const environment = {
  production: false,
  databaseUrl:
    process.env['DATABASE_URL'] ||
    'postgresql://postgres:postgres@localhost:5432/todoapp?schema=public',
  jwtSecret: process.env['JWT_SECRET'] || 'super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '1d',
  port: parseInt(process.env['PORT'] || '3000', 10),
  apiPrefix: process.env['API_PREFIX'] || '/api',
};
