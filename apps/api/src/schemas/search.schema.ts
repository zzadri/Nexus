import { z } from 'zod';

/** ---------- Zod (runtime) ---------- */
export const SearchQueryZ = z.object({
  q: z.string().trim().min(1).optional(),
  tag: z.string().trim().optional(),
  groupId: z.string().optional(),
  authorId: z.string().optional(),
  kind: z.enum(['doc', 'video', 'note', 'link', 'file']).optional(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).optional(), // for admin tools; public-only by défaut côté service
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(['new', 'old']).default('new') // (top à venir quand les métriques seront prêtes)
});

export type SearchQuery = z.infer<typeof SearchQueryZ>;

/** ---------- JSON Schemas (Swagger) ---------- */
export const SearchResponseSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          kind: { type: 'string', enum: ['doc','video','note','link','file'] },
          visibility: { type: 'string', enum: ['PUBLIC','UNLISTED','PRIVATE'] },
          groupId: { type: 'string', nullable: true },
          authorId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              displayName: { type: 'string' },
              handle: { type: 'string' },
              avatarUrl: { type: 'string', nullable: true },
            }
          }
        }
      }
    },
    page: { type: 'integer' },
    pageSize: { type: 'integer' },
    total: { type: 'integer' },
  }
} as const;
