import { z } from 'zod';

const optionalNonEmptyString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: optionalNonEmptyString,
  DATABASE_MIGRATION_URL: optionalNonEmptyString,
  SESSION_SECRET: z.string().min(32),
  SMTP_HOST: z.string().min(1).default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().min(1).max(65_535).default(587),
  SMTP_USER: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().email().optional(),
  ),
  SMTP_PASS: optionalNonEmptyString,
  SMTP_FROM: optionalNonEmptyString,
  PUBLIC_APP_URL: z.string().url().default('http://localhost:5173'),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid backend environment configuration: ${details}`);
  }

  const env = result.data;
  if (env.NODE_ENV === 'production') {
    const missing = [
      ['DATABASE_URL', env.DATABASE_URL],
      ['SESSION_SECRET', env.SESSION_SECRET],
      ['SMTP_USER', env.SMTP_USER],
      ['SMTP_PASS', env.SMTP_PASS],
      ['SMTP_FROM', env.SMTP_FROM],
    ]
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(`Missing production backend configuration: ${missing.join(', ')}`);
    }
  }

  return env;
}
