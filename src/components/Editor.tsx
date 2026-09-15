import React, { useRef, useEffect } from 'react';
import {
  ImagePlus,
  Highlighter,
  Trash2,
  Download,
  RotateCcw,
  Sparkles,
  Pin,
  Clock,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { Note, NoteImage } from '../types';

interface EditorProps {
  note: Note;
  onUpdateNote: (updated: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
  onAnnotateImage: (image: NoteImage) => void;
  onRestoreOriginalImage: (imageId: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  note,
  onUpdateNote,
  onDeleteNote,
  onAnnotateImage,
  onRestoreOriginalImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Auto-resize textarea to fit content seamlessly like Notion/Linear
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(220, textareaRef.current.scrollHeight)}px`;
    }
  }, [note.content]);

  // Convert File to base64 NoteImage
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const newImage: NoteImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: dataUrl,
        originalUrl: dataUrl,
        name: file.name || 'imagem-colada.png',
        size: file.size,
      };

      onUpdateNote({
        images: [...(note.images || []), newImage],
        updatedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle standard input upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(processImageFile);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Paste from clipboard (Ctrl+V with image)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
        }
      }
    }
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(processImageFile);
    }
  };

  // Remove an image from note
  const handleRemoveImage = (imageId: string) => {
    onUpdateNote({
      images: (note.images || []).filter((img) => img.id !== imageId),
      updatedAt: new Date().toISOString(),
    });
  };

  // Copy note text
  const handleCopyNote = () => {
    const fullText = `${note.title || 'Sem título'}\n\n${note.content}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format date helper
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recentemente';
    }
  };

  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
  const charCount = note.content.length;

  return (
    <div
      id="editor-container"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex-1 flex flex-col h-full overflow-y-auto bg-[#090d16] text-slate-100"
    >
      {/* Editor Top Metadata & Actions Bar */}
      <div className="border-b border-slate-800/60 px-8 py-3 flex items-center justify-between text-xs text-slate-400 bg-[#090d16]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Editado em {formatDate(note.updatedAt)}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            {wordCount} {wordCount === 1 ? 'palavra' : 'palavras'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{charCount} caracteres</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pin note button */}
          <button
            onClick={() => onUpdateNote({ isPinned: !note.isPinned })}
            title={note.isPinned ? 'Desafixar nota' : 'Fixar nota no topo'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all ${
              note.isPinned
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-sm'
                : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-violet-400' : ''}`} />
            <span>{note.isPinned ? 'Fixada' : 'Fixar'}</span>
          </button>

          {/* Copy note */}
          <button
            onClick={handleCopyNote}
            title="Copiar texto da nota"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          {/* Upload image trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-colors"
          >
            <ImagePlus className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Adicionar Imagem</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Delete note */}
          <button
            onClick={() => onDeleteNote(note.id)}
            title="Excluir nota"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Note Content Area */}
      <div className="max-w-4xl w-full mx-auto px-8 py-10 flex flex-col flex-1">
        {/* Title Input: Single-line, borderless, large bold font, placeholder "Sem título" */}
        <input
          id="note-title-input"
          type="text"
          value={note.title}
          onChange={(e) =>
            onUpdateNote({
              title: e.target.value,
              updatedAt: new Date().toISOString(),
            })
          }
          placeholder="Sem título"
          className="w-full text-3xl md:text-4xl font-extrabold tracking-tight bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none mb-6 border-none p-0 selection:bg-violet-500/30"
        />

        {/* Body Textarea: Fluid, borderless, clean Notion/Linear feel */}
        <textarea
          id="note-content-textarea"
          ref={textareaRef}
          value={note.content}
          onChange={(e) =>
            onUpdateNote({
              content: e.target.value,
              updatedAt: new Date().toISOString(),
            })
          }
          onPaste={handlePaste}
          placeholder="Digite suas anotações, pensamentos rápidos, cole imagens com Ctrl+V ou arraste arquivos..."
          className="w-full resize-none bg-transparent text-slate-300 placeholder:text-slate-600 focus:outline-none text-base leading-relaxed border-none p-0 min-h-[220px] selection:bg-cyan-500/30"
        />

        {/* Images & Visual Annotations Section */}
        {note.images && note.images.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                  Imagens &amp; Anotações ({note.images.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Dica: Clique em "Anotar / Marcar Imagem" para adicionar setas e caixas
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {note.images.map((image, index) => (
                <div
                  key={image.id}
                  id={`note-image-card-${index}`}
                  className="group relative bg-[#0d1322] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all shadow-xl shadow-black/40"
                >
                  {/* Top Bar for Image Card */}
                  <div className="px-4 py-2.5 bg-[#090d16]/90 border-b border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-sm">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-300 font-medium truncate">{image.name}</span>
                      {image.annotatedAt && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold">
                          Anotada
                        </span>
                      )}
                    </div>

                    {/* Image Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Restore Original Button if image was modified */}
                      {image.originalUrl && image.originalUrl !== image.url && (
                        <button
                          onClick={() => onRestoreOriginalImage(image.id)}
                          title="Restaurar imagem original sem marcações"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurar Original</span>
                        </button>
                      )}

                      {/* Download Button */}
                      <a
                        href={image.url}
                        download={`n1pad-${image.name}`}
                        title="Baixar imagem"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveImage(image.id)}
                        title="Remover imagem"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Prominent "Anotar / Marcar Imagem" Button */}
                      <button
                        id={`btn-annotate-${index}`}
                        onClick={() => onAnnotateImage(image)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-md shadow-violet-500/20 active:scale-95 transition-all"
                      >
                        <Highlighter className="w-3.5 h-3.5" />
                        <span>Anotar / Marcar Imagem</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Display */}
                  <div className="p-4 flex items-center justify-center bg-[#070b14] overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name}
                      referrerPolicy="no-referrer"
                      className="max-h-[520px] w-auto max-w-full object-contain rounded-lg shadow-inner cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => onAnnotateImage(image)}
                      title="Clique para abrir no Anotador"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state / Drag drop helper if no images attached */}
        {(!note.images || note.images.length === 0) && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-8 border border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-900/30 group"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-violet-500/40 group-hover:text-violet-400 transition-colors text-slate-500">
                <ImagePlus className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                Clique para carregar uma imagem ou cole com <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+V</kbd>
              </p>
              <p className="text-[11px] text-slate-600">
                Suporta PNG, JPG, SVG e Screenshots com anotações imediatas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
