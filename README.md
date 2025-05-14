# Angular NestJS Monorepo

A modern full-stack application using Angular and NestJS in a Turborepo monorepo structure.

## Features

- **Frontend**: Angular 19 with Angular Material
- **Backend**: NestJS 10 with Prisma ORM
- **Package Management**: PNPM Workspaces
- **Build System**: Turborepo for efficient builds and caching
- **Database**: PostgreSQL with Prisma migrations
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker and Docker Compose support
- **CI/CD**: GitHub Actions workflow
- **Testing**: Jest for unit and integration tests

## Prerequisites

- Node.js (v20+)
- PNPM (v10.7.1+)
- Docker and Docker Compose (for containerized development)
- PostgreSQL (if running locally without Docker)

## Project Structure

```
project/
├── apps/                   # Applications
│   ├── api/                # NestJS backend
│   └── web/                # Angular frontend
├── packages/               # Shared packages
│   ├── eslint-config/      # ESLint configuration
│   ├── shared/             # Shared code between apps
│   └── tsconfig/           # TypeScript configuration
├── docker-compose.yml      # Docker Compose configuration
└── package.json            # Root package.json
```

## Getting Started

### Local Development

1. Install dependencies:

   ```
   pnpm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todoapp?schema=public
   JWT_SECRET=your-secret-key
   ```

3. Start the development servers:

   ```
   pnpm dev
   ```

4. The applications will be available at:
   - API: http://localhost:3000/api
   - API Documentation: http://localhost:3000/docs
   - Web: http://localhost:4200

### Using Docker

1. Start the development environment:

   ```
   docker-compose up
   ```

2. The applications will be available at:
   - API: http://localhost:3000/api
   - Web: http://localhost:4200

## Building for Production

```
pnpm build
```

## Running Tests

```
pnpm test
```

## API Documentation

The API documentation is available at http://localhost:3000/docs when the API server is running.

## CI/CD Pipeline

This project includes a GitHub Actions workflow for continuous integration and delivery. The workflow:

1. Builds and tests the applications
2. Runs linting checks
3. Runs database migrations
4. Builds Docker images (when merged to main)

## License

MIT
