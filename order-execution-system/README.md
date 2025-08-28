# Order Execution System (TradeLocker integration)

This repository contains a modular TypeScript order execution system with support for a generic TradeLocker adapter, in-memory and Redis-based trade locker, execution queue with retry/backoff, and WebSocket event broadcasting.

## Quick start (development)

1. Copy `.env.example` to `.env` and edit values.
2. Install dependencies:
   ```
   npm ci
   ```
3. Run in dev mode:
   ```
   npm run dev
   ```

## Build for production

```
npm run build
npm start
```

## Notes

- Use `USE_REDIS=true` and provide `REDIS_URL` to enable Redis-based locks.
- Provide `TRADELOCKER_BASE_URL` and `TRADELOCKER_API_KEY` to use the TradeLockerAdapter; otherwise the MockBrokerAdapter is used.
- Update TradeLocker endpoint paths and signing preimage to match your provider's docs.
