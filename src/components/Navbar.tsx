import React from 'react';
import {
  Plus,
  PanelLeft,
  Search,
  Download,
  Upload,
  User as UserIcon,
} from 'lucide-react';
import { UserProfile } from '../types';
import { UserNav } from './UserNav';

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewNote: () => void;
  onExportNotes: () => void;
  onImportNotes: () => void;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onNewNote,
  onExportNotes,
  onImportNotes,
  user,
  onOpenAuthModal,
  onSignOut,
  searchQuery,
  onSearchChange,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav
      id="app-navbar"
      className="h-14 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0 select-none"
    >
      {/* Left side: Sidebar Toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Brand Logo with vibrant Violet to Neon Cyan gradient */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-xs shadow-md shadow-violet-500/20">
            N1
          </div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            The N1Pad
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
            Visual Notes
          </span>
        </div>
      </div>

      {/* Center: Quick Search Bar */}
      <div className="hidden md:flex items-center w-72 max-w-sm relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar notas ou anotações..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 focus:border-cyan-500/60 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Right side: New Note, Export/Backup, User Profile */}
      <div className="flex items-center gap-2">
        {/* New Note Button */}
        <button
          id="btn-new-note"
          onClick={onNewNote}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-md shadow-violet-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nova Nota</span>
        </button>

        {/* Export Notes */}
        <button
          onClick={onExportNotes}
          title="Exportar notas em arquivo de backup JSON"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Import Notes */}
        <button
          onClick={onImportNotes}
          title="Importar backup de notas"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-colors"
        >
          <Upload className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* OAuth / User Button Section */}
        {user ? (
          <UserNav
            user={user}
            onSignOut={onSignOut}
            onOpenAuthModal={onOpenAuthModal}
          />
        ) : (
          <button
            id="btn-login-trigger"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Entrar com Google / Microsoft</span>
          </button>
        )}
      </div>
    </nav>
  );
};
