import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, ShieldCheck, ChevronDown } from 'lucide-react';
import { UserProfile } from '../types';

interface UserNavProps {
  user: UserProfile;
  onSignOut: () => void;
  onOpenAuthModal: () => void;
}

export const UserNav: React.FC<UserNavProps> = ({
  user,
  onSignOut,
  onOpenAuthModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button com Avatar e Nome */}
      <button
        id="btn-user-nav"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/70 hover:border-slate-600 transition-all text-left group"
        aria-label="Menu do usuário"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
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
            {user.name || 'Usuário'}
          </span>
          <span className="text-[10px] text-slate-400 max-w-[120px] truncate leading-tight">
            {user.email || ''}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200" />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          id="user-nav-dropdown"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-3 z-50 text-xs animate-in zoom-in-95 duration-100 backdrop-blur-xl"
        >
          {/* Cabeçalho com dados do usuário */}
          <div className="flex items-center gap-3 p-2 border-b border-slate-800 pb-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full ring-2 ring-violet-500/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold ring-2 ring-violet-500/40">
                {initials}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="py-2 flex flex-col gap-1">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 bg-slate-800/40 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sessão OAuth Segura</span>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAuthModal();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-violet-400" />
              <span>Alternar Conta / Provedor</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-left transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
