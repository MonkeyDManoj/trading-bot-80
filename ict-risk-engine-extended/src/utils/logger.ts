import pino from 'pino';
const level = (process.env.LOG_LEVEL || 'info') as pino.LevelWithSilent;
export const logger = pino({ level });
