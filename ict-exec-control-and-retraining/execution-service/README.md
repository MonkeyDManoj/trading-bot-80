Execution Service Stub

This small Express app provides:
- POST /api/control { action: 'pause'|'resume' }  -> to be called by Deployment Manager
- GET /api/status -> returns paused state
- POST /api/execute -> stub for enqueuing execution (returns 503 if paused)

Run:
  cd execution-service
  npm install
  npm start

Integration:
- Replace TODOs with your actual queue pause/resume logic: flush or persist in-flight orders before returning from pause.
