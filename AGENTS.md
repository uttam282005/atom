# Atom Agent Instructions

Before and After working on any feature always check @problem_statement.md and satisfy it's requirements.

This document provides guidelines for AI agents operating in this repository. Following these instructions ensures consistency, quality, and efficiency.

## 1. Build, Lint, and Test Commands

### Full Workflow
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Test**: No dedicated test runner is configured yet. For now, rely on linting and type-checking.

### Development
- **Run Dev Server**: `npm run dev`
- **Run a Single Test**: Testing infrastructure is not yet set up. Once `jest` or a similar framework is configured, this section should be updated with commands like `npm test -- src/components/MyComponent.test.tsx`.

### Database
- **Generate Prisma Client**: `npx prisma generate` (Run after any change to `prisma/schema.prisma`)
- **Create Migrations**: `npx prisma migrate dev --name <migration_name>`
- **Reset Database**: `npx prisma migrate reset` (Use with caution, as this erases all data)

## 2. Code Style and Conventions

### Imports
- **Order**: Maintain a consistent import order:
  1. React/Next.js built-ins (`import React from "react"`)
  2. External libraries (`import { useForm } from "react-hook-form"`)
  3. Internal components and modules using absolute paths (`import { Button } from "@/components/ui/button"`)
  4. Relative imports for local files (`import { OtherThing } from "./other"`)
- **Path Aliases**: Always use the `@/` path alias for imports from the root of the project (e.g., `@/components/...`, `@/lib/...`). Avoid long relative paths like `../../lib/prisma`.

### Formatting
- **Framework**: This project uses Prettier, which should be run automatically by your editor on save.
- **Consistency**: Adhere to the existing formatting for spacing, indentation (2 spaces), and line breaks.
- **File Length**: Keep files focused and reasonably short. A component file over 200 lines or an API route over 150 lines might be a candidate for refactoring.

### Naming Conventions
- **Components**: PascalCase (e.g., `CreateGoalForm`). Filenames should also be PascalCase (`CreateGoalForm.tsx`).
- **Variables & Functions**: camelCase (e.g., `totalWeightage`, `async function createGoal()`).
- **Types/Interfaces**: PascalCase (e.g., `type GoalData = {...}`).
- **Constants**: `UPPER_SNAKE_CASE` for true global constants (e.g., `MAX_GOALS = 8`).
- **API Routes**: Lowercase, kebab-case for filenames if multi-word (e.g., `app/api/user-profile/route.ts`).

### TypeScript and Typing
- **Strict Mode**: The `tsconfig.json` is set to `strict: true`. All code must be strictly typed. Avoid `any` wherever possible.
- **Component Props**: Define props for React components using `interface` or `type` (e.g., `interface MyComponentProps { title: string; }`).
- **Zod for Validation**:
  - Define Zod schemas for all form inputs and API request bodies.
  - Share schemas between client-side forms and server-side API routes to ensure consistency.
  - Use `z.infer<typeof mySchema>` to derive TypeScript types from Zod schemas.

### Error Handling
- **API Routes**:
  - Always wrap database calls and other potentially failing logic in `try...catch` blocks.
  - Return standardized JSON error responses from API routes (e.g., `{ message: "Descriptive error" }`) with appropriate HTTP status codes (400 for bad input, 401 for auth errors, 500 for server errors).
  - Use `NextResponse.json()` for all API responses.
- **Client-Side**:
  - When fetching data, handle the error state. Display informative error messages to the user if a fetch fails.
  - For form submissions, disable the submit button while the request is in-flight to prevent duplicate submissions. Use form state to display validation errors returned from the API.

### General Principles
- **Single Responsibility**: Components and functions should have a single, well-defined purpose.
- **Minimalism**: As requested, components should be functionally complete but stylistically simple for now. Use basic HTML elements or unstyled `shadcn/ui` components. Complexity can be added later.
- **Authentication**: All sensitive API routes and pages must be protected by checking for a valid user session via `getServerSession`.
- **Environment Variables**: All secret keys, API keys, and environment-specific configurations must be stored in `.env.local` and accessed via `process.env`. Never hardcode secrets in the source code.
