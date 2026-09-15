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
  return (
    <ClerkProvider
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
      <html lang="pt-BR" className="dark">
        <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
