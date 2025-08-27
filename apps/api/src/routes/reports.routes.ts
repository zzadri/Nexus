import { FastifyPluginAsync } from 'fastify';
import { ReportsController } from '../controllers/reports.controller.js';
import {
  CreateReportBodySchema,
  ReportResponseSchema,
  ReportsListResponseSchema,
  UpdateReportStatusBodySchema,
} from '../schemas/reports.schema.js';
import { ForbiddenSchema, NotFoundSchema } from '../schemas/common.schema.js';

export const reportRoutes: FastifyPluginAsync = async (app) => {
  // Créer un report
  app.post('/api/v1/reports', {
    preHandler: [app.authenticate as any],
    schema: {
      tags: ['Reports'],
      summary: 'Créer un signalement',
      operationId: 'createReport',
      body: CreateReportBodySchema,
      response: { 200: ReportResponseSchema, 404: NotFoundSchema },
      security: [{ CsrfHeader: [] }],
    },
  }, ReportsController.create);

  // Lister les reports (restreint MOD/ADMIN ou staff du groupe)
  app.get('/api/v1/reports', {
    preHandler: [app.authenticate as any],
    schema: {
      tags: ['Reports'],
      summary: 'Lister les signalements',
      operationId: 'listReports',
      response: { 200: ReportsListResponseSchema, 403: ForbiddenSchema },
      security: [],
    },
  }, ReportsController.list);

  // Obtenir un report
  app.get('/api/v1/reports/:id', {
    preHandler: [app.authenticate as any],
    schema: {
      tags: ['Reports'],
      summary: 'Obtenir un signalement',
      operationId: 'getReport',
      response: { 200: ReportResponseSchema, 403: ForbiddenSchema, 404: NotFoundSchema },
      security: [],
    },
  }, ReportsController.getById);

  // Mettre à jour le statut
  app.patch('/api/v1/reports/:id', {
    preHandler: [app.authenticate as any],
    schema: {
      tags: ['Reports'],
      summary: 'Mettre à jour le statut du signalement',
      operationId: 'updateReportStatus',
      body: UpdateReportStatusBodySchema,
      response: { 200: ReportResponseSchema, 403: ForbiddenSchema, 404: NotFoundSchema },
      security: [{ CsrfHeader: [] }],
    },
  }, ReportsController.updateStatus);
};
