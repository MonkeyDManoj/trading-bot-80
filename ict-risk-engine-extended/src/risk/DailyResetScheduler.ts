export class DailyResetScheduler {
  constructor(private resetFn: () => Promise<void>) {}

  start() {
    const now = new Date();
    const next = new Date();
    next.setHours(24, 0, 0, 0);
    const delay = next.getTime() - now.getTime();
    setTimeout(async () => {
      await this.resetFn();
      this.start();
    }, delay);
  }
}
