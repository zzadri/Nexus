import { z } from 'zod';

/** Zod côté runtime + JSON Schema pour Swagger */
export const EmailZ = z.string().email().transform((e) => e.toLowerCase());
export const PasswordZ = z.string().min(12);

export const RegisterBodyZ = z.object({
  email: EmailZ,
  password: PasswordZ,
  confirmPassword: PasswordZ,
  displayName: z.string().min(1),
  csrfToken: z.string().min(1).optional(), // Rendu optionnel pour permettre l'utilisation via header
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});
export type RegisterBody = z.infer<typeof RegisterBodyZ>;

export const LoginBodyZ = z.object({
  email: EmailZ,
  password: z.string().min(1),
  csrfToken: z.string().min(1).optional(), // Rendu optionnel pour permettre l'utilisation via header
});
export type LoginBody = z.infer<typeof LoginBodyZ>;

export const LoginTotpBodyZ = z.object({
  mfaToken: z.string(),
  code: z.string().min(6).max(6),
});
export type LoginTotpBody = z.infer<typeof LoginTotpBodyZ>;

export const TotpVerifyBodyZ = z.object({
  code: z.string().min(6).max(6),
});
export type TotpVerifyBody = z.infer<typeof TotpVerifyBodyZ>;

/** JSON Schemas (Swagger/OpenAPI) */
export const RegisterBodySchema = {
  type: 'object',
  required: ['email', 'password', 'confirmPassword', 'displayName'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 12 },
    confirmPassword: { type: 'string', minLength: 12 },
    displayName: { type: 'string', minLength: 1 },
    csrfToken: { type: 'string', minLength: 1, description: 'Optional - can be provided in X-CSRF-TOKEN header instead' },
  },
} as const;

export const LoginBodySchema = {
  type: 'object',
  required: ['email','password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
    csrfToken: { type: 'string', minLength: 1, description: 'Optional - can be provided in X-CSRF-TOKEN header instead' },
  },
} as const;

export const LoginTotpBodySchema = {
  type: 'object',
  required: ['mfaToken','code'],
  properties: {
    mfaToken: { type: 'string' },
    code: { type: 'string', minLength: 6, maxLength: 6 },
  },
} as const;

export const TotpVerifyBodySchema = {
  type: 'object',
  required: ['code'],
  properties: { code: { type: 'string', minLength: 6, maxLength: 6 } },
} as const;

export const OkResponse = { type: 'object', properties: { ok: { type: 'boolean' } } } as const;

export const AuthSuccessResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    accessToken: { type: 'string' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        displayName: { type: 'string' },
        handle: { type: 'string' },
      }
    }
  }
} as const;

export const Login200Schema = {
  oneOf: [
    AuthSuccessResponse,
    {
      type: 'object',
      properties: { mfaRequired: { type: 'boolean' }, mfaToken: { type: 'string' } }
    }
  ]
} as const;

export const MeResponseSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        displayName: { type: 'string' },
        handle: { type: 'string' },
        role: { type: 'string' },
        twoFAEnabled: { type: 'boolean' },
        avatarUrl: { type: 'string', nullable: true },
      }
    }
  }
} as const;
