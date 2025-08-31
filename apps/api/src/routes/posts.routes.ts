import { FastifyPluginAsync } from 'fastify';
import { PostsController } from '../controllers/posts.controller.js';
import {
  CreatePostBodySchema,
  PostResponseSchema,
  PostsListResponseSchema,
  NotFoundSchema,
  ForbiddenSchema,
} from '../schemas/posts.schema.js';

export const postRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/v1/posts', {
    preHandler: [app.authenticate as any],
    schema: {
      tags: ['Posts'],
      summary: 'Créer une publication',
      operationId: 'createPost',
      body: CreatePostBodySchema,
      response: { 200: PostResponseSchema, 403: ForbiddenSchema, 404: NotFoundSchema },
      security: [{ CsrfHeader: [] }],
    },
  }, PostsController.create);

  app.get('/api/v1/posts', {
    schema: {
      tags: ['Posts'],
      summary: 'Lister les publications (option: par groupe)',
      operationId: 'listPosts',
      response: { 200: PostsListResponseSchema, 403: ForbiddenSchema, 404: NotFoundSchema },
      security: [],
    },
  }, PostsController.list);

  app.get('/api/v1/posts/:postId', {
    schema: {
      tags: ['Posts'],
      summary: 'Obtenir une publication par son ID',
      operationId: 'getPostById',
      response: { 200: PostResponseSchema, 403: ForbiddenSchema, 404: NotFoundSchema },
      security: [],
    },
  }, PostsController.getById);
};
