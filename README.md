# Control Panel Monorepo

Monorepo containing a Next.js web dashboard and a FastAPI backend for health data.

## Structure
```
control-panel/
  apps/
    web/              # Next.js single-page dashboard
    api/              # FastAPI service
  packages/
    shared/           # shared types/constants placeholder
  infra/docker/      # local dev compose placeholder
```

## Apps
- **apps/web**: Next.js + TypeScript + Tailwind single-page dashboard with login and a health widget.
- **apps/api**: FastAPI service with JWT auth, widget layout persistence, and health summary endpoints.

## Quickstart

### Web
1. `cd apps/web`
2. `npm install`
3. `npm run dev` (uses `NEXT_PUBLIC_API_BASE_URL` or defaults to `http://localhost:8000`)

### API
1. `cd apps/api`
2. `pip install -r requirements.txt`
3. Run migrations: `alembic upgrade head`
4. Start server: `uvicorn app.main:app --reload --port 8000`

## Environment Variables
- `DATABASE_URL` (default: SQLite `sqlite:///./control-panel.db`)
- `REDIS_URL` (optional for async jobs)
- `GARMIN_USERNAME` / `GARMIN_PASSWORD` (optional; sample data used when absent)
- `API_BASE_URL` (default `http://localhost:8000`)
- `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` (JWT configuration)

### Notes
- Tokens are stored in the browser under `control-panel-token`.
- Widget layouts persist per user via `/widgets/layout`.
- Health data is available at `/health/summary` and `/health/ping`.
