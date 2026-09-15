import { GET, POST } from '@/auth';

/**
 * Handler oficial do NextAuth.js v5 no Next.js 14 App Router
 * Atende a todas as rotas OAuth de callback, signin, signout e csrf
 */
export { GET, POST };

// Força runtime Node.js dinâmico para garantir troca segura de tokens com Google e Microsoft
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
