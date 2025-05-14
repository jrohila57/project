export const environment = {
  production: true,
  databaseUrl: process.env['DATABASE_URL'] as string,
  jwtSecret: process.env['JWT_SECRET'] as string,
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '1d',
  port: parseInt(process.env['PORT'] || '3000', 10),
  apiPrefix: process.env['API_PREFIX'] || '/api',
};
