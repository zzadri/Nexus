import { FastifyRequest } from 'fastify';
import { PresignBodyZ, CompleteBodyZ } from '../schemas/uploads.schema.js';
import { UploadsService } from '../services/uploads.service.js';

export class UploadsController {
  static async presign(req: FastifyRequest) {
    const userId = (req as any).user.sub as string;
    const body = PresignBodyZ.parse((req as any).body);
    return UploadsService.presignPut(userId, body);
  }

  static async complete(req: FastifyRequest) {
    const userId = (req as any).user.sub as string;
    const body = CompleteBodyZ.parse((req as any).body);
    return UploadsService.complete(userId, body);
  }

  static async getOne(req: FastifyRequest) {
    const userId = (req as any).user.sub as string;
    const { id } = (req as any).params as { id: string };
    const data = await UploadsService.getOne(userId, id);
    if (!data) return { error: 'NOT_FOUND' };
    return data;
  }

  static async list(req: FastifyRequest) {
    const userId = (req as any).user.sub as string;
    const { page = '1', pageSize = '20' } = (req as any).query ?? {};
    return UploadsService.list(userId, Number(page), Number(pageSize));
  }

  static async signedUrl(req: FastifyRequest) {
    const userId = (req as any).user.sub as string;
    const { id } = (req as any).params as { id: string };
    const data = await UploadsService.signedGetUrl(userId, id, 300);
    if (!data) return { error: 'NOT_FOUND_OR_FORBIDDEN' };
    return data;
  }

  static async remove(req: FastifyRequest) {
    const userId = (req as any).user.sub as string;
    const { id } = (req as any).params as { id: string };
    try {
      const ok = await UploadsService.remove(userId, id);
      if (!ok) return { error: 'NOT_FOUND' };
      return { ok: true };
    } catch (e: any) {
      if (e?.message === 'FORBIDDEN') return { error: 'FORBIDDEN' };
      throw e;
    }
  }
}
