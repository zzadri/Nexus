import { FastifyPluginAsync } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { RegisterBodySchema, LoginBodySchema, LoginTotpBodySchema, TotpVerifyBodySchema, OkResponse, Login200Schema, MeResponseSchema, AuthSuccessResponse } from '../schemas/auth.schema.js';

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/v1/auth/register', {
    schema: {
      tags: ['Auth'], summary: 'Inscription (email + mot de passe)', operationId: 'register',
      body: RegisterBodySchema, response: { 200: AuthSuccessResponse, 409: { type: 'object', properties: { error: { type: 'string', enum: ['EMAIL_IN_USE'] } } } },
      security: [{ CsrfHeader: [] }]
    }
  }, AuthController.register);

  app.post('/api/v1/auth/login', {
    schema: {
      tags: ['Auth'], summary: 'Connexion', operationId: 'login',
      body: LoginBodySchema, response: { 200: Login200Schema, 401: { type: 'object', properties: { error: { type: 'string', enum: ['INVALID_CREDENTIALS'] } } } },
      security: [{ CsrfHeader: [] }]
    }
  }, AuthController.login);

  app.post('/api/v1/auth/login/totp', {
    schema: {
      tags: ['Auth'], summary: 'Validation TOTP', operationId: 'loginTotp',
      body: LoginTotpBodySchema, response: { 200: AuthSuccessResponse, 401: { type: 'object', properties: { error: { type: 'string', enum: ['MFA_TOKEN_INVALID','MFA_NOT_SETUP','TOTP_INVALID'] } } } },
      security: [{ CsrfHeader: [] }]
    }
  }, AuthController.loginTotp);

  app.post('/api/v1/auth/refresh', {
    schema: {
      tags: ['Auth'], summary: 'Rotation du refresh', operationId: 'refresh',
      response: { 200: OkResponse, 401: { type: 'object', properties: { error: { type: 'string', enum: ['NO_REFRESH','REFRESH_INVALID'] } } } },
      security: [{ CsrfHeader: [] }]
    }
  }, AuthController.refresh);

  app.post('/api/v1/auth/logout', {
    schema: { tags: ['Auth'], summary: 'Déconnexion', operationId: 'logout', response: { 200: OkResponse } }
  }, AuthController.logout);

  app.post('/api/v1/auth/2fa/setup', {
    preHandler: [app.authenticate as any],
    schema: {
      tags: ['Auth'], summary: 'Init 2FA TOTP (QR)', operationId: 'twoFaSetup',
      response: { 200: { type: 'object', properties: { otpauth: { type: 'string' }, qr: { type: 'string' } } } }
    }
  }, AuthController.twoFaSetup);

  app.post('/api/v1/auth/2fa/verify', {
    preHandler: [app.authenticate as any],
    schema: {
      tags: ['Auth'], summary: 'Active 2FA (vérifie le code, renvoie recovery codes)', operationId: 'twoFaVerify',
      body: TotpVerifyBodySchema, response: { 200: { type: 'object', properties: { enabled: { type: 'boolean' }, recoveryCodes: { type: 'array', items: { type: 'string' } } } } }
    }
  }, AuthController.twoFaVerify);

  app.delete('/api/v1/auth/2fa', {
    preHandler: [app.authenticate as any],
    schema: { tags: ['Auth'], summary: 'Désactive 2FA', operationId: 'twoFaDisable', response: { 200: OkResponse } }
  }, AuthController.twoFaDisable);

  app.get('/api/v1/me', {
    preHandler: [app.authenticate as any],
    schema: { tags: ['Users'], summary: 'Profil courant', operationId: 'getMe', response: { 200: MeResponseSchema } }
  }, AuthController.me);
};
