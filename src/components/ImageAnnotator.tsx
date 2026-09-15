import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MoveRight,
  Square,
  Highlighter,
  Type,
  Pencil,
  Undo2,
  Redo2,
  Trash2,
  X,
  Check,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { AnnotationItem, AnnotationTool, Point } from '../types';

interface ImageAnnotatorProps {
  imageUrl: string;
  imageName: string;
  onSave: (annotatedDataUrl: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  { label: 'Ciano Neon', value: '#06b6d4' },
  { label: 'Violeta Elétrico', value: '#8b5cf6' },
  { label: 'Rosa Vibrante', value: '#f43f5e' },
  { label: 'Verde Esmeralda', value: '#10b981' },
  { label: 'Âmbar Solar', value: '#f59e0b' },
  { label: 'Branco Puro', value: '#ffffff' },
];

const STROKE_WIDTHS = [
  { label: 'Fino', value: 3 },
  { label: 'Médio', value: 6 },
  { label: 'Grosso', value: 10 },
  { label: 'Marcador', value: 20 },
];

export const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  imageUrl,
  imageName,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<AnnotationTool>('arrow');
  const [selectedColor, setSelectedColor] = useState<string>('#06b6d4');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [rectFill, setRectFill] = useState<boolean>(true);
  
  // History stack for undo/redo
  const [items, setItems] = useState<AnnotationItem[]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationItem[]>([]);
  
  // Current drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  
  // Text prompt state
  const [textInput, setTextInput] = useState<string>('');
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [showTextInput, setShowTextInput] = useState<boolean>(false);

  // Loaded base image
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const [zoom, setZoom] = useState<number>(1);

  // Load image once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setBaseImage(img);
      setImageSize({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Adjust zoom to fit container on load
  useEffect(() => {
    if (!containerRef.current || !imageSize.width) return;
    const containerW = containerRef.current.clientWidth - 80;
    const containerH = containerRef.current.clientHeight - 160;
    const scaleW = containerW / imageSize.width;
    const scaleH = containerH / imageSize.height;
    const optimalZoom = Math.min(1, Math.min(scaleW, scaleH));
    setZoom(Math.max(0.2, Number(optimalZoom.toFixed(2))));
  }, [imageSize]);

  // Redraw canvas with all elements
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = imageSize.width;
    const h = imageSize.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw base image
    ctx.drawImage(baseImage, 0, 0, w, h);

    // Helper to render an item
    const renderItem = (item: AnnotationItem) => {
      ctx.save();
      const { tool, color, strokeWidth: width, points, text, fill } = item;

      if (tool === 'arrow' && points.length >= 2) {
        const start = points[0];
        const end = points[1];
        const headLength = Math.max(18, width * 3.5);
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Main line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Arrow head triangle
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      } else if (tool === 'rect' && points.length >= 2) {
        const start = points[0];
        const end = points[1];
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const rw = Math.abs(end.x - start.x);
        const rh = Math.abs(end.y - start.y);

        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineJoin = 'round';

        if (fill) {
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.18;
          ctx.fillRect(x, y, rw, rh);
          ctx.globalAlpha = 1.0;
        }
        ctx.strokeRect(x, y, rw, rh);
      } else if (tool === 'highlight' && points.length >= 2) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = Math.max(22, width * 3);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      } else if (tool === 'pen' && points.length >= 2) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      } else if (tool === 'text' && points.length >= 1 && text) {
        const p = points[0];
        const fontSize = Math.max(16, width * 3.5);
        ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', sans-serif`;

        const metrics = ctx.measureText(text);
        const padX = 10;
        const padY = 6;
        const textW = metrics.width;
        const textH = fontSize;

        // Background pill badge for strong contrast
        ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        const rectX = p.x - padX;
        const rectY = p.y - textH - padY;
        const rectW = textW + padX * 2;
        const rectH = textH + padY * 2;

        ctx.beginPath();
        const r = 6;
        ctx.roundRect ? ctx.roundRect(rectX, rectY, rectW, rectH, r) : ctx.rect(rectX, rectY, rectW, rectH);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = color;
        ctx.fillText(text, p.x, p.y);
      }

      ctx.restore();
    };

    // Draw all committed items
    items.forEach(renderItem);

    // Draw active drawing item in real time
    if (isDrawing && currentPoints.length > 0) {
      const tempItem: AnnotationItem = {
        id: 'active-temp',
        tool: activeTool,
        color: selectedColor,
        strokeWidth: strokeWidth,
        points: currentPoints,
        fill: rectFill,
      };
      renderItem(tempItem);
    }
  }, [baseImage, imageSize, items, isDrawing, currentPoints, activeTool, selectedColor, strokeWidth, rectFill]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Convert client coordinates to canvas pixel coordinates
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getCanvasPoint(e);
    if (!p) return;

    if (activeTool === 'text') {
      setTextPosition(p);
      setShowTextInput(true);
      setTextInput('');
      return;
    }

    setIsDrawing(true);
    if (activeTool === 'arrow' || activeTool === 'rect') {
      setCurrentPoints([p, p]);
    } else {
      setCurrentPoints([p]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const p = getCanvasPoint(e);
    if (!p) return;

    if (activeTool === 'arrow' || activeTool === 'rect') {
      setCurrentPoints((prev) => [prev[0], p]);
    } else {
      setCurrentPoints((prev) => [...prev, p]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length > 0) {
      const newItem: AnnotationItem = {
        id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        tool: activeTool,
        color: selectedColor,
        strokeWidth: strokeWidth,
        points: currentPoints,
        fill: rectFill,
      };
      setItems((prev) => [...prev, newItem]);
      setRedoStack([]); // Clear redo on new action
    }
    setCurrentPoints([]);
  };

  const submitTextAnnotation = () => {
    if (textPosition && textInput.trim()) {
      const newItem: AnnotationItem = {
        id: `ann-text-${Date.now()}`,
        tool: 'text',
        color: selectedColor,
        strokeWidth: strokeWidth,
        points: [textPosition],
        text: textInput.trim(),
      };
      setItems((prev) => [...prev, newItem]);
      setRedoStack([]);
    }
    setShowTextInput(false);
    setTextPosition(null);
    setTextInput('');
  };

  const handleUndo = () => {
    if (items.length === 0) return;
    const last = items[items.length - 1];
    setItems((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [last, ...prev]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setItems((prev) => [...prev, next]);
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    setItems([]);
    setRedoStack([]);
  };

  // Save the annotated image and replace current note image
  const handleSaveAnnotation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export high-resolution PNG
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    onSave(dataUrl);
  };

  // Direct download option
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `n1pad-anotada-${imageName.replace(/\.[^/.]+$/, '')}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Keyboard shortcuts (Ctrl+Z, Escape, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showTextInput) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTextInput, items, redoStack, onClose]);

  return (
    <div
      id="image-annotator-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#060911]/95 backdrop-blur-xl text-slate-100 select-none animate-in fade-in duration-200"
    >
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-[#090d16]/90 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Highlighter className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              Anotador Visual de Imagem
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-normal border border-violet-500/30">
                The N1Pad Canvas
              </span>
            </h2>
            <p className="text-xs text-slate-400 truncate max-w-xs">{imageName}</p>
          </div>
        </div>

        {/* Action Buttons: Save & Close */}
        <div className="flex items-center gap-3">
          <button
            id="btn-annotator-download"
            onClick={handleDownload}
            title="Baixar imagem anotada"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar PNG</span>
          </button>

          <button
            id="btn-annotator-cancel"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-transparent hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancelar</span>
          </button>

          <button
            id="btn-annotator-save"
            onClick={handleSaveAnnotation}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 rounded-lg shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/25 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Anotação</span>
          </button>
        </div>
      </header>

      {/* Floating Toolbar Controls */}
      <div className="bg-[#0c1220]/90 border-b border-slate-800/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Tools Selection */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            id="tool-arrow"
            onClick={() => setActiveTool('arrow')}
            title="Seta Direcional (apontar locais)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTool === 'arrow'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MoveRight className="w-4 h-4" />
            <span className="font-medium">Seta</span>
          </button>

          <button
            id="tool-rect"
            onClick={() => setActiveTool('rect')}
            title="Retângulo / Caixa (destacar áreas)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTool === 'rect'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Square className="w-4 h-4" />
            <span className="font-medium">Retângulo</span>
          </button>

          <button
            id="tool-highlight"
            onClick={() => setActiveTool('highlight')}
            title="Marca-texto (realce translúcido)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTool === 'highlight'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Highlighter className="w-4 h-4" />
            <span className="font-medium">Marca-texto</span>
          </button>

          <button
            id="tool-text"
            onClick={() => setActiveTool('text')}
            title="Texto (clique na imagem para escrever)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTool === 'text'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Type className="w-4 h-4" />
            <span className="font-medium">Texto</span>
          </button>

          <button
            id="tool-pen"
            onClick={() => setActiveTool('pen')}
            title="Caneta Livre (desenho livre)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTool === 'pen'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Pencil className="w-4 h-4" />
            <span className="font-medium">Caneta</span>
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Cor:</span>
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedColor(c.value)}
              title={c.label}
              className={`w-5 h-5 rounded-full transition-transform ${
                selectedColor === c.value
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        {/* Stroke Width Picker */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Espessura:</span>
          {STROKE_WIDTHS.map((sw) => (
            <button
              key={sw.value}
              onClick={() => setStrokeWidth(sw.value)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                strokeWidth === sw.value
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {sw.label}
            </button>
          ))}

          {activeTool === 'rect' && (
            <button
              onClick={() => setRectFill(!rectFill)}
              title="Preenchimento translúcido da caixa"
              className={`ml-2 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                rectFill
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Preencher {rectFill ? '✓' : '✗'}
            </button>
          )}
        </div>

        {/* History Controls & Zoom */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-annotator-undo"
            onClick={handleUndo}
            disabled={items.length === 0}
            title="Desfazer (Ctrl+Z)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            id="btn-annotator-redo"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Refazer (Ctrl+Shift+Z)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            id="btn-annotator-clear"
            onClick={handleClearAll}
            disabled={items.length === 0}
            title="Limpar todas as anotações"
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          <button
            onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))}
            title="Diminuir Zoom"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-[11px] text-slate-400 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
            title="Aumentar Zoom"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoom(1)}
            title="Redefinir Zoom 100%"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Workspace Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8 flex items-center justify-center bg-[#070a12] relative cursor-crosshair"
      >
        <div
          className="relative rounded-lg shadow-2xl border border-slate-800/80 overflow-hidden bg-slate-950 transition-transform duration-75"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            width={imageSize.width}
            height={imageSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="block"
          />

          {/* Text Input Modal when clicking with Type tool */}
          {showTextInput && textPosition && (
            <div
              className="absolute z-20 flex flex-col gap-2 p-3 rounded-xl bg-slate-900 border border-violet-500/50 shadow-2xl animate-in zoom-in-95 duration-150"
              style={{
                left: Math.min(imageSize.width - 240, Math.max(10, textPosition.x)),
                top: Math.min(imageSize.height - 100, Math.max(10, textPosition.y)),
                width: 260,
              }}
            >
              <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Inserir Texto</span>
                <span className="text-[10px] text-slate-500">Pressione Enter</span>
              </div>
              <input
                type="text"
                autoFocus
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitTextAnnotation();
                  if (e.key === 'Escape') setShowTextInput(false);
                }}
                placeholder="Digite a anotação..."
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowTextInput(false)}
                  className="px-2.5 py-1 text-[10px] text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitTextAnnotation}
                  className="px-3 py-1 text-[10px] font-medium bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-md"
                >
                  Inserir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <footer className="h-9 border-t border-slate-800/80 bg-[#090d16] px-6 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-4">
          <span>
            Dimensões:{' '}
            <strong className="text-slate-300 font-mono">
              {imageSize.width} × {imageSize.height}px
            </strong>
          </span>
          <span>
            Anotações:{' '}
            <strong className="text-cyan-400 font-mono">{items.length}</strong>
          </span>
          {activeTool === 'text' && (
            <span className="text-violet-300">💡 Clique em qualquer ponto da imagem para escrever</span>
          )}
          {activeTool === 'arrow' && (
            <span className="text-slate-400">Arraste para desenhar a seta direcional</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span>Ctrl+Z: Desfazer</span>
          <span>•</span>
          <span>Esc: Fechar</span>
        </div>
      </footer>
    </div>
  );
};
