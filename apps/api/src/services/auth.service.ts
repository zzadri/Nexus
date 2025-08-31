import * as jwt from 'jsonwebtoken';
import { env } from '../env.js';
import { prisma } from '../utils/db.js';
import { hashPassword, verifyPassword, randomToken, sha256, encrypt, decrypt } from '../utils/crypto.js';
import { authenticator } from 'otplib';
import { FastifyRequest } from 'fastify';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

export class AuthService {
  static verifyCsrfToken(req: FastifyRequest, csrfToken?: string): boolean {
    const cookieToken = req.cookies?.[env.CSRF_COOKIE_NAME];
    const headerToken = req.headers['x-csrf-token'] as string | undefined;

    // Si un token est fourni dans le corps de la requête, on le vérifie d'abord (pour compatibilité)
    if (csrfToken && cookieToken === csrfToken) {
      return true;
    }

    // Sinon, on vérifie le header X-CSRF-TOKEN
    return cookieToken === headerToken;
  }

  static async register(email: string, password: string, displayName: string) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return { conflict: 'EMAIL_IN_USE' as const };

    const passwordHash = await hashPassword(password);
    const handle = email.split('@')[0].replace(/[^a-z0-9_\-]/gi, '').toLowerCase();

    const user = await prisma.user.create({ data: { email, passwordHash, displayName, handle } });
    return { user };
  }

  static async validatePassword(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return null;
    const ok = await verifyPassword(user.passwordHash, password);
    return ok ? user : null;
  }

  static issueMfaToken(userId: string) {
    return (jwt as any).sign({ sub: userId }, env.MFA_TOKEN_SECRET, { expiresIn: '5m' });
  }

  static verifyMfaToken(token: string) {
    try { return (jwt as any).verify(token, env.MFA_TOKEN_SECRET) as { sub: string }; }
    catch { return null; }
  }

  static async startSession(app: any, res: any, userId: string, req: any) {
    const access = app.issueAccess({ id: userId, role: 'USER' });
    const refresh = randomToken(48);
    const hash = sha256(refresh);
    const ua = req.headers['user-agent'];
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await prisma.session.create({ data: { userId, refreshTokenHash: hash, userAgent: ua, ip, expiresAt } });

    res.setCookie(ACCESS_COOKIE, access, { ...app.cookieBase, maxAge: 60 * 10 });                   // 10 min
    res.setCookie(REFRESH_COOKIE, refresh, { ...app.cookieBase, maxAge: 60 * 60 * 24 * 30 });       // 30 j

    return access; // Retourner le token d'accès
  }

  static clearSession(app: any, res: any) {
    res.setCookie(ACCESS_COOKIE, '', { ...app.cookieBase, maxAge: 0 });
    res.setCookie(REFRESH_COOKIE, '', { ...app.cookieBase, maxAge: 0 });
  }

  static async rotateRefresh(app: any, res: any, req: any) {
    const rt = req.cookies[REFRESH_COOKIE];
    if (!rt) return { error: 'NO_REFRESH' as const };
    const hash = sha256(rt);
    const session = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
    if (!session || session.expiresAt < new Date()) return { error: 'REFRESH_INVALID' as const };
    await prisma.session.delete({ where: { id: session.id } });
    await this.startSession(app, res, session.userId, req);
    return { ok: true as const };
  }

  static async logout(app: any, res: any, req: any) {
    const rt = req.cookies[REFRESH_COOKIE];
    if (rt) {
      const hash = sha256(rt);
      await prisma.session.deleteMany({ where: { refreshTokenHash: hash } });
    }
    this.clearSession(app, res);
    return { ok: true as const };
  }

  static async twoFaSetup(userId: string, email: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, 'IT-Community', secret);
    await prisma.user.update({ where: { id: userId }, data: { twoFASecretEnc: encrypt(secret) } });
    return { otpauth, secret };
  }

  static verifyTotp(secretEnc: string, code: string) {
    const secret = decrypt(secretEnc);
    return authenticator.verify({ token: code, secret });
  }

  static async enableTwoFa(userId: string) {
    const codes = Array.from({ length: 8 }, () => randomToken(10));
    const hashes = codes.map(sha256);
    await prisma.user.update({ where: { id: userId }, data: { twoFAEnabled: true, twoFARecoveryHashes: hashes } });
    return { recoveryCodes: codes };
  }

  static async disableTwoFa(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { twoFAEnabled: false, twoFASecretEnc: null, twoFARecoveryHashes: [] } });
    return { ok: true as const };
  }

  static getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, handle: true, role: true, twoFAEnabled: true, avatarUrl: true }
    });
  }
}
