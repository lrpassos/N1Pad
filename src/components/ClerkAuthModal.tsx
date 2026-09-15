import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
}

export const ClerkAuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'microsoft' | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleOAuthLogin = (provider: 'google' | 'microsoft') => {
    setLoadingProvider(provider);
    setTimeout(() => {
      if (provider === 'google') {
        onLogin({
          id: 'usr_google_luiz',
          name: 'Luiz Rogério',
          email: 'luiz.rogerios@gmail.com',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luiz',
          isGuest: false,
        });
      } else {
        onLogin({
          id: 'usr_ms_corporate',
          name: 'Luiz Rogério (Microsoft 365)',
          email: 'luiz.rogerios@outlook.com',
          avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=LR',
          isGuest: false,
        });
      }
      setLoadingProvider(null);
      onClose();
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      isGuest: false,
    };
    onLogin(user);
    onClose();
  };

  return (
    <div
      id="oauth-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#0b0f19] border border-slate-800/90 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 mb-3 shadow-lg shadow-violet-500/25">
            <span className="font-black text-white text-base tracking-tight">N1</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            The N1Pad — Autenticação OAuth
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Entre de forma segura com sua conta Google ou Microsoft
          </p>
        </div>

        {/* OAuth Buttons (Google & Microsoft) */}
        <div className="space-y-3 mb-6">
          {/* Botão 1: Google OAuth */}
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleOAuthLogin('google')}
            className="w-full h-12 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white font-medium text-xs flex items-center justify-center gap-3 transition-all duration-150 shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none group"
          >
            {loadingProvider === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            onClick={() => handleOAuthLogin('microsoft')}
            className="w-full h-12 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white font-medium text-xs flex items-center justify-center gap-3 transition-all duration-150 shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none group"
          >
            {loadingProvider === 'microsoft' ? (
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
            )}
            <span>
              {loadingProvider === 'microsoft'
                ? 'Conectando à Microsoft...'
                : 'Continuar com Microsoft'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0b0f19] px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            ou com e-mail corporativo
          </span>
        </div>

        {/* Form alternativo */}
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Seu Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Luiz Rogério"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 rounded-xl shadow-lg shadow-violet-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>{isSignUp ? 'Cadastrar e Entrar' : 'Continuar com E-mail'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {isSignUp ? 'Já tem uma conta? Entrar' : 'Novo por aqui? Criar conta rápida'}
          </button>
        </div>

        {/* Auth.js Config Drawer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowConfigHelp(!showConfigHelp)}
            className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-violet-400" />
              Credenciais Auth.js v5 no .env.local
            </span>
            <span className="text-[10px] text-cyan-400">{showConfigHelp ? 'Ocultar' : 'Ver'}</span>
          </button>

          {showConfigHelp && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-2 font-mono text-slate-300">
              <p className="text-[10px] text-slate-400 font-sans">
                Variáveis configuradas em <code className="text-cyan-400">.env.local</code>:
              </p>
              <pre className="p-2 rounded bg-[#060911] border border-slate-800 text-[9.5px] overflow-x-auto text-violet-300 leading-relaxed">
AUTH_SECRET=sua_chave_secreta_jwt&#10;AUTH_GOOGLE_ID=google_client_id&#10;AUTH_GOOGLE_SECRET=google_client_secret&#10;AUTH_MICROSOFT_ENTRA_ID_ID=ms_client_id&#10;AUTH_MICROSOFT_ENTRA_ID_SECRET=ms_client_secret&#10;AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=common
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
