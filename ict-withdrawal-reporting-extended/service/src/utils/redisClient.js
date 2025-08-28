import Redis from 'ioredis';
export function createRedis(url) {
  return new Redis(url);
}
