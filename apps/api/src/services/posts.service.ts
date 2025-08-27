import { prisma } from '../utils/db.js';

export class PostsService {
  static async create(userId: string, content: string, groupSlug?: string) {
    let groupId: string | null = null;

    if (groupSlug) {
      const g = await prisma.group.findUnique({ where: { slug: groupSlug } });
      if (!g) return { notFound: true as const };

      // Vérifier que l’utilisateur est membre si groupe PRIVATE
      if (g.visibility === 'PRIVATE') {
        const member = await prisma.membership.findUnique({ where: { userId_groupId: { userId, groupId: g.id } } });
        if (!member) return { forbidden: true as const };
      }

      groupId = g.id;
    }

    const post = await prisma.post.create({
      data: { content, authorId: userId, groupId },
    });

    return { post };
  }

  static async list(groupSlug: string | undefined, page: number, pageSize: number, viewerId?: string) {
    let where: any = {};

    if (groupSlug) {
      const g = await prisma.group.findUnique({ where: { slug: groupSlug } });
      if (!g) return { notFound: true as const };

      if (g.visibility === 'PRIVATE') {
        if (!viewerId) return { forbidden: true as const };
        const member = await prisma.membership.findUnique({ where: { userId_groupId: { userId: viewerId, groupId: g.id } } });
        if (!member) return { forbidden: true as const };
      }

      where.groupId = g.id;
    }

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  static async get(postId: string, viewerId?: string) {
    const p = await prisma.post.findUnique({ where: { id: postId } });
    if (!p) return { notFound: true as const };

    if (p.groupId) {
      const g = await prisma.group.findUnique({ where: { id: p.groupId } });
      if (!g) return { notFound: true as const };

      if (g.visibility === 'PRIVATE') {
        if (!viewerId) return { forbidden: true as const };
        const member = await prisma.membership.findUnique({ where: { userId_groupId: { userId: viewerId, groupId: g.id } } });
        if (!member) return { forbidden: true as const };
      }
    }

    return { post: p };
  }
}
