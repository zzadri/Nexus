// src/middlewares/csrf.ts
import { FastifyPluginAsync } from 'fastify';
import crypto from 'node:crypto';
import { env } from '../env.js';

// 👇 IMPORTANT : importe le plugin pour activer l’augmentation de types (cookies/setCookie)
import '@fastify/cookie';

const csrfPathsBypass = new Set<string>([
  '/api/v1/health',
  '/api/v1/auth/csrf',
  '/api/v1/auth/refresh',
]);

export const csrfGuard: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', async (req, res) => {
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;
    if (csrfPathsBypass.has(req.url)) return;

    // 👇 grâce à import '@fastify/cookie', req.cookies est typé
    const header = req.headers['x-csrf-token'];
    const cookie = req.cookies?.[env.CSRF_COOKIE_NAME];

    if (!header || !cookie || header !== cookie) {
      res.code(403);
      throw new Error('CSRF token invalid');
    }
  });

  app.get('/api/v1/auth/csrf', {
    schema: {
      tags: ['Auth'],
      summary: 'Obtenir un token CSRF (double-cookie)',
      operationId: 'auth_get_csrf',
      response: {
        200: {
          type: 'object',
          properties: { token: { type: 'string' } },
        },
      },
    },
  }, async (_req, res) => {
    const token = crypto.randomBytes(24).toString('base64url');

    // 👇 setCookie est typé via @fastify/cookie
    res.setCookie(env.CSRF_COOKIE_NAME, token, {
      httpOnly: false,           // token lisible par le front
      sameSite: 'strict',
      path: '/',
      secure: env.NODE_ENV !== 'development',
      domain: env.COOKIE_DOMAIN || undefined,
    } as any);

    return { token };
  });
};
