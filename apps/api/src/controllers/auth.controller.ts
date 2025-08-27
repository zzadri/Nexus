import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterBodyZ, LoginBodyZ, LoginTotpBodyZ, TotpVerifyBodyZ } from '../schemas/auth.schema.js';
import { AuthService } from '../services/auth.service.js';
import QRCode from 'qrcode';

export class AuthController {
  static async register(req: FastifyRequest, res: FastifyReply) {
    console.log('⚡ Tentative d\'inscription reçue:', req.body);
    console.log('⚡ Headers reçus:', req.headers);
    
    try {
      const { email, password, displayName, csrfToken } = RegisterBodyZ.parse(req.body);
      console.log('⚡ Données d\'inscription validées:', { email, displayName, hasPassword: !!password, csrfToken });

      // Vérifier le token CSRF (header ou body)
      if (!AuthService.verifyCsrfToken(req, csrfToken)) {
        console.error('❌ Échec validation CSRF');
        return res.code(403).send({ error: 'CSRF_TOKEN_INVALID' });
      }
      console.log('✓ Validation CSRF réussie');

      const out = await AuthService.register(email, password, displayName);
      if ('conflict' in out) return res.code(409).send({ error: out.conflict });

      const accessToken = await AuthService.startSession((req as any).server, res, out.user.id, req);

      return {
        success: true,
        accessToken,
        user: {
          id: out.user.id,
          email: out.user.email,
          displayName: out.user.displayName,
          handle: out.user.handle,
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      return res.code(500).send({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }

  static async login(req: FastifyRequest, res: FastifyReply) {
    console.log('⚡ Tentative de connexion reçue:', req.body);
    console.log('⚡ Headers reçus:', req.headers);
    
    try {
      const { email, password, csrfToken } = LoginBodyZ.parse(req.body);
      console.log('⚡ Données de connexion validées:', { email, hasPassword: !!password, csrfToken });

      // Vérifier le token CSRF (header ou body)
      if (!AuthService.verifyCsrfToken(req, csrfToken)) {
        console.error('❌ Échec validation CSRF');
        return res.code(403).send({ error: 'CSRF_TOKEN_INVALID' });
      }
      console.log('✓ Validation CSRF réussie');

      const user = await AuthService.validatePassword(email, password);
      if (!user) return res.code(401).send({ error: 'INVALID_CREDENTIALS' });

      if (user.twoFAEnabled) {
        const mfaToken = AuthService.issueMfaToken(user.id);
        return { mfaRequired: true, mfaToken };
      }

      const accessToken = await AuthService.startSession((req as any).server, res, user.id, req);

      return {
        success: true,
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          handle: user.handle,
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      return res.code(500).send({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }

  static async loginTotp(req: FastifyRequest, res: FastifyReply) {
    try {
      console.log('⚡ Tentative de validation TOTP reçue:', req.body);
      
      const { mfaToken, code } = LoginTotpBodyZ.parse(req.body);
      const payload = AuthService.verifyMfaToken(mfaToken);
      if (!payload) return res.code(401).send({ error: 'MFA_TOKEN_INVALID' });

      const user = await AuthService.getMe(payload.sub);
      if (!user || !user.twoFAEnabled) return res.code(401).send({ error: 'MFA_NOT_SETUP' });

      const u = await (req as any).server.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!u?.twoFASecretEnc) return res.code(401).send({ error: 'MFA_NOT_SETUP' });

      const ok = AuthService.verifyTotp(u.twoFASecretEnc, code);
      if (!ok) return res.code(401).send({ error: 'TOTP_INVALID' });

      const accessToken = await AuthService.startSession((req as any).server, res, payload.sub, req);

      return {
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        handle: user.handle,
      }
    };
    } catch (error) {
      console.error('❌ Erreur lors de la validation TOTP:', error);
      return res.code(500).send({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }

  static async refresh(req: FastifyRequest, res: FastifyReply) {
    const out = await AuthService.rotateRefresh((req as any).server, res, req);
    if ('error' in out) return res.code(401).send({ error: out.error });
    return out;
  }

  static async logout(req: FastifyRequest, res: FastifyReply) {
    return AuthService.logout((req as any).server, res, req);
  }

  static async twoFaSetup(req: any, res: FastifyReply) {
    const user = await (req as any).server.prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.code(404).send({ error: 'NOT_FOUND' });
    const { otpauth } = await AuthService.twoFaSetup(user.id, user.email);
    const qr = await QRCode.toDataURL(otpauth);
    return { otpauth, qr };
  }

  static async twoFaVerify(req: any, res: FastifyReply) {
    const { code } = TotpVerifyBodyZ.parse(req.body);
    const user = await (req as any).server.prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user?.twoFASecretEnc) return res.code(400).send({ error: 'SETUP_FIRST' });
    if (!AuthService.verifyTotp(user.twoFASecretEnc, code)) return res.code(401).send({ error: 'TOTP_INVALID' });
    const { recoveryCodes } = await AuthService.enableTwoFa(req.user.sub);
    return { enabled: true, recoveryCodes };
  }

  static async twoFaDisable(req: any) {
    return AuthService.disableTwoFa(req.user.sub);
  }

  static async me(req: any) {
    const user = await AuthService.getMe(req.user.sub);
    return { user };
  }
}
