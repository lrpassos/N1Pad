import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import './globals.css';

export const metadata: Metadata = {
  title: 'The N1Pad — Bloco de Notas Visual',
  description: 'Bloco de notas visual moderno e minimalista com suporte a anotações em imagens e autenticação Clerk.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200">
        {!publishableKey && (
          <div className="bg-gradient-to-r from-violet-900/60 via-indigo-900/40 to-cyan-900/60 border-b border-violet-500/30 px-4 py-2 text-center text-xs text-violet-200 flex items-center justify-center gap-2">
            <span>🔑 Dica Vercel: Adicione <code className="bg-slate-900/80 px-1.5 py-0.5 rounded text-cyan-300 font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> e <code className="bg-slate-900/80 px-1.5 py-0.5 rounded text-cyan-300 font-mono">CLERK_SECRET_KEY</code> nas Environment Variables da Vercel.</span>
          </div>
        )}
        {children}
      </body>
    </html>
  );

  if (!publishableKey) {
    return content;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#8b5cf6',
          colorBackground: '#090d16',
          colorInputBackground: '#0f172a',
          colorText: '#f8fafc',
        },
        elements: {
          card: 'border border-slate-800 bg-[#090d16] shadow-2xl rounded-3xl',
          formButtonPrimary: 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold rounded-xl',
        },
      }}
    >
      {content}
    </ClerkProvider>
  );
}
