# Deployment

## Vercel (Recommended)

For the one-click deploy button, see the root [README.md](../README.md) at the top of the repository.

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard (see `docs/configuration.md`)
4. Deploy!

## Other Platforms

This application can be deployed to any platform that supports Next.js (e.g., Netlify, Railway, DigitalOcean App Platform, AWS Amplify).

## Deployment Checklist

- Env vars in Production are set:
  - `BETTER_AUTH_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`
  - Email provider (`RESEND_API_KEY`/`EMAIL_FROM` or `SMTP_*`)
  - Social providers (`GOOGLE_*`, `GITHUB_*`) if enabled
  - Optional: `UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN` for distributed rate limiting
- Database schema migrated (`pnpm db:migrate` run locally or during deploy)
- OAuth provider consoles contain redirect URLs for your domain (see Better Auth docs for the exact endpoints exposed by `toNextJsHandler` under `/api/auth/`)
- Smoke test production:
  - Navigate to `/auth/login` and complete email+password and social logins
  - Verify email links and password reset
  - Test 2FA setup/verify and recovery
- Observe live metrics:
  - Browser DevTools → Network → check `server-timing` header for middleware/auth time
  - Vercel function logs contain `web-vitals` entries (CLS/LCP/INP/TTFB)
- Performance guardrails:
  - Lighthouse CI workflow runs against production URLs on push and schedule
  - Budgets enforced: FCP/LCP/TBT/CLS and category scores
