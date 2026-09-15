'use client';

import React, { useState } from 'react';
import { UserButton, useUser, SignIn } from '@clerk/nextjs';
import { Editor } from '@/components/editor';
import { Plus, PanelLeft, Search, Sparkles } from 'lucide-react';

export interface NoteImage {
  id: string;
  url: string;
  originalUrl?: string;
  name: string;
  size: number;
  annotatedAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  images: NoteImage[];
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  const [notes, setNotes] = useState<Note[]>([
    {
      id: 'default-note',
      title: 'Minhas Anotações Visuais',
      content: 'Bem-vindo ao The N1Pad no Next.js 14 App Router!',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [activeNoteId, setActiveNoteId] = useState<string>('default-note');
  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleUpdateNote = (updated: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? { ...n, ...updated, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const handleNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '', // Placeholder "Sem título"
      content: '',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#090d16] text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Tela de login limpa via Clerk se não estiver autenticado
  if (!isSignedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#090d16] relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 z-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-violet-500/25">
              N1
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              The N1Pad
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Bloco de notas visual moderno com marcação de imagens
          </p>
        </div>

        <div className="z-10 w-full max-w-md flex justify-center">
          <SignIn routing="hash" />
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Navbar Minimalista com Logo em Gradiente e UserButton */}
      <header className="h-14 border-b border-slate-800/80 bg-[#070b14]/90 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-xs shadow-md shadow-violet-500/20">
            N1
          </div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            The N1Pad
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNewNote}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-md shadow-violet-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Nota</span>
          </button>

          {/* Botão de perfil oficial do Clerk */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Editor Principal */}
      <main className="flex-1 flex overflow-hidden">
        {activeNote && (
          <Editor
            note={activeNote}
            onUpdateNote={handleUpdateNote}
          />
        )}
      </main>
    </div>
  );
}
