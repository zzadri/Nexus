// Schémas d'erreurs communs (Swagger JSON Schemas)
export const NotFoundSchema = {
  type: 'object',
  properties: { error: { type: 'string', enum: ['NOT_FOUND'] } }
} as const;

export const ForbiddenSchema = {
  type: 'object',
  properties: { error: { type: 'string', enum: ['FORBIDDEN'] } }
} as const;

export const UnauthorizedSchema = {
  type: 'object',
  properties: { error: { type: 'string', enum: ['UNAUTHORIZED'] } }
} as const;

export const BadRequestSchema = {
  type: 'object',
  properties: { error: { type: 'string', enum: ['BAD_REQUEST'] } }
} as const;
