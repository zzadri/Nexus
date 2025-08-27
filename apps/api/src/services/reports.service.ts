import { prisma } from '../utils/db.js';

type UserCtx = { id: string; role: 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER' };

export class ReportsService {
  /** Créer un report (ouvert par défaut) */
  static async create(reporterId: string, payload: { reason: string; postId?: string; commentId?: string; groupId?: string }) {
    const { reason, postId, commentId, groupId } = payload;

    // Si postId ou commentId fournis, on vérifie qu'ils existent (sinon 404)
    if (postId) {
      const p = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
      if (!p) return { notFound: true as const };
    }
    if (commentId) {
      const c = await prisma.comment.findUnique({ where: { id: commentId }, select: { id: true } });
      if (!c) return { notFound: true as const };
    }
    if (groupId) {
      const g = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });
      if (!g) return { notFound: true as const };
    }

    const report = await prisma.report.create({
      data: { reason, reporterId, postId: postId ?? null, commentId: commentId ?? null, groupId: groupId ?? null }
    });

    return { report };
  }

  /** Vérifie si l’utilisateur peut modérer un report donné */
  static async canModerate(user: UserCtx, reportId: string) {
    if (user.role === 'ADMIN' || user.role === 'MODERATOR') return true;

    // Si report rattaché à un groupe, un OWNER/ADMIN du groupe peut modérer
    const r = await prisma.report.findUnique({ where: { id: reportId }, select: { groupId: true } });
    if (!r || !r.groupId) return false;

    const m = await prisma.membership.findUnique({
      where: { userId_groupId: { userId: user.id, groupId: r.groupId } },
      select: { role: true }
    });
    return !!m && (m.role === 'OWNER' || m.role === 'ADMIN');
  }

  /** Liste paginée, filtrable par status et groupId selon permissions */
  static async list(user: UserCtx, opts: { status?: 'open' | 'under_review' | 'closed'; groupId?: string; page: number; pageSize: number }) {
    const { status, groupId, page, pageSize } = opts;

    const where: any = {};
    if (status) where.status = status;

    if (groupId) {
      // accès réservé: global staff ou staff du groupe
      const can =
        user.role === 'ADMIN' || user.role === 'MODERATOR' ||
        !!(await prisma.membership.findUnique({
          where: { userId_groupId: { userId: user.id, groupId } },
          select: { role: true }
        }))?.role;
      if (!can) return { forbidden: true as const };
      where.groupId = groupId;
    } else {
      // sans filtre de groupe : seulement MOD/ADMIN
      if (!(user.role === 'ADMIN' || user.role === 'MODERATOR')) return { forbidden: true as const };
    }

    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.report.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /** Mettre à jour le status (permissions requises) */
  static async updateStatus(user: UserCtx, reportId: string, status: 'open'|'under_review'|'closed') {
    const exists = await prisma.report.findUnique({ where: { id: reportId }, select: { id: true } });
    if (!exists) return { notFound: true as const };

    const allowed = await this.canModerate(user, reportId);
    if (!allowed) return { forbidden: true as const };

    const report = await prisma.report.update({ where: { id: reportId }, data: { status } });
    return { report };
  }

  /** Récupérer 1 report (permissions) */
  static async get(user: UserCtx, reportId: string) {
    const r = await prisma.report.findUnique({ where: { id: reportId } });
    if (!r) return { notFound: true as const };

    if (r.groupId) {
      const can =
        user.role === 'ADMIN' || user.role === 'MODERATOR' ||
        !!(await prisma.membership.findUnique({
          where: { userId_groupId: { userId: user.id, groupId: r.groupId } },
          select: { role: true }
        }))?.role;
      if (!can) return { forbidden: true as const };
    } else {
      // Report hors groupe => MOD/ADMIN uniquement
      if (!(user.role === 'ADMIN' || user.role === 'MODERATOR')) return { forbidden: true as const };
    }

    return { report: r };
  }
}
