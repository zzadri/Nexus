import { prisma } from '../utils/db.js';
import type { SearchQuery } from '../schemas/search.schema.js';

type UserCtx = { id: string; role: 'USER'|'MODERATOR'|'ADMIN'|'OWNER' } | null;

export class SearchService {
  /**
   * Règles d’accès :
   * - Non connecté : uniquement posts VISIBILITY = PUBLIC
   * - Connecté : PUBLIC + ses propres posts + posts des groupes où il est membre (même PRIVATE)
   * - Filtre groupId optionnel : si non membre et groupe privé => seuls PUBLIC ressortent
   */
  static async search(user: UserCtx, q: SearchQuery) {
    const { tag, groupId, authorId, kind, page, pageSize, sort } = q;
    const text = q.q;

    // base where
    const where: any = { };
    if (kind) where.kind = kind;
    if (authorId) where.authorId = authorId;
    if (text) {
      // MVP: LIKE-insensitive (FTS Postgres en itération)
      where.OR = [
        { title: { contains: text, mode: 'insensitive' } },
        { content: { contains: text, mode: 'insensitive' } },
      ];
    }
    if (tag) {
      where.tags = { some: { tag: { label: tag } } };
    }
    if (groupId) where.groupId = groupId;

    // Visibilité selon contexte
    if (!user) {
      // public only
      where.visibility = 'PUBLIC';
    } else {
      // PUBLIC or my posts or posts in my groups
      // Prisma ne permet pas d'exprimer facilement "group in my memberships" sans sous-requête;
      // Approche: si groupId précisé, on teste membership; sinon on combine OR générique.
      const publicOrMine: any[] = [
        { visibility: 'PUBLIC' },
        { authorId: user.id },
      ];

      if (groupId) {
        const member = await prisma.membership.findUnique({
          where: { userId_groupId: { userId: user.id, groupId } },
          select: { id: true },
        });
        if (member) {
          // accès à tout dans ce groupe
          // pas besoin d’ajouter une clause, le filtre groupId + where existant suffit
        } else {
          // pas membre: restreindre à PUBLIC dans ce groupe
          where.visibility = 'PUBLIC';
        }
      } else {
        // sans groupId: autoriser aussi les posts des groupes où je suis membre
        const myGroups = await prisma.membership.findMany({
          where: { userId: user.id },
          select: { groupId: true },
        });
        if (myGroups.length) {
          publicOrMine.push({ groupId: { in: myGroups.map(g => g.groupId) } });
        }
        where.AND = [{ OR: publicOrMine }];
      }
    }

    const orderBy = sort === 'old' ? { createdAt: 'asc' as const } : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, title: true, slug: true, kind: true, visibility: true, groupId: true,
          authorId: true, createdAt: true,
          author: { select: { id: true, displayName: true, handle: true, avatarUrl: true } },
        }
      }),
      prisma.post.count({ where })
    ]);

    return { items, total, page, pageSize };
  }
}
