import Fastify from 'fastify';
import swaggerPlugin from './plugins/swagger';
import security from './plugins/security';
import { csrfGuard } from './middlewares/csrf.js';
import { authRoutes } from './routes/auth.routes.js';
import { uploadsRoutes } from './routes/uploads.routes.js';
import { groupRoutes } from './routes/groups.routes.js';
import { postRoutes } from './routes/posts.routes.js';
import { reportRoutes } from './routes/reports.routes.js';
import { searchRoutes } from './routes/search.routes.js';

const app = Fastify({ logger: true, trustProxy: true });

// core plugins
await app.register(swaggerPlugin);
await app.register(security);
await app.register(csrfGuard);

// auth decorator BEFORE routes
app.decorate('authenticate', async (req: any, res) => {
  try { await req.jwtVerify(); } catch { return res.code(401).send({ error: 'UNAUTHORIZED' }); }
});

// health
app.get('/api/v1/health', async () => ({ ok: true }));

// routes
await app.register(authRoutes);
await app.register(uploadsRoutes);
await app.register(groupRoutes);
await app.register(postRoutes);
await app.register(reportRoutes);
await app.register(searchRoutes);

const port = 3001;
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});