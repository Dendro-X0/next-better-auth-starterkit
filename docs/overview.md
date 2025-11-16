# Overview

Next.js Better Auth Starterkit is a production-ready boilerplate for Next.js 16 featuring a robust authentication system powered by Better Auth. It includes email/password, social providers (Google, GitHub), magic links, password reset, and 2FA (TOTP + backup codes). The stack emphasizes type safety, accessibility, and a great developer experience.

## Tech Stack

- Framework: Next.js 16 (App Router)
- Auth: Better Auth
- Database/ORM: PostgreSQL + Drizzle ORM
- UI: Shadcn UI + Tailwind CSS
- Forms: Server Actions + useActionState
- Env Validation: T3 Env
- Rate Limiting: Upstash Redis (optional)

## Project Structure

```
.
├── src
│   ├── actions         # Server Actions for forms
│   ├── app             # App Router pages and layouts
│   ├── components      # Shared React components
│   ├── lib             # Core logic, utilities, and configurations
│   │   ├── auth        # Better Auth client/config
│   │   ├── db          # Drizzle ORM schema and client
│   │   ├── security    # Rate limiting, IP utilities
│   │   ├── services    # External integrations (e.g., email)
│   │   ├── types       # Type definitions
│   │   ├── ui          # Toast utilities
│   │   ├── utils       # Utility functions
│   │   └── validations # Zod schemas
│   └── ...
└── drizzle             # Drizzle migration files
```
