// src/env.ts
import { z } from 'zod';
import 'dotenv/config';

export const env = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.coerce.number().default(3001),

  DATABASE_URL: z.string().min(1),

  // Front web (Vite)
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),

  // Swagger UI (sert depuis l’API elle-même)
  SWAGGER_ORIGIN: z.string().url().default('http://localhost:3001'),

  COOKIE_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(32),
  MFA_TOKEN_SECRET: z.string().min(32),
  TOTP_ENC_KEY_B64: z.string().min(44),
  CSRF_COOKIE_NAME: z.string().default('csrfToken'),

  // S3/MinIO
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string(),
  S3_BUCKET: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
  S3_USE_SSL: z.coerce.boolean().default(false),
}).parse(process.env);
