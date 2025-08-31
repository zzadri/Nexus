import { z } from 'zod';

/** ---------- Zod (validation runtime) ---------- */
export const VisibilityEnum = z.enum(['PRIVATE', 'UNLISTED', 'PUBLIC']);
export type Visibility = z.infer<typeof VisibilityEnum>;

export const CreateGroupBodyZ = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  visibility: VisibilityEnum.default('PRIVATE'),
});
export type CreateGroupBody = z.infer<typeof CreateGroupBodyZ>;

export const ListGroupsQueryZ = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListGroupsQuery = z.infer<typeof ListGroupsQueryZ>;

/** ---------- JSON Schemas (Swagger) ---------- */
export const CreateGroupBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 2 },
    description: { type: 'string' },
    visibility: { type: 'string', enum: ['PRIVATE', 'UNLISTED', 'PUBLIC'], default: 'PRIVATE' },
  },
} as const;

export const GroupSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    slug: { type: 'string' },
    description: { type: 'string', nullable: true },
    visibility: { type: 'string', enum: ['PRIVATE', 'UNLISTED', 'PUBLIC'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const GroupResponseSchema = {
  type: 'object',
  properties: { group: GroupSchema },
} as const;

export const GroupsListResponseSchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: GroupSchema },
    page: { type: 'integer' },
    pageSize: { type: 'integer' },
    total: { type: 'integer' },
  },
} as const;

export const BasicOkSchema = { type: 'object', properties: { ok: { type: 'boolean' } } } as const;
export const NotFoundSchema = { type: 'object', properties: { error: { type: 'string', enum: ['NOT_FOUND'] } } } as const;
export const ForbiddenSchema = { type: 'object', properties: { error: { type: 'string', enum: ['FORBIDDEN'] } } } as const;
export const ConflictSchema = { type: 'object', properties: { error: { type: 'string', enum: ['ALREADY_MEMBER'] } } } as const;
