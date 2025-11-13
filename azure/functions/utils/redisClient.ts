import Redis from 'ioredis';

const host = process.env.REDIS_HOST || 'localhost';
const port = Number(process.env.REDIS_PORT || '6379');
const password = process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim().length > 0
  ? process.env.REDIS_PASSWORD
  : undefined;
const keyPrefix = process.env.REDIS_KEY_PREFIX || 'eventix:';
const tlsEnabled = process.env.REDIS_TLS_ENABLED === 'true';

export const redis = new Redis({
  host,
  port,
  password,
  keyPrefix,
  enableAutoPipelining: true,
  maxRetriesPerRequest: 1,
  connectTimeout: 10_000,
  keepAlive: 10_000,
  tls: tlsEnabled ? {} : undefined,
});

redis.on('ready', () => {
  console.info('[redis] connection established');
});

redis.on('error', (error: Error) => {
  console.error('[redis] connection error', error);
});

redis.on('end', () => {
  console.warn('[redis] connection closed');
});

export async function loadScript(lua: string): Promise<string> {
  const sha = (await redis.script('LOAD', lua)) as string | Buffer;
  return typeof sha === 'string' ? sha : sha.toString();
}
