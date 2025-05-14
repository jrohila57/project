# Angular Web Application

This is the frontend web application built with Angular 19.

## Project Structure

- `src/app/` - Main application code
  - `auth/` - Authentication components (login, register)
  - `dashboard/` - Dashboard view 
  - `header/` - App header component
  - `projects/` - Project management features
  - `shared/` - Shared services, guards, and utilities
  - `todos/` - Todo management features
  - `users/` - User profile and settings

## Development

To start the development server:

```bash
# From the root of the monorepo
pnpm run dev:web

# Or to start both frontend and backend
pnpm run dev:all
```

## Architecture

This application uses:

- Angular 19 with standalone components
- Angular Material for UI components
- Angular Router for navigation
- Reactive forms for user input

## Styling

The application uses:
- Angular Material components with the indigo-pink theme
- CSS utility classes for common styling needs
- Component-scoped CSS for component-specific styling 