'use client';

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
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface AnnotationItem {
  id: string;
  tool: 'arrow' | 'rect' | 'highlight' | 'text' | 'pen';
  color: string;
  strokeWidth: number;
  points: Point[];
  text?: string;
  fill?: boolean;
}

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

export const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  imageUrl,
  imageName,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<'arrow' | 'rect' | 'highlight' | 'text' | 'pen'>('arrow');
  const [selectedColor, setSelectedColor] = useState<string>('#06b6d4');
  const [strokeWidth, setStrokeWidth] = useState<number>(6);
  const [rectFill, setRectFill] = useState<boolean>(true);

  const [items, setItems] = useState<AnnotationItem[]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationItem[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });

  // Inserção de texto
  const [textPrompt, setTextPrompt] = useState<{ point: Point } | null>(null);
  const [textValue, setTextValue] = useState('');

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setBaseImage(img);
      setImageSize({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, imageSize.width, imageSize.height);
    ctx.drawImage(baseImage, 0, 0, imageSize.width, imageSize.height);

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

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

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
        const w = Math.abs(end.x - start.x);
        const h = Math.abs(end.y - start.y);

        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (fill) {
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.18;
          ctx.fillRect(x, y, w, h);
          ctx.globalAlpha = 1.0;
        }
        ctx.strokeRect(x, y, w, h);
      } else if (tool === 'highlight' && points.length >= 2) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = Math.max(22, width * 3);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.stroke();
      } else if (tool === 'pen' && points.length >= 2) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.stroke();
      } else if (tool === 'text' && points.length >= 1 && text) {
        const p = points[0];
        const fontSize = Math.max(16, width * 3.5);
        ctx.font = `bold ${fontSize}px sans-serif`;
        const metrics = ctx.measureText(text);

        // Fundo pill de alto contraste
        ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.fillRect(p.x - 8, p.y - fontSize - 6, metrics.width + 16, fontSize + 12);
        ctx.strokeRect(p.x - 8, p.y - fontSize - 6, metrics.width + 16, fontSize + 12);

        ctx.fillStyle = color;
        ctx.fillText(text, p.x, p.y);
      }
      ctx.restore();
    };

    items.forEach(renderItem);

    if (isDrawing && currentPoints.length > 0) {
      renderItem({
        id: 'temp',
        tool: activeTool,
        color: selectedColor,
        strokeWidth,
        points: currentPoints,
        fill: rectFill,
      });
    }
  }, [baseImage, imageSize, items, isDrawing, currentPoints, activeTool, selectedColor, strokeWidth, rectFill]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getCanvasCoords(e);
    if (!p) return;

    if (activeTool === 'text') {
      setTextPrompt({ point: p });
      setTextValue('');
      return;
    }

    setIsDrawing(true);
    setCurrentPoints(activeTool === 'arrow' || activeTool === 'rect' ? [p, p] : [p]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const p = getCanvasCoords(e);
    if (!p) return;
    setCurrentPoints((prev) =>
      activeTool === 'arrow' || activeTool === 'rect' ? [prev[0], p] : [...prev, p]
    );
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPoints.length > 0) {
      setItems((prev) => [
        ...prev,
        {
          id: `ann-${Date.now()}`,
          tool: activeTool,
          color: selectedColor,
          strokeWidth,
          points: currentPoints,
          fill: rectFill,
        },
      ]);
      setRedoStack([]);
    }
    setCurrentPoints([]);
  };

  const handleTextSubmit = () => {
    if (textPrompt && textValue.trim()) {
      setItems((prev) => [
        ...prev,
        {
          id: `ann-txt-${Date.now()}`,
          tool: 'text',
          color: selectedColor,
          strokeWidth,
          points: [textPrompt.point],
          text: textValue.trim(),
        },
      ]);
      setRedoStack([]);
    }
    setTextPrompt(null);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png', 1.0));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#060911]/95 backdrop-blur-xl text-slate-100 select-none">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-[#090d16] px-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Anotador Visual The N1Pad</h2>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 rounded-lg shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Anotação</span>
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-[#0c1220] border-b border-slate-800 px-6 py-2 flex flex-wrap items-center gap-4 text-xs">
        {/* Ferramentas */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTool('arrow')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
              activeTool === 'arrow' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MoveRight className="w-4 h-4" />
            <span>Seta</span>
          </button>
          <button
            onClick={() => setActiveTool('rect')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
              activeTool === 'rect' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>Retângulo</span>
          </button>
          <button
            onClick={() => setActiveTool('highlight')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
              activeTool === 'highlight' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Highlighter className="w-4 h-4" />
            <span>Marca-texto</span>
          </button>
          <button
            onClick={() => setActiveTool('text')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
              activeTool === 'text' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Texto</span>
          </button>
          <button
            onClick={() => setActiveTool('pen')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
              activeTool === 'pen' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Pencil className="w-4 h-4" />
            <span>Caneta</span>
          </button>
        </div>

        {/* Cores */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedColor(c.value)}
              className={`w-5 h-5 rounded-full ${selectedColor === c.value ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (items.length === 0) return;
              const last = items[items.length - 1];
              setItems((prev) => prev.slice(0, -1));
              setRedoStack((prev) => [last, ...prev]);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (redoStack.length === 0) return;
              const next = redoStack[0];
              setRedoStack((prev) => prev.slice(1));
              setItems((prev) => [...prev, next]);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setItems([]);
              setRedoStack([]);
            }}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#070a12] relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={imageSize.width}
          height={imageSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="rounded-lg shadow-2xl border border-slate-800 bg-slate-950 max-h-[75vh] w-auto max-w-full object-contain"
        />

        {textPrompt && (
          <div className="absolute z-20 p-3 bg-slate-900 border border-violet-500 rounded-xl shadow-2xl">
            <input
              type="text"
              autoFocus
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextSubmit();
                if (e.key === 'Escape') setTextPrompt(null);
              }}
              placeholder="Digite a anotação..."
              className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
