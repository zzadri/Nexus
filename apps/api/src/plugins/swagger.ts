import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export default fp(async (app) => {
  const enable = process.env.ENABLE_SWAGGER === '1' || process.env.NODE_ENV !== 'production';
  if (!enable) {
    app.log.info('[swagger] disabled');
    return;
  }

  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Nexus API',
        description: 'Documentation de l’API Nexus',
        version: '1.0.0'
      },
      servers: [{ url: process.env.API_PUBLIC_URL ?? 'http://localhost:3001' }],
      tags: [
        { name: 'Auth', description: 'Inscription, login, refresh, 2FA, logout' },
        { name: 'Users', description: 'Profil courant et préférences' },
        { name: 'Uploads', description: 'Fichiers (MinIO/S3), presign, finalisation' },
        { name: 'Groups', description: 'Groupes, adhésions, invitations' },
        { name: 'Posts', description: 'Posts, visibilité, feed, CRUD' },
        { name: 'Comments', description: 'Commentaires d’un post' },
        { name: 'Reactions', description: 'Réactions (like, love, insight, question)' },
        { name: 'Reports', description: 'Signalements de contenu' },
        { name: 'Search', description: 'Recherche simple + tags' },
        { name: 'Admin', description: 'Administration / modération' },
        { name: 'Health', description: 'Santé du service' }
      ],
      components: {
        securitySchemes: {
          AccessCookie: {
            type: 'apiKey', in: 'cookie', name: 'access_token',
            description: 'JWT d’accès (cookie HttpOnly)'
          },
          CsrfHeader: {
            type: 'apiKey', in: 'header', name: 'x-csrf-token',
            description: 'Double-cookie CSRF token'
          }
        }
      },
      // sécurité par défaut (on surchargera sur les endpoints publics)
      security: [{ AccessCookie: [], CsrfHeader: [] }]
    }
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    staticCSP: true,
    uiConfig: {
      docExpansion: 'none',             // collapse tout
      deepLinking: true,
      displayRequestDuration: true,
      persistAuthorization: true,
      tagsSorter: 'alpha',               // tri des tags
      operationsSorter: 'method',        // GET avant POST, etc.
      defaultModelsExpandDepth: -1       // cache le gros bloc "Schemas" par défaut
    }
  });

  app.log.info('[swagger] enabled at /docs');
});
