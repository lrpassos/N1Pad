'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ImagePlus, Highlighter, Trash2, Download, RotateCcw, Clock, Copy, Check } from 'lucide-react';
import { ImageAnnotator } from './image-annotator';

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

interface EditorProps {
  note: Note;
  onUpdateNote: (updated: Partial<Note>) => void;
}

export const Editor: React.FC<EditorProps> = ({ note, onUpdateNote }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [annotatingImage, setAnnotatingImage] = useState<NoteImage | null>(null);

  // Auto-ajuste de altura da área de texto fluida
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(220, textareaRef.current.scrollHeight)}px`;
    }
  }, [note.content]);

  // Upload e processamento de arquivo de imagem
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        const newImg: NoteImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: dataUrl,
          originalUrl: dataUrl,
          name: file.name || 'imagem.png',
          size: file.size,
        };

        onUpdateNote({
          images: [...(note.images || []), newImg],
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Salvar anotação substituindo a imagem pela versão marcada
  const handleSaveAnnotation = (annotatedDataUrl: string) => {
    if (!annotatingImage) return;

    const updatedImages = (note.images || []).map((img) => {
      if (img.id !== annotatingImage.id) return img;
      return {
        ...img,
        url: annotatedDataUrl,
        annotatedAt: new Date().toISOString(),
      };
    });

    onUpdateNote({ images: updatedImages });
    setAnnotatingImage(null);
  };

  // Restaurar imagem original
  const handleRestoreOriginal = (imageId: string) => {
    const updatedImages = (note.images || []).map((img) => {
      if (img.id !== imageId || !img.originalUrl) return img;
      return {
        ...img,
        url: img.originalUrl,
        annotatedAt: undefined,
      };
    });
    onUpdateNote({ images: updatedImages });
  };

  // Remover imagem
  const handleRemoveImage = (imageId: string) => {
    onUpdateNote({
      images: (note.images || []).filter((img) => img.id !== imageId),
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#090d16] text-slate-100">
      {/* Barra superior de ações */}
      <div className="border-b border-slate-800/60 px-8 py-3 flex items-center justify-between text-xs text-slate-400 bg-[#090d16]/80 backdrop-blur-sm sticky top-0 z-10">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          The N1Pad Editor
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-colors"
          >
            <ImagePlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Adicionar Imagem</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Área Principal de Digitação */}
      <div className="max-w-4xl w-full mx-auto px-8 py-10 flex flex-col flex-1">
        {/* Título da Nota: Campo de texto de linha única, sem bordas, fonte grande e em negrito. Placeholder: "Sem título" */}
        <input
          type="text"
          value={note.title}
          onChange={(e) => onUpdateNote({ title: e.target.value })}
          placeholder="Sem título"
          className="w-full text-3xl md:text-4xl font-extrabold tracking-tight bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none mb-6 border-none p-0"
        />

        {/* Corpo do Texto: Área de texto fluida, sem bordas, para digitação rápida */}
        <textarea
          ref={textareaRef}
          value={note.content}
          onChange={(e) => onUpdateNote({ content: e.target.value })}
          placeholder="Digite suas anotações e pensamentos rápidos..."
          className="w-full resize-none bg-transparent text-slate-300 placeholder:text-slate-600 focus:outline-none text-base leading-relaxed border-none p-0 min-h-[220px]"
        />

        {/* Seção de Upload e Imagens Anotadas */}
        {note.images && note.images.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-800/80 space-y-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Imagens &amp; Marcações ({note.images.length})
            </h3>

            <div className="grid grid-cols-1 gap-6">
              {note.images.map((image) => (
                <div
                  key={image.id}
                  className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                >
                  <div className="px-4 py-2 bg-[#090d16] border-b border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate">{image.name}</span>
                    <div className="flex items-center gap-2">
                      {image.originalUrl && image.originalUrl !== image.url && (
                        <button
                          onClick={() => handleRestoreOriginal(image.id)}
                          className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restaurar</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveImage(image.id)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setAnnotatingImage(image)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 rounded-lg shadow-md transition-all"
                      >
                        <Highlighter className="w-3.5 h-3.5" />
                        <span>Anotar / Marcar Imagem</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-center bg-[#060911]">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="max-h-[480px] w-auto max-w-full rounded-lg object-contain cursor-pointer"
                      onClick={() => setAnnotatingImage(image)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Anotação de Imagem */}
      {annotatingImage && (
        <ImageAnnotator
          imageUrl={annotatingImage.url}
          imageName={annotatingImage.name}
          onSave={handleSaveAnnotation}
          onClose={() => setAnnotatingImage(null)}
        />
      )}
    </div>
  );
};
