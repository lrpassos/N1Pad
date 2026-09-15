import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

/**
 * Configuração Edge-compatible do Auth.js v5 (NextAuth.js v5)
 * Usada tanto no Middleware quanto no runtime Node.js do Next.js 14+
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    /**
     * Controle de acesso para rotas protegidas no middleware
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isPublicRoute =
        nextUrl.pathname.startsWith('/api/auth') ||
        nextUrl.pathname.startsWith('/_next') ||
        nextUrl.pathname.includes('.');

      if (isPublicRoute) return true;

      // Se já estiver logado e tentar acessar /login, redireciona para a home
      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      // Bloqueia acesso e redireciona para /login caso não esteja autenticado
      return isLoggedIn;
    },

    /**
     * Persiste os dados adicionais no token JWT
     */
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    /**
     * Expõe o ID, e-mail, nome e imagem na sessão para Client e Server Components
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    // 1. Provedor Google OAuth 2.0
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
    }),

    // 2. Provedor Microsoft Entra ID (Azure AD)
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID || 'common',
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
  ],
} satisfies NextAuthConfig;
