import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;
const hasClerkKeys = Boolean(publishableKey && secretKey);

// Rotas públicas que não exigem redirecionamento imediato
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
]);

export default async function middleware(request: NextRequest, event: any) {
  // Se as chaves do Clerk ainda não foram preenchidas nas variáveis da Vercel,
  // continua normalmente para não derrubar a aplicação com erro 500
  if (!hasClerkKeys) {
    return NextResponse.next();
  }

  try {
    const handler = clerkMiddleware((auth, req) => {
      if (!isPublicRoute(req)) {
        auth().protect();
      }
    });

    return await handler(request, event);
  } catch (error) {
    console.error('Clerk Middleware error na Vercel:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Pula arquivos estáticos do Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Rotas de API
    '/(api|trpc)(.*)',
  ],
};

