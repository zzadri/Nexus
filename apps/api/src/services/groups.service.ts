import { prisma } from '../utils/db.js';
import type { Visibility } from '../schemas/groups.schema.js';

export class GroupsService {
  /** slugify simple */
  static slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  /** garantit l’unicité du slug */
  static async ensureUniqueSlug(base: string) {
    let slug = base;
    for (let i = 1; i < 50; i++) {
      const exists = await prisma.group.findUnique({ where: { slug } });
      if (!exists) return slug;
      slug = `${base}-${i}`;
    }
    throw new Error('Cannot generate unique slug');
  }

  /** crée le groupe + membership OWNER */
  static async create(ownerId: string, name: string, description?: string, visibility: Visibility = 'PRIVATE') {
    const slugBase = this.slugify(name);
    const slug = await this.ensureUniqueSlug(slugBase);
    const group = await prisma.group.create({
      data: { name, slug, description, visibility, createdById: ownerId },
    });
    await prisma.membership.create({
      data: { groupId: group.id, userId: ownerId, role: 'OWNER' as any },
    });
    return group;
  }

  /** liste publique (PUBLIC + UNLISTED), avec recherche/pagination */
  static async listPublic(q: string | undefined, page: number, pageSize: number) {
    const where: any = {
      visibility: { in: ['PUBLIC', 'UNLISTED'] },
    };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.group.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.group.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  /** détail avec protection : PRIVATE visible uniquement aux membres */
  static async getForViewer(slug: string, viewerId?: string) {
    const g = await prisma.group.findUnique({ where: { slug } });
    if (!g) return { notFound: true as const };
    if (g.visibility === 'PRIVATE') {
      if (!viewerId) return { forbidden: true as const };
      const member = await prisma.membership.findUnique({ where: { userId_groupId: { userId: viewerId, groupId: g.id } } });
      if (!member) return { forbidden: true as const };
    }
    return { group: g };
  }

  /** rejoindre (UNLISTED/PUBLIC ou PRIVATE si invitation plus tard — ici on laisse simple) */
  static async join(slug: string, userId: string) {
    const g = await prisma.group.findUnique({ where: { slug } });
    if (!g) return { notFound: true as const };
    const existing = await prisma.membership.findUnique({ where: { userId_groupId: { userId, groupId: g.id } } });
    if (existing) return { conflict: 'ALREADY_MEMBER' as const };

    // si PRIVATE on bloque (un flux d’invitation pourra lever ce verrou plus tard)
    if (g.visibility === 'PRIVATE') return { forbidden: true as const };

    await prisma.membership.create({ data: { userId, groupId: g.id, role: 'MEMBER' as any } });
    return { ok: true as const, groupId: g.id };
  }

  /** quitter (OWNER ne peut pas quitter s’il est seul owner — simplifié: on autorise si >1 members OWNER) */
  static async leave(slug: string, userId: string) {
    const g = await prisma.group.findUnique({ where: { slug } });
    if (!g) return { notFound: true as const };

    const m = await prisma.membership.findUnique({ where: { userId_groupId: { userId, groupId: g.id } } });
    if (!m) return { notFound: true as const };

    // protection basique: si OWNER unique → refuse (optionnel, simplifié)
    if (m.role === 'OWNER') {
      const owners = await prisma.membership.count({ where: { groupId: g.id, role: 'OWNER' as any } });
      if (owners <= 1) return { forbidden: true as const };
    }

    await prisma.membership.delete({ where: { userId_groupId: { userId, groupId: g.id } } });
    return { ok: true as const };
  }
}
