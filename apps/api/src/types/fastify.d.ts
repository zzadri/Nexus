import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: any, res: any) => Promise<void>;
    issueAccess: (user: { id: string; role: string }) => string;
    cookieBase: {
      httpOnly: boolean;
      sameSite: 'strict';
      path: '/';
      secure: boolean;
      domain?: string;
    };
  }

  interface FastifyRequest {
    user?: { sub: string; role?: string } & Record<string, any>;
  }
}
