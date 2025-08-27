import { FastifyReply } from 'fastify';
import { ReportsService } from '../services/reports.service.js';
import {
  CreateReportBodyZ,
  ListReportsQueryZ,
  UpdateReportStatusBodyZ,
} from '../schemas/reports.schema.js';

export class ReportsController {
  static async create(req: any, res: FastifyReply) {
    const body = CreateReportBodyZ.parse(req.body);
    const out = await ReportsService.create(req.user.sub, body);
    if ('notFound' in out) return res.code(404).send({ error: 'NOT_FOUND' });
    return { report: out.report };
  }

  static async list(req: any, res: FastifyReply) {
    const q = ListReportsQueryZ.parse(req.query ?? {});
    const out = await ReportsService.list(
      { id: req.user.sub, role: req.user.role },
      { status: q.status, groupId: q.groupId, page: q.page, pageSize: q.pageSize }
    );
    if ('forbidden' in out) return res.code(403).send({ error: 'FORBIDDEN' });
    return out;
  }

  static async getById(req: any, res: FastifyReply) {
    const { id } = req.params as { id: string };
    const out = await ReportsService.get({ id: req.user.sub, role: req.user.role }, id);
    if ('notFound' in out) return res.code(404).send({ error: 'NOT_FOUND' });
    if ('forbidden' in out) return res.code(403).send({ error: 'FORBIDDEN' });
    return { report: out.report };
  }

  static async updateStatus(req: any, res: FastifyReply) {
    const { id } = req.params as { id: string };
    const { status } = UpdateReportStatusBodyZ.parse(req.body);
    const out = await ReportsService.updateStatus({ id: req.user.sub, role: req.user.role }, id, status);
    if ('notFound' in out) return res.code(404).send({ error: 'NOT_FOUND' });
    if ('forbidden' in out) return res.code(403).send({ error: 'FORBIDDEN' });
    return { report: out.report };
  }
}
