# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Run migrations (production)
npx prisma migrate dev --name <migration_name>

# Start local Supabase instance
npx supabase start

# Check Supabase status
npx supabase status
```

## Architecture Overview

This is a **Next.js 15 application with Clerk authentication** and **Prisma ORM**. The project follows a **protected-by-default** approach where all routes require authentication unless explicitly made public.

### Key Components:
- **Authentication**: Clerk middleware (`src/middleware.ts`) protects all routes except those in the `isPublicRoute` matcher
- **Database**: Prisma ORM with PostgreSQL, custom client generated to `src/generated/prisma/`
- **UI**: Shadcn UI components with Tailwind CSS and theme switching support
- **Layout**: Sidebar navigation with responsive design

### Authentication Flow:
- All routes are protected by default via Clerk middleware
- Public routes must be explicitly added to the `isPublicRoute` matcher in `src/middleware.ts`
- API routes in `src/app/api/` check `userId` from `auth()` for authorization

### Database Schema:
- Located in `prisma/schema.prisma`
- Generated client outputs to `src/generated/prisma/` (not the default location)
- Uses PostgreSQL via Supabase (local or cloud)

### Environment Setup:
Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`

### Project Structure:
- `src/app/`: Next.js app router pages and API routes
- `src/components/`: Reusable UI components
- `src/lib/`: Utility functions and configurations
- `src/generated/prisma/`: Generated Prisma client
- `prisma/`: Database schema and migrations