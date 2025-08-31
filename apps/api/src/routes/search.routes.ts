import { FastifyPluginAsync } from 'fastify';
import { SearchController } from '../controllers/search.controller.js';
import { SearchResponseSchema } from '../schemas/search.schema.js';

export const searchRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/v1/search', {
    // auth optionnelle: pas de preHandler requis
    schema: {
      tags: ['Search'],
      summary: 'Recherche de contenus',
      operationId: 'search',
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          tag: { type: 'string' },
          groupId: { type: 'string' },
          authorId: { type: 'string' },
          kind: { type: 'string', enum: ['doc','video','note','link','file'] },
          visibility: { type: 'string', enum: ['PUBLIC','UNLISTED','PRIVATE'] },
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          sort: { type: 'string', enum: ['new','old'], default: 'new' }
        }
      },
      response: { 200: SearchResponseSchema },
    },
  }, SearchController.search);
};
