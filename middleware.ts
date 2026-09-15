import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Definição de rotas públicas (Login, Cadastro e APIs públicas)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    // Protege todas as rotas de anotações do The N1Pad
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Pula arquivos estáticos internos do Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Garante execução em rotas de API
    '/(api|trpc)(.*)',
  ],
};
