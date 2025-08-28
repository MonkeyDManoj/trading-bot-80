# Repo Patch: Execution Control Endpoint & Validator Retraining Pipeline

1) Execution Service:
- Add the `/api/control` endpoint (POST) to accept { action: 'pause'|'resume' }.
- Implement a safe pause: stop accepting new orders, persist in-flight orders, optionally cancel or hold.
- Ensure paused state is reflected in your order processing loop (check a `paused` flag before dequeuing).

2) Validator Retraining Pipeline:
- Place `validator-retraining-pipeline/` in your infra repo under `/tools/validator-retraining`.
- Use `scripts/train_validator.py` to retrain from backtested labelled data.
- Use `scripts/deploy_model.py --src models/validator_gbt_v1.pkl --dest /path/to/bot/validator_gbt_v1.pkl` to deploy.

3) Combined Deployment:
- When retraining produces a validated model, deploy during maintenance window and restart validator worker.
- Maintain versioned models (validator_gbt_v1.pkl, validator_gbt_v2.pkl) and keep automatic rollback plan.
