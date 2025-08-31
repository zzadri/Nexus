import { FastifyRequest } from 'fastify';
import { SearchQueryZ } from '../schemas/search.schema.js';
import { SearchService } from '../services/search.service.js';

/**
 * Auth optionnelle :
 * - on essaie de lire le JWT access; si absent/invalid => user = null
 * - évite d'imposer l’auth pour une recherche publique
 */
async function getOptionalUser(req: any) {
  try {
    await req.jwtVerify();
    return { id: req.user.sub as string, role: (req.user.role || 'USER') as 'USER'|'MODERATOR'|'ADMIN'|'OWNER' };
  } catch {
    return null;
  }
}

export class SearchController {
  static async search(req: FastifyRequest) {
    const q = SearchQueryZ.parse((req as any).query ?? {});
    const user = await getOptionalUser(req);
    return SearchService.search(user, q);
  }
}
