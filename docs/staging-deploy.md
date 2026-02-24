# NCSPanda Staging Deploy & Rollback

## Overview
This project deploys to staging via `.github/workflows/deploy-staging.yml`.

Pipeline sequence:
1. Install backend/frontend dependencies
2. Build backend/frontend
3. Execute deployment step (provider-specific placeholder)
4. Run smoke checks:
   - menu fetch
   - pickup slots fetch
   - order creation
   - vendor incoming orders query

## Required Secrets
- `STAGING_API_BASE_URL` (e.g. `https://staging-api.example.com`)
- `STAGING_DEPLOY_TOKEN` (if deployment CLI requires it)

## Smoke Check Script
- Path: `scripts/smoke/staging-smoke.js`
- Run locally:

```bash
STAGING_API_BASE_URL=https://staging-api.example.com node scripts/smoke/staging-smoke.js
```

## Rollback / Failure Path
If smoke checks fail after deployment:
1. Mark workflow as failed (automatic)
2. Roll back to last known-good staging release via your hosting platform
3. Re-run smoke checks against the rolled-back build
4. Open an incident ticket with failing endpoint payloads/logs

## Notes
- The deploy step in workflow is intentionally a placeholder and should be replaced with your provider command (e.g. Render/Fly/Railway/Kubernetes).
- Keep staging isolated from production DB and secrets.
