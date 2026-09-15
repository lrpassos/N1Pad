'use client';

import React, { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { LogOut, User, Sparkles, ChevronDown, Check, Shield } from 'lucide-react';

interface UserNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserNav({ user: propUser }: UserNavProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = propUser || session?.user;

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return null;
  }

  const initials = currentUser.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de Trigger com Avatar */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1 pr-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/70 hover:border-slate-600 transition-all text-left group"
        aria-label="Menu do usuário"
      >
        {currentUser.image ? (
          <img
            src={currentUser.image}
            alt={currentUser.name || 'Avatar'}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-violet-500/40"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold ring-1 ring-violet-500/40">
            {initials}
          </div>
        )}

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-medium text-slate-200 group-hover:text-white max-w-[120px] truncate leading-tight">
            {currentUser.name || 'Usuário'}
          </span>
          <span className="text-[10px] text-slate-400 max-w-[120px] truncate leading-tight">
            {currentUser.email || ''}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200" />
      </button>

      {/* Dropdown Menu Glassmorphism */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-slate-800 rounded-xl p-2 shadow-2xl shadow-black/80 backdrop-blur-xl z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Informações detalhadas do usuário */}
          <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser.name || 'Usuário Conectado'}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {currentUser.email || 'Sem e-mail'}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sessão OAuth Ativa</span>
            </div>
          </div>

          {/* Botão de Logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      )}
    </div>
  );
}
