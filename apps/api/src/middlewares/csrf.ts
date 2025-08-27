// src/middlewares/csrf.ts
import { FastifyPluginAsync } from 'fastify';
import crypto from 'node:crypto';
import { env } from '../env.js';

// 👇 IMPORTANT : importe le plugin pour activer l’augmentation de types (cookies/setCookie)
import '@fastify/cookie';

// En développement, on peut temporairement désactiver la vérification CSRF
// pour les routes d'inscription et de connexion pour faciliter les tests
const csrfPathsBypass = new Set<string>([
  '/api/v1/health',
  '/api/v1/auth/csrf',
  '/api/v1/auth/refresh',
  ...(env.NODE_ENV === 'development' ? ['/api/v1/auth/login', '/api/v1/auth/register'] : []),
]);

export const csrfGuard: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', async (req, res) => {
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;
    if (csrfPathsBypass.has(req.url)) return;

    // 👇 grâce à import '@fastify/cookie', req.cookies est typé
    const header = req.headers['x-csrf-token'];
    const cookie = req.cookies?.[env.CSRF_COOKIE_NAME];

    console.log('CSRF check >', req.url, '| Header:', header, '| Cookie:', cookie);

    if (!header || !cookie || header !== cookie) {
      res.code(403);
      console.error('CSRF token invalid >', 'Header:', header, 'Cookie:', cookie);
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
          properties: { token: { type: 'string' }, csrfToken: { type: 'string' } },
        },
      },
    },
  }, async (_req, res) => {
    const token = crypto.randomBytes(24).toString('base64url');

    console.log('Génération nouveau token CSRF:', token);

    // 👇 setCookie est typé via @fastify/cookie
    console.log('🔑 Génération nouveau token CSRF:', token, 'domaine:', env.COOKIE_DOMAIN || 'default');
    
    res.setCookie(env.CSRF_COOKIE_NAME, token, {
      httpOnly: false,           // token lisible par le front
      sameSite: env.NODE_ENV === 'development' ? 'lax' : 'strict', // Utiliser 'lax' en dev pour faciliter les tests
      path: '/',
      secure: env.NODE_ENV !== 'development',
      domain: env.COOKIE_DOMAIN || undefined,
    } as any);

    return { token, csrfToken: token }; // Retourner les deux formats pour compatibilité
  });
};
