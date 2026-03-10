## CI/CD Workflow Summary (.github/workflows)

### 1) `ci.yml` (Continuous Integration)
- **Triggers:** `pull_request`, `push` to `main`
- **Purpose:** Validate code quality and build readiness for both backend and frontend
- **Automations:**
  - Install dependencies (`npm ci`)
  - Static checks (`npm run lint`, `npm run typecheck`)
  - Tests (`npm test`)
  - Build (`npm run build`)
- **Structure:**
  - `backend-static` → `backend-tests-build`
  - `frontend-static` → `frontend-tests-build`
- **Runtime optimization:** Node 20 + npm dependency cache

### 2) `security.yml` (Security Scanning)
- **Triggers:** `pull_request`, `push` to `main`
- **Purpose:** Dependency vulnerability gate
- **Automations:**
  - Run `npm audit --audit-level=high` for backend and frontend
  - Fail workflow on high/critical vulnerabilities
  - Export JSON audit reports and upload as artifacts:
    - `backend-security-report`
    - `frontend-security-report`

### 3) `deploy-staging.yml` (Staging Delivery - Partial CD)
- **Triggers:** `workflow_dispatch`, `push` to `main`
- **Purpose:** Build and verify staging readiness
- **Automations:**
  - Install and build backend/frontend
  - Run staging smoke checks (`scripts/smoke/staging-smoke.js`) using `STAGING_API_BASE_URL` secret
  - Upload smoke artifact (`staging-smoke-log`)
- **Current limitation:** Deploy step is still a placeholder (`echo`), so full automated deployment is **not yet implemented**

## Overall Pipeline Categories Automated

1. **Continuous Integration (CI):** install, lint, type-check, test, and build.
2. **Automated Security Scanning:** dependency audit with fail gates and report artifacts.
3. **Pre-deployment Staging Validation (Partial CD):** staging build + smoke testing.
4. **Not yet automated:** actual staging deployment execution (currently stubbed).


# DO APP PLATFORM GITHUB ACTIONS DOCUMENTATION
https://github.com/digitalocean/app_action

## DO APP PLATFORM ENV VARIABLE DOCUMENTATION
https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/

## GHCR DOCUMENTATION
https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry