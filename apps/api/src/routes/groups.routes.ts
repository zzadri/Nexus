import { FastifyPluginAsync } from 'fastify';
import { GroupsController } from '../controllers/groups.controller.js';
import {
  CreateGroupBodySchema,
  GroupResponseSchema,
  GroupsListResponseSchema,
  BasicOkSchema,
  NotFoundSchema,
  ForbiddenSchema,
  ConflictSchema,
} from '../schemas/groups.schema.js';

export const groupRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/v1/groups', {
    preHandler: [app.authenticate as any],
    schema: {
      tags: ['Groups'],
      summary: 'Créer un groupe',
      operationId: 'createGroup',
      body: CreateGroupBodySchema,
      response: { 200: GroupResponseSchema },
      security: [{ CsrfHeader: [] }],
    },
  }, GroupsController.create);

  app.get('/api/v1/groups', {
    schema: {
      tags: ['Groups'],
      summary: 'Lister les groupes publics',
      operationId: 'listGroups',
      response: { 200: GroupsListResponseSchema },
      security: [], // public
    },
  }, GroupsController.list);

  app.get('/api/v1/groups/:slug', {
    schema: {
      tags: ['Groups'],
      summary: 'Détail groupe (PRIVATE protégé)',
      operationId: 'getGroupBySlug',
      response: { 200: GroupResponseSchema, 403: ForbiddenSchema, 404: NotFoundSchema },
      security: [], // peut être public (UNLISTED/PUBLIC), PRIVATE => 403 si non membre
    },
  }, GroupsController.getBySlug);

  app.post('/api/v1/groups/:slug/join', {
    preHandler: [app.authenticate as any],
    schema: {
      tags: ['Groups'],
      summary: 'Rejoindre un groupe (PUBLIC/UNLISTED)',
      operationId: 'joinGroup',
      response: { 200: BasicOkSchema, 403: ForbiddenSchema, 404: NotFoundSchema, 409: ConflictSchema },
      security: [{ CsrfHeader: [] }],
    },
  }, GroupsController.join);

  app.post('/api/v1/groups/:slug/leave', {
    preHandler: [app.authenticate as any],
    schema: {
      tags: ['Groups'],
      summary: 'Quitter un groupe',
      operationId: 'leaveGroup',
      response: { 200: BasicOkSchema, 403: ForbiddenSchema, 404: NotFoundSchema },
      security: [{ CsrfHeader: [] }],
    },
  }, GroupsController.leave);
};
