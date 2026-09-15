import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Ponto de inicialização do Auth.js v5 para Next.js 14+ (App Router)
 * Exporta handlers para a API route, a função auth() para Server Components e Server Actions,
 * e os helpers signIn e signOut.
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias de sessão persistente
  },
  secret: process.env.AUTH_SECRET,
});
