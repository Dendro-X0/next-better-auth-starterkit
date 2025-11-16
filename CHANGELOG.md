# Changelog

All notable changes to this project will be documented in this file.

## 2025-11-15

### Added
- Added support for Next.js 16 App Router.

## 2025-10-23

### Fixed
- Fixed Vercel production deployment OAuth redirects.

### Added
- Added Lighthouse CI workflow, optimized performance and best practices.

## 2025-09-14

### Added
- Support for signing in with either email or username plus password.

### Changed
- `LoginSchema` now accepts `identifier` (email or username) instead of `email`.
- Login page UI updated to show an "Email or Username" field and send `identifier`.
- Server `loginAction` now routes to Better Auth `signInEmail` or `signInUsername` (via the `username` plugin) based on the identifier.
- Rate-limiting updated to use the provided identifier.

### Notes
- No database migration required. The `user.username` column is already present and unique in the Drizzle schema.

## 2025-09-12

### Added
- Auth UX: Enabled `emailVerification.sendOnSignIn` and `emailVerification.autoSignInAfterVerification` in `src/lib/auth/auth.ts` to recover from missed/failed first emails and improve post-verification flow.
- Feature: Implemented a "Resend verification" flow.
  - Server action: `src/actions/resend-verification.ts` (rate-limited; neutral responses to avoid user enumeration).
  - UI: `src/components/auth/resend-verification-form.tsx` mounted on `src/app/auth/login/page.tsx` under social logins.
- Docs: Updated `docs/getting-started.md` with a "Resend Verification Email" section and linked example.
- Docs: Expanded `docs/configuration.md` with provider casing and SMTP setup guidance; emphasized `NEXT_PUBLIC_APP_URL` alignment.

### Notes
- Email provider casing is uppercase in this starter kit: `MAIL_PROVIDER=RESEND | SMTP`.
- For development, SMTP with MailHog is recommended; for production, Resend or a production SMTP provider with a verified `EMAIL_FROM`.
