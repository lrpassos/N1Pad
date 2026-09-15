'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'microsoft' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: 'google' | 'microsoft-entra-id') => {
    try {
      setErrorMessage(null);
      setLoadingProvider(provider === 'google' ? 'google' : 'microsoft');
      await signIn(provider, {
        callbackUrl: '/',
      });
    } catch (error) {
      console.error('Falha ao autenticar com provedor OAuth:', error);
      setErrorMessage('Não foi possível iniciar a sessão. Verifique suas credenciais e tente novamente.');
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Luzes difusas de ambiente no estilo The N1Pad */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-[96px] pointer-events-none" />

      {/* Card Principal Glassmorphism */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/70 border border-slate-800/80 rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl">
        
        {/* Header com Logo The N1Pad */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/25 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-violet-400 to-cyan-300 text-lg">
                N1
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            The N1Pad
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Anotações visuais ultrarrápidas e marcação de imagens
          </p>
        </div>

        {/* Mensagem de Erro Caso Ocorra */}
        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMessage}
          </div>
        )}

        {/* Ações de Login OAuth */}
        <div className="space-y-3.5">
          {/* Botão 1: Google OAuth */}
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleOAuthSignIn('google')}
            className="w-full h-12 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none group"
          >
            {loadingProvider === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.24A11.98 11.98 0 0 0 0 12c0 1.92.45 3.74 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>
              {loadingProvider === 'google' ? 'Conectando ao Google...' : 'Continuar com Google'}
            </span>
          </button>

          {/* Botão 2: Microsoft OAuth */}
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleOAuthSignIn('microsoft-entra-id')}
            className="w-full h-12 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none group"
          >
            {loadingProvider === 'microsoft' ? (
              <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
            )}
            <span>
              {loadingProvider === 'microsoft' ? 'Conectando à Microsoft...' : 'Continuar com Microsoft'}
            </span>
          </button>
        </div>

        {/* Rodapé de Segurança */}
        <div className="mt-8 pt-6 border-t border-slate-800/70 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Autenticação OAuth 2.0 segura via Auth.js v5</span>
        </div>
      </div>
    </div>
  );
}
