# Pro Delivery (Customer Installation, Upgrades, Support)

This document describes how you deliver and maintain the **Pro** version of this starter kit.

## Terms

- **Free repo**: the public repository.
- **Pro repo**: the private repository customers receive access to.
- **Premium overlay**: the `premium-overlay/` folder in the Free repo.

## What customers receive

Customers receive access to the **Pro repo**.

- The Pro repo is a complete Next.js project.
- Pro-only features are enabled when `PREMIUM_PLAN=pro`.

## Installation (fresh project)

### 1) Clone and install

```bash
pnpm install
cp .env.example .env
```

### 2) Configure environment variables

Minimum required:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

Commonly required (depending on enabled auth providers):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Email (production):

- `MAIL_PROVIDER` (`RESEND` or `SMTP`)
- `EMAIL_FROM`

Resend:

- `RESEND_API_KEY`

SMTP:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`

Pro feature flag:

- `PREMIUM_PLAN=pro`

### 3) Run database migrations

```bash
pnpm db:migrate
```

### 4) Start dev server

```bash
pnpm dev
```

## Upgrading an existing customer installation

### Recommended upgrade approach

- Pull the latest Pro repo changes.
- Run install to ensure dependencies match:

```bash
pnpm install
```

- Run database migrations:

```bash
pnpm db:migrate
```

### Notes on migrations

- Migrations are additive and should be applied in order.
- If the customer has a long-lived environment, always run migrations before deploying.

## How Pro is assembled (for maintainers)

The **Free repo** is the source-of-truth for the premium overlay. Pro is assembled as:

- Free repo baseline
- plus `premium-overlay/` applied into the project

### Local assembly validation

From the Free repo root:

```bash
pnpm assemble:pro -- --clean --target-dir=.tmp/pro
```

Then, in the assembled directory:

```bash
pnpm install
pnpm auth:install -- --force
pnpm lint
pnpm build
```

### CI validation

The Free repo CI runs an `assemble_pro` job that:

- builds an assembled tree in `.tmp/pro`
- applies the overlay (`pnpm auth:install -- --force`)
- validates `lint` and `build`

This ensures the overlay remains compatible with the current Free baseline.

## Support policy (recommended)

### What you support

- Install/upgrade issues reproducible on the latest Pro release.
- Migration issues when running `pnpm db:migrate` on supported databases.
- Security issues (report privately).

### What you do not support

- Custom modifications to core auth flows without a minimal repro.
- Infrastructure outages in third-party providers.
- Performance issues without a repro and baseline metrics.

### Required info for support requests

- Pro repo version/tag/commit
- Node version
- Hosting provider (Vercel/Netlify/self-host)
- Database provider
- Relevant environment variables (redacted)
- Error logs + steps to reproduce

## Release checklist (maintainers)

- Confirm Free repo CI is green (including `assemble_pro`).
- Confirm Pro repo CI is green.
- Tag the Pro repo release.
- Publish customer-facing changelog notes.
