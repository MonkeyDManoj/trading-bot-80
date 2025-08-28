# Repo Patch: Withdrawal & Reporting Extended Integration

This patch adds:
- Withdrawal API now requires header X-WITHDRAWAL-AUTH matching env WITHDRAWAL_AUTH_TOKEN.
- WithdrawalService supports HMAC-signed requests to provider using WITHDRAWAL_PROVIDER_SECRET.
- Report generator will send Slack notifications and email (if configured via ENV).
- Helper `helpers/pushClosedTrade.js` to push closed trades into Redis list `risk:trades:{botId}`.

Integration steps:
1. Add `helpers/pushClosedTrade.js` to your Risk Engine or call equivalent when trades are closed:
   `await pushClosedTrade(process.env.REDIS_URL, BOT_ID, tradeObject)`
2. Configure `.env` for this service with WITHDRAWAL_AUTH_TOKEN and optional provider/email/slack settings.
3. Deploy the service and ensure it can access Redis and provider endpoints.
4. From the Dashboard or automation, use header `X-WITHDRAWAL-AUTH` to authenticate withdrawal calls.
