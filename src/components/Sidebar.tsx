import React from 'react';
import {
  Plus,
  Pin,
  FileText,
  Image as ImageIcon,
  Trash2,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Note } from '../types';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string;
  onSelectNote: (noteId: string) => void;
  onNewNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  searchQuery: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onNewNote,
  onDeleteNote,
  onTogglePin,
  searchQuery,
}) => {
  // Filter notes by search query
  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (n.title || '').toLowerCase().includes(q);
    const contentMatch = (n.content || '').toLowerCase().includes(q);
    const tagsMatch = (n.tags || []).some((t) => t.toLowerCase().includes(q));
    return titleMatch || contentMatch || tagsMatch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const formatRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Agora';
      if (diffMins < 60) return `${diffMins}m atrás`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h atrás`;
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  const renderNoteCard = (note: Note) => {
    const isActive = note.id === activeNoteId;
    const hasImages = note.images && note.images.length > 0;
    const hasAnnotations = hasImages && note.images.some((img) => !!img.annotatedAt);

    return (
      <div
        key={note.id}
        id={`sidebar-note-item-${note.id}`}
        onClick={() => onSelectNote(note.id)}
        className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
          isActive
            ? 'bg-slate-900/95 border-violet-500/50 shadow-lg shadow-violet-500/10'
            : 'bg-transparent border-transparent hover:bg-slate-900/50 hover:border-slate-800/80'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4
            className={`text-xs font-semibold truncate ${
              isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
            }`}
          >
            {note.title.trim() || 'Sem título'}
          </h4>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              title={note.isPinned ? 'Desafixar' : 'Fixar'}
              className="p-1 rounded text-slate-500 hover:text-violet-400 hover:bg-slate-800 transition-colors"
            >
              <Pin className={`w-3 h-3 ${note.isPinned ? 'fill-violet-400 text-violet-400' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
              title="Excluir nota"
              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Note snippet */}
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
          {note.content.trim() || 'Nota vazia...'}
        </p>

        {/* Bottom meta: Time, Images & Annotations badge */}
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            {formatRelativeTime(note.updatedAt)}
          </span>

          <div className="flex items-center gap-1.5">
            {hasImages && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                <ImageIcon className="w-2.5 h-2.5" />
                <span>{note.images.length}</span>
              </span>
            )}
            {hasAnnotations && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Anotada</span>
              </span>
            )}
            {note.isPinned && (
              <Pin className="w-2.5 h-2.5 text-violet-400 fill-violet-400" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      id="app-sidebar"
      className="w-72 sm:w-80 h-full border-r border-slate-800/80 bg-[#070a13] flex flex-col shrink-0 select-none overflow-hidden"
    >
      {/* Sidebar Header with Note Counter & Quick New Note */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <FileText className="w-3.5 h-3.5 text-violet-400" />
          <span className="font-semibold text-slate-200">Minhas Notas</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
            {notes.length}
          </span>
        </div>

        <button
          onClick={onNewNote}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
        >
          <Plus className="w-3 h-3 text-cyan-400" />
          <span>Criar</span>
        </button>
      </div>

      {/* Notes List with Smooth Scroll */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Pinned Section */}
        {pinnedNotes.length > 0 && (
          <div>
            <div className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Pin className="w-2.5 h-2.5 text-violet-400" />
              <span>Fixadas</span>
            </div>
            <div className="space-y-1 mt-1">
              {pinnedNotes.map(renderNoteCard)}
            </div>
          </div>
        )}

        {/* Regular Notes Section */}
        {otherNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <div className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <FileText className="w-2.5 h-2.5" />
                <span>Todas as Notas</span>
              </div>
            )}
            <div className="space-y-1 mt-1">
              {otherNotes.map(renderNoteCard)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-xs text-slate-500 mb-3">
              {searchQuery ? 'Nenhuma nota encontrada para a busca.' : 'Nenhuma nota criada ainda.'}
            </p>
            <button
              onClick={onNewNote}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar a primeira nota</span>
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080c16] text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Salvo localmente
        </span>
        <span className="font-mono text-[10px] text-slate-600">The N1Pad v1.0</span>
      </div>
    </aside>
  );
};
