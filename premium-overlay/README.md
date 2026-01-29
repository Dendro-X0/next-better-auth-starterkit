# Premium Overlay

This folder is a **premium-only overlay** for the public starter kit. Nothing in `premium-overlay/` is wired into the public build.

## Upgrade guide

### Environment variables

Premium features do not introduce new required env vars beyond the public starter kit.
Ensure these are set (same as public):

- `BETTER_AUTH_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

Email provider variables are required if you want email flows in production:

- `MAIL_PROVIDER` (`RESEND` or `SMTP`)
- `RESEND_API_KEY` and `EMAIL_FROM` (Resend)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` (SMTP)

### Install into your private/premium repo

- Copy `premium-overlay/src/**` into your repo `src/**`.
- Copy `premium-overlay/drizzle-patch/0005_premium_rbac.sql` into your repo `drizzle/0005_premium_rbac.sql`.
- Copy `premium-overlay/drizzle-patch/0006_premium_profile.sql` into your repo `drizzle/0006_premium_profile.sql`.
- Copy `premium-overlay/drizzle-patch/0007_premium_audit_log.sql` into your repo `drizzle/0007_premium_audit_log.sql`.
- Append the journal entries to your repo `drizzle/meta/_journal.json`:
  - `premium-overlay/drizzle-patch/journal-entry.json` (RBAC)
  - `premium-overlay/drizzle-patch/journal-entry-0006.json` (Profile+)
  - `premium-overlay/drizzle-patch/journal-entry-0007.json` (Audit log)
- Run `pnpm db:migrate`.

## Admin + Role Management

This overlay adds a minimal admin UI:

- Route: `src/app/admin/page.tsx` (Server Component)
- Actions:
  - `src/actions/admin/list-admin-users.ts`
  - `src/actions/admin/set-user-role.ts`

Behavior:

- The `/admin` page is protected by `requireRole({ requiredRole: "admin" })`.
- The UI lets admins promote/demote users by selecting a role and submitting.
- Safety: attempting to demote the last remaining admin is blocked.
- The action redirects back to `/admin` with `?message=` / `?error=` query params (shown via the app-wide `RouteToasts`).

## Deprecated

Do **not** copy `premium-overlay/drizzle/**` into your repo.
It is only kept as a reference snapshot and may conflict with your existing migration history.

## Notes

- The `drizzle-orm` migrator requires `drizzle/meta/_journal.json` to find migrations.
- Do **not** replace your existing `drizzle/meta/*_snapshot.json` files with anything from this overlay.

## Common pitfalls

- Forgetting to append to `drizzle/meta/_journal.json` (Drizzle migrator will not detect the new migrations).
- Overwriting your existing `drizzle/meta/*_snapshot.json` files (can break your migration history).
- `NEXT_PUBLIC_APP_URL` not matching your actual deployed origin (breaks auth links and redirects).
