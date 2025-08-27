import { z } from 'zod';

/** ---------- Zod (validation runtime) ---------- */
export const CreatePostBodyZ = z.object({
  content: z.string().min(1).max(2000),
  groupSlug: z.string().optional(),
});
export type CreatePostBody = z.infer<typeof CreatePostBodyZ>;

export const ListPostsQueryZ = z.object({
  groupSlug: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListPostsQuery = z.infer<typeof ListPostsQueryZ>;

/** ---------- JSON Schemas (Swagger) ---------- */
export const CreatePostBodySchema = {
  type: 'object',
  required: ['content'],
  properties: {
    content: { type: 'string', minLength: 1, maxLength: 2000 },
    groupSlug: { type: 'string' },
  },
} as const;

export const PostSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    content: { type: 'string' },
    authorId: { type: 'string' },
    groupId: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const PostResponseSchema = {
  type: 'object',
  properties: { post: PostSchema },
} as const;

export const PostsListResponseSchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: PostSchema },
    page: { type: 'integer' },
    pageSize: { type: 'integer' },
    total: { type: 'integer' },
  },
} as const;

export const NotFoundSchema = { type: 'object', properties: { error: { type: 'string', enum: ['NOT_FOUND'] } } } as const;
export const ForbiddenSchema = { type: 'object', properties: { error: { type: 'string', enum: ['FORBIDDEN'] } } } as const;
