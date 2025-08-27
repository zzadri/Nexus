import { FastifyReply, FastifyRequest } from 'fastify';
import { GroupsService } from '../services/groups.service.js';
import { CreateGroupBodyZ, ListGroupsQueryZ } from '../schemas/groups.schema.js';

export class GroupsController {
  static async create(req: any) {
    const { name, description, visibility } = CreateGroupBodyZ.parse(req.body);
    const group = await GroupsService.create(req.user.sub, name, description, visibility);
    return { group };
  }

  static async list(req: FastifyRequest) {
    const { q, page, pageSize } = ListGroupsQueryZ.parse((req as any).query ?? {});
    const out = await GroupsService.listPublic(q, page, pageSize);
    return out;
  }

  static async getBySlug(req: any, res: FastifyReply) {
    const { slug } = req.params as { slug: string };
    const viewerId = req.user?.sub as string | undefined;
    const out = await GroupsService.getForViewer(slug, viewerId);
    if ('notFound' in out) return res.code(404).send({ error: 'NOT_FOUND' });
    if ('forbidden' in out) return res.code(403).send({ error: 'FORBIDDEN' });
    return { group: out.group };
  }

  static async join(req: any, res: FastifyReply) {
    const { slug } = req.params as { slug: string };
    const out = await GroupsService.join(slug, req.user.sub);
    if ('notFound' in out) return res.code(404).send({ error: 'NOT_FOUND' });
    if ('forbidden' in out) return res.code(403).send({ error: 'FORBIDDEN' });
    if ('conflict' in out) return res.code(409).send({ error: out.conflict });
    return { ok: true };
  }

  static async leave(req: any, res: FastifyReply) {
    const { slug } = req.params as { slug: string };
    const out = await GroupsService.leave(slug, req.user.sub);
    if ('notFound' in out) return res.code(404).send({ error: 'NOT_FOUND' });
    if ('forbidden' in out) return res.code(403).send({ error: 'FORBIDDEN' });
    return { ok: true };
  }
}
