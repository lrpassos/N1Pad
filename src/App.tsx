import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { ImageAnnotator } from './components/ImageAnnotator';
import { ClerkAuthModal } from './components/ClerkAuthModal';
import { Note, NoteImage, UserProfile } from './types';
import { INITIAL_NOTES } from './data/initialNotes';
import { Sparkles, FileCode, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_NOTES = 'the-n1pad-notes-v1';
const STORAGE_KEY_USER = 'the-n1pad-user-v1';

export default function App() {
  // Notes State with Local Storage Persistence
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading notes from localStorage', e);
    }
    return INITIAL_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    return notes[0]?.id || '';
  });

  // User Auth State
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default logged in user for immediate experience
    return {
      id: 'usr_luiz',
      name: 'Luiz Rogério',
      email: 'luiz.rogerios@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luiz',
    };
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showNextJsCodeModal, setShowNextJsCodeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Image being annotated in the Canvas tool
  const [annotatingImage, setAnnotatingImage] = useState<{
    noteId: string;
    image: NoteImage;
  } | null>(null);

  // Persist notes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    } catch (e) {
      console.warn('Unable to persist notes', e);
    }
  }, [notes]);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find currently active note
  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // Update note handler
  const handleUpdateNote = useCallback(
    (updatedFields: Partial<Note>) => {
      if (!activeNote) return;
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === activeNote.id
            ? { ...n, ...updatedFields, updatedAt: new Date().toISOString() }
            : n
        )
      );
    },
    [activeNote]
  );

  // Create a new note
  const handleNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '', // Empty placeholder "Sem título"
      content: '',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      tags: [],
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    showToast('Nova nota criada!');
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== noteId);
      if (activeNoteId === noteId && remaining.length > 0) {
        setActiveNoteId(remaining[0].id);
      }
      return remaining;
    });
    showToast('Nota removida');
  };

  // Toggle pin
  const handleTogglePin = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // Open Canvas Annotator for an image
  const handleStartAnnotation = (image: NoteImage) => {
    if (!activeNote) return;
    setAnnotatingImage({
      noteId: activeNote.id,
      image,
    });
  };

  // Save annotation: replaces current image with marked version!
  const handleSaveAnnotation = (annotatedDataUrl: string) => {
    if (!annotatingImage) return;
    const { noteId, image } = annotatingImage;

    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id !== noteId) return note;

        const updatedImages = note.images.map((img) => {
          if (img.id !== image.id) return img;
          return {
            ...img,
            originalUrl: img.originalUrl || img.url,
            url: annotatedDataUrl,
            annotatedAt: new Date().toISOString(),
            history: [...(img.history || []), img.url],
          };
        });

        return {
          ...note,
          images: updatedImages,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    setAnnotatingImage(null);
    showToast('Anotação salva com sucesso na imagem!');
  };

  // Restore raw unannotated image
  const handleRestoreOriginal = (imageId: string) => {
    if (!activeNote) return;
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id !== activeNote.id) return note;
        const updatedImages = note.images.map((img) => {
          if (img.id !== imageId || !img.originalUrl) return img;
          return {
            ...img,
            url: img.originalUrl,
            annotatedAt: undefined,
          };
        });
        return {
          ...note,
          images: updatedImages,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showToast('Imagem original restaurada');
  };

  // Export notes JSON backup
  const handleExportNotes = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `the-n1pad-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup baixado com sucesso!');
  };

  // Import notes JSON
  const handleImportNotes = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported) && imported.length > 0) {
            setNotes(imported);
            setActiveNoteId(imported[0].id);
            showToast(`${imported.length} notas importadas!`);
          }
        } catch {
          showToast('Erro ao ler arquivo JSON de notas.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Global Keyboard shortcuts (Ctrl+N, Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        handleNewNote();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div id="the-n1pad-root" className="flex flex-col h-screen w-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNewNote={handleNewNote}
        onExportNotes={handleExportNotes}
        onImportNotes={handleImportNotes}
        user={user}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onSignOut={() => {
          setUser(null);
          showToast('Desconectado com sucesso');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main App Layout: Sidebar + Note Editor */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Sidebar */}
        {sidebarOpen && (
          <Sidebar
            notes={notes}
            activeNoteId={activeNote?.id || ''}
            onSelectNote={setActiveNoteId}
            onNewNote={handleNewNote}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
            searchQuery={searchQuery}
          />
        )}

        {/* Note Editor Area */}
        {activeNote ? (
          <Editor
            key={activeNote.id}
            note={activeNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onAnnotateImage={handleStartAnnotation}
            onRestoreOriginalImage={handleRestoreOriginal}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#090d16]">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-violet-400 shadow-xl">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Nenhuma nota selecionada</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Crie uma nova nota para capturar pensamentos rápidos e fazer marcações visuais em imagens.
            </p>
            <button
              onClick={handleNewNote}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl shadow-lg shadow-violet-500/20"
            >
              Criar Primeira Nota
            </button>
          </div>
        )}
      </div>

      {/* Floating Next.js Code Structure Badge / Info */}
      <div className="fixed bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowNextJsCodeModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 rounded-full shadow-xl backdrop-blur-md transition-all group"
        >
          <FileCode className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span>Next.js 14 App Router &amp; Clerk</span>
        </button>
      </div>

      {/* Canvas Image Annotator Modal */}
      {annotatingImage && (
        <ImageAnnotator
          imageUrl={annotatingImage.image.url}
          imageName={annotatingImage.image.name}
          onSave={handleSaveAnnotation}
          onClose={() => setAnnotatingImage(null)}
        />
      )}

      {/* Clerk Authentication Modal */}
      <ClerkAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={user}
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          showToast(`Conectado como ${loggedInUser.name}`);
        }}
      />

      {/* Next.js & Clerk Integration Guide Modal */}
      {showNextJsCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-[#0b0f19] border border-slate-800 shadow-2xl p-6 text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                  N1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">The N1Pad — Arquitetura Next.js 14 + Clerk</h3>
                  <p className="text-xs text-slate-400">Estrutura gerada para Vercel e App Router</p>
                </div>
              </div>
              <button
                onClick={() => setShowNextJsCodeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-semibold text-cyan-400 mb-1">Arquivos Next.js Prontos no Projeto:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
                  <li><span className="text-violet-300">middleware.ts</span> — Proteção de rotas com Clerk</li>
                  <li><span className="text-violet-300">app/layout.tsx</span> — Root Layout com ClerkProvider &amp; Dark Theme</li>
                  <li><span className="text-violet-300">app/page.tsx</span> — Página inicial com autenticação Clerk</li>
                  <li><span className="text-violet-300">components/editor.tsx</span> — Editor Notion-style sem bordas</li>
                  <li><span className="text-violet-300">components/image-annotator.tsx</span> — Ferramenta Canvas nativa</li>
                  <li><span className="text-violet-300">.env.local.example</span> — Variáveis de ambiente Clerk</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-1.5">Variáveis de Ambiente (.env.local):</h4>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-violet-300 font-mono overflow-x-auto">
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...&#10;CLERK_SECRET_KEY=sk_test_...&#10;NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in&#10;NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-1.5">Instalação no Next.js (Vercel):</h4>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto">
npm install @clerk/nextjs lucide-react
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowNextJsCodeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/95 border border-violet-500/40 text-xs text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
