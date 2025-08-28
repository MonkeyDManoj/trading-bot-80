# ICT Risk Engine Extended

This bundle includes:
- Redis-backed account state (`AccountStoreRedis`)
- Static instrument metadata (`instruments.json`) with `PositionSizer`
- Risk checks (`RiskService` + `RiskMiddleware`)
- Daily reset scheduler

## Usage
1. Configure `.env` with Redis URL and risk parameters.
2. Run `npm install` then `npm run dev`.

## Integration
Insert RiskMiddleware between Validator and Execution:

Signal → ValidatorMiddleware → **RiskMiddleware** → ExecutionService.enqueue()
