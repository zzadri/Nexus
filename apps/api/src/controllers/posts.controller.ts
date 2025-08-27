import { FastifyReply, FastifyRequest } from 'fastify';
import { PostsService } from '../services/posts.service.js';
import { CreatePostBodyZ, ListPostsQueryZ } from '../schemas/posts.schema.js';

export class PostsController {
  static async create(req: any, res: FastifyReply) {
    const { content, groupSlug } = CreatePostBodyZ.parse(req.body);
    const out = await PostsService.create(req.user.sub, content, groupSlug);
    if ('notFound' in out) return res.code(404).send({ error: 'NOT_FOUND' });
    if ('forbidden' in out) return res.code(403).send({ error: 'FORBIDDEN' });
    return { post: out.post };
  }

  static async list(req: FastifyRequest, res: FastifyReply) {
    const { groupSlug, page, pageSize } = ListPostsQueryZ.parse((req as any).query ?? {});
    const viewerId = (req as any).user?.sub as string | undefined;
    const out = await PostsService.list(groupSlug, page, pageSize, viewerId);
    if ('notFound' in out) return res.code(404).send({ error: 'NOT_FOUND' });
    if ('forbidden' in out) return res.code(403).send({ error: 'FORBIDDEN' });
    return out;
  }

  static async getById(req: any, res: FastifyReply) {
    const { postId } = req.params as { postId: string };
    const viewerId = req.user?.sub as string | undefined;
    const out = await PostsService.get(postId, viewerId);
    if ('notFound' in out) return res.code(404).send({ error: 'NOT_FOUND' });
    if ('forbidden' in out) return res.code(403).send({ error: 'FORBIDDEN' });
    return { post: out.post };
  }
}
