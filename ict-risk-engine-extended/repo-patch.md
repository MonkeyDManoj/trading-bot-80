# Repo Patch: Risk Engine Integration

1. Copy `src/risk/`, `src/middleware/`, `src/utils/`, and `instruments.json` into your repo.
2. In `ExecutionService.enqueue()`, accept `opts.lots` and size positions accordingly.
3. Wire pipeline:

ValidatorMiddleware → RiskMiddleware → ExecutionService.enqueue()

4. Ensure Redis is running and accessible.
