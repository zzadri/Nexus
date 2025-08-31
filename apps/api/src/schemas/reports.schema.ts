import { z } from 'zod';

/** ---------- Zod (runtime) ---------- */
export const CreateReportBodyZ = z.object({
  reason: z.string().min(3).max(500),
  // cible optionnelle : un seul des trois au plus
  postId: z.string().optional(),
  commentId: z.string().optional(),
  groupId: z.string().optional(),
}).refine(
  (d) => !!d.postId || !!d.commentId || !!d.groupId,
  { message: 'At least one target (postId, commentId or groupId) is required' }
);

export type CreateReportBody = z.infer<typeof CreateReportBodyZ>;

export const UpdateReportStatusBodyZ = z.object({
  status: z.enum(['open', 'under_review', 'closed'])
});
export type UpdateReportStatusBody = z.infer<typeof UpdateReportStatusBodyZ>;

export const ListReportsQueryZ = z.object({
  status: z.enum(['open', 'under_review', 'closed']).optional(),
  groupId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListReportsQuery = z.infer<typeof ListReportsQueryZ>;

/** ---------- JSON Schemas (Swagger) ---------- */
export const CreateReportBodySchema = {
  type: 'object',
  required: ['reason'],
  properties: {
    reason: { type: 'string', minLength: 3, maxLength: 500 },
    postId: { type: 'string' },
    commentId: { type: 'string' },
    groupId: { type: 'string' },
  },
} as const;

export const UpdateReportStatusBodySchema = {
  type: 'object',
  required: ['status'],
  properties: { status: { type: 'string', enum: ['open', 'under_review', 'closed'] } }
} as const;

export const ReportSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    reason: { type: 'string' },
    status: { type: 'string', enum: ['open', 'under_review', 'closed'] },
    reporterId: { type: 'string' },
    postId: { type: 'string', nullable: true },
    commentId: { type: 'string', nullable: true },
    groupId: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const ReportResponseSchema = {
  type: 'object',
  properties: { report: ReportSchema }
} as const;

export const ReportsListResponseSchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: ReportSchema },
    page: { type: 'integer' },
    pageSize: { type: 'integer' },
    total: { type: 'integer' },
  }
} as const;
