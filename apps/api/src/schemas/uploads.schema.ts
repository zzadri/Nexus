import { z } from 'zod';

/** ---------- Zod (runtime) ---------- */
export const PresignBodyZ = z.object({
  mime: z.string().min(1),
  size: z.number().int().positive().max(50 * 1024 * 1024), // 50MB
  kind: z.enum(['image','video','pdf','file']),
  postId: z.string().optional(),
  groupId: z.string().optional(),
});

export const CompleteBodyZ = z.object({
  key: z.string().min(1),
  bucket: z.string().min(1),
  kind: z.enum(['image','video','pdf','file']),
  size: z.number().int().positive(),
  mimeType: z.string().min(1),
  postId: z.string().optional(),
  groupId: z.string().optional(),
  sha256: z.string().optional(), // hex pre-calculé côté client (optionnel)
});

export type PresignBody = z.infer<typeof PresignBodyZ>;
export type CompleteBody = z.infer<typeof CompleteBodyZ>;

/** ---------- JSON Schemas (Swagger) ---------- */
export const PresignResponseSchema = {
  type: 'object',
  properties: {
    url: { type: 'string' },
    bucket: { type: 'string' },
    key: { type: 'string' },
    headers: {
      type: 'object',
      additionalProperties: { type: 'string' },
      description: 'En-têtes à inclure lors du PUT signé (si fournis)',
    }
  },
} as const;

export const AssetSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    key: { type: 'string' },
    bucket: { type: 'string' },
    kind: { type: 'string', enum: ['image','video','pdf','file'] },
    size: { type: 'integer' },
    mimeType: { type: 'string' },
    uploaderId: { type: 'string' },
    postId: { type: 'string', nullable: true },
    groupId: { type: 'string', nullable: true },
    sha256: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
  }
} as const;

export const AssetResponseSchema = {
  type: 'object',
  properties: { asset: AssetSchema }
} as const;

export const ListResponseSchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: AssetSchema },
    page: { type: 'integer' },
    pageSize: { type: 'integer' },
    total: { type: 'integer' },
  }
} as const;

export const SignedGetUrlResponseSchema = {
  type: 'object',
  properties: {
    url: { type: 'string' },
    expiresIn: { type: 'integer' }
  }
} as const;
