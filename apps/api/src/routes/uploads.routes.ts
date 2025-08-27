import { FastifyPluginAsync } from 'fastify';
import { UploadsController } from '../controllers/uploads.controller.js';
import { PresignResponseSchema, AssetResponseSchema, ListResponseSchema, SignedGetUrlResponseSchema } from '../schemas/uploads.schema.js';

export const uploadsRoutes: FastifyPluginAsync = async (app) => {
  // Tous les endpoints sont authentifiés
  const auth = { preHandler: [app.authenticate] as any };

  app.post('/api/v1/uploads/presign', {
    ...auth,
    schema: {
      tags: ['Uploads'],
      summary: 'Obtenir une URL signée (PUT) pour envoyer un fichier',
      operationId: 'uploads_presign',
      body: {
        type: 'object',
        required: ['mime','size','kind'],
        properties: {
          mime: { type: 'string' },
          size: { type: 'integer', maximum: 50 * 1024 * 1024 },
          kind: { type: 'string', enum: ['image','video','pdf','file'] },
          postId: { type: 'string' },
          groupId: { type: 'string' },
        }
      },
      response: { 200: PresignResponseSchema }
    }
  }, UploadsController.presign);

  app.post('/api/v1/uploads/complete', {
    ...auth,
    schema: {
      tags: ['Uploads'],
      summary: 'Déclarer un upload terminé et créer l’asset',
      operationId: 'uploads_complete',
      body: {
        type: 'object',
        required: ['key','bucket','kind','size','mimeType'],
        properties: {
          key: { type: 'string' },
          bucket: { type: 'string' },
          kind: { type: 'string', enum: ['image','video','pdf','file'] },
          size: { type: 'integer' },
          mimeType: { type: 'string' },
          postId: { type: 'string' },
          groupId: { type: 'string' },
          sha256: { type: 'string' },
        }
      },
      response: { 200: AssetResponseSchema }
    }
  }, UploadsController.complete);

  app.get('/api/v1/uploads', {
    ...auth,
    schema: {
      tags: ['Uploads'],
      summary: 'Lister mes assets (et ceux des groupes où je suis membre)',
      operationId: 'uploads_list',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 50, default: 20 }
        }
      },
      response: { 200: ListResponseSchema }
    }
  }, UploadsController.list);

  app.get('/api/v1/uploads/:id', {
    ...auth,
    schema: {
      tags: ['Uploads'],
      summary: 'Récupérer les métadonnées d’un asset',
      operationId: 'uploads_get',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      response: { 200: AssetResponseSchema }
    }
  }, UploadsController.getOne);

  app.get('/api/v1/uploads/:id/url', {
    ...auth,
    schema: {
      tags: ['Uploads'],
      summary: 'Obtenir une URL signée (GET) pour télécharger un asset',
      operationId: 'uploads_signed_get',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      response: { 200: SignedGetUrlResponseSchema }
    }
  }, UploadsController.signedUrl);

  app.delete('/api/v1/uploads/:id', {
    ...auth,
    schema: {
      tags: ['Uploads'],
      summary: 'Supprimer un asset (S3 + DB)',
      operationId: 'uploads_delete',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      response: { 200: { type: 'object', properties: { ok: { type: 'boolean' } } } }
    }
  }, UploadsController.remove);
};
