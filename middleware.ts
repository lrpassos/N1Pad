import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Middleware de Autenticação Auth.js v5 (Next.js 14+ App Router)
 * Protege todas as rotas de anotações e dashboard do The N1Pad,
 * redirecionando acessos não autenticados diretamente para a página de login (/login).
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Executa o middleware em todas as páginas, exceto assets estáticos e rotas internas
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
