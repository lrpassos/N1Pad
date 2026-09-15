// =====================================================================
// The N1Pad — Arquivo de Referência do Middleware do Next.js 14+ (Clerk Auth)
// =====================================================================
// Use este arquivo caso decida converter o projeto para um Next.js puro.
// Para usar no Next.js:
// 1. Instale o pacote: npm install @clerk/nextjs
// 2. Renomeie este arquivo para /middleware.ts na raiz do seu projeto Next.js
// 3. Configure as variáveis NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY e CLERK_SECRET_KEY na Vercel

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
