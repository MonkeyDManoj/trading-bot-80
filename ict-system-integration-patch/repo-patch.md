Repo Patch: Apply the following changes to integrate Reporting + Execution control


1) Add helpers/pushClosedTrade.js to your repo (see file included).
2) Modify RiskService.onTradeClosed to call pushClosedTrade(...) as shown in risk_integration_patch.diff.
3) Update your ExecutionService to support pause()/resume() and check this.paused before enqueueing new orders (see execution_control_patch.diff).
4) Ensure env variables are set: REDIS_URL, BOT_ID
5) Restart services after patching.

Notes:
- The patch files included are illustrative diffs. If you use git, apply them via manual edits or create a branch and commit changes.
- Test in a staging environment before production.
