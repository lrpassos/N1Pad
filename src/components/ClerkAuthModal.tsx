import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ClerkAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
}

export const ClerkAuthModal: React.FC<ClerkAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  if (!isOpen) return null;

  const handleDemoSignIn = (demoUser: UserProfile) => {
    onLogin(demoUser);
    onClose();
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
      id="clerk-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0b0f19] border border-slate-800/90 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden"
      >
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

        {/* Clerk Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 mb-3 shadow-lg shadow-violet-500/25">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            {isSignUp ? 'Criar conta no The N1Pad' : 'Entrar no The N1Pad'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Autenticação segura e sincronizada com{' '}
            <span className="text-violet-400 font-semibold">Clerk Auth</span>
          </p>
        </div>

        {/* Quick 1-click Demo Accounts */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() =>
              handleDemoSignIn({
                id: 'usr_rogerio',
                name: 'Luiz Rogério',
                email: 'luiz.rogerios@gmail.com',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luiz',
              })
            }
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-violet-500/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Luiz"
                alt="Luiz Rogério"
                className="w-8 h-8 rounded-full ring-1 ring-violet-500/40"
              />
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  Continuar como Luiz Rogério
                </p>
                <p className="text-[10px] text-slate-500">luiz.rogerios@gmail.com</p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-cyan-400 opacity-70 group-hover:opacity-100" />
          </button>

          <button
            onClick={() =>
              handleDemoSignIn({
                id: 'usr_guest_demo',
                name: 'Dev Explorer',
                email: 'developer@n1pad.app',
                avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Explorer',
              })
            }
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800/60 hover:border-cyan-500/40 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=Explorer"
                alt="Dev Explorer"
                className="w-8 h-8 rounded-full ring-1 ring-cyan-500/40"
              />
              <div>
                <p className="text-xs font-semibold text-slate-300 group-hover:text-white">
                  Entrar como Visitante / Dev
                </p>
                <p className="text-[10px] text-slate-500">developer@n1pad.app</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0b0f19] px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            ou com e-mail
          </span>
        </div>

        {/* Email form */}
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Seu Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ana Silva"
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
                placeholder="seu.email@exemplo.com"
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

        {/* Toggle Sign in / Sign up */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>

        {/* Clerk Instructions drawer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowConfigHelp(!showConfigHelp)}
            className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-violet-400" />
              Instruções Clerk Auth no Next.js
            </span>
            <span className="text-[10px] text-cyan-400">{showConfigHelp ? 'Ocultar' : 'Ver'}</span>
          </button>

          {showConfigHelp && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-2 font-mono text-slate-300">
              <p className="text-[10px] text-slate-400 font-sans">
                Para produção em seu Next.js 14 App Router, adicione ao seu <code className="text-cyan-400">.env.local</code>:
              </p>
              <pre className="p-2 rounded bg-[#060911] border border-slate-800 text-[10px] overflow-x-auto text-violet-300">
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...&#10;CLERK_SECRET_KEY=sk_test_...&#10;NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in&#10;NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
