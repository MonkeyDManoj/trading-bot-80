ICT Integration Demo

This demo composes the following services:
- redis
- execution-service (pause/resume + execute stub)
- risk-simulator (simulates closed trades and updates Redis)
- dashboard-backend (aggregates metrics/trades and exposes actions)
- deployment-manager (monitors drawdown and triggers pause/resume)

Run:
  docker compose up --build

Then access Dashboard Backend endpoints:
- GET /api/trades
- GET /api/metrics
- POST /api/actions { action:'pause'|'resume' }

The risk-simulator will simulate a trade close every 5 seconds and push to Redis.
