import React, { useRef, useState, useEffect } from 'react';
import { 
  Eraser, 
  RotateCcw, 
  Trash2, 
  Sparkles, 
  Check, 
  X, 
  Loader2, 
  PenTool, 
  Eye, 
  Palette,
  FileCheck
} from 'lucide-react';
import { PhotographyLogEntry } from '../types/notebook';

interface HandwritingPadProps {
  currentEntry: Partial<PhotographyLogEntry>;
  onApplyTranscription: (data: Partial<PhotographyLogEntry>, canvasDataUrl?: string) => void;
  onClose: () => void;
}

export const HandwritingPad: React.FC<HandwritingPadProps> = ({
  currentEntry,
  onApplyTranscription,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1d3b58'); // Fountain pen blue default
  const [strokeWidth, setStrokeWidth] = useState(2.8);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  
  // OCR & Recognition states
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedResult, setRecognizedResult] = useState<any | null>(null);
  const [attachDrawing, setAttachDrawing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Fill background with warm notebook paper color
    ctx.fillStyle = '#faf5eb';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw notebook ruled guide lines
    ctx.strokeStyle = '#e2dac6';
    ctx.lineWidth = 1;
    const lineHeight = 36;
    for (let y = lineHeight; y < rect.height; y += lineHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw vertical red margin line
    ctx.strokeStyle = 'rgba(220, 80, 70, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(38, 0);
    ctx.lineTo(38, rect.height);
    ctx.stroke();

    // If existing handwriting exists, draw it
    if (currentEntry.handwritingImageData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = currentEntry.handwritingImageData;
    }

    // Save initial state for undo
    saveHistoryState();
  }, []);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-15), imageData]);
  };

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = isEraser ? strokeWidth * 4 : strokeWidth;
    ctx.strokeStyle = isEraser ? '#faf5eb' : penColor;
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistoryState();
    }
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length <= 1) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current
    const prevState = newHistory[newHistory.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setHistory(newHistory);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#faf5eb';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Redraw lines
    ctx.strokeStyle = '#e2dac6';
    ctx.lineWidth = 1;
    for (let y = 36; y < rect.height; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(220, 80, 70, 0.35)';
    ctx.beginPath();
    ctx.moveTo(38, 0);
    ctx.lineTo(38, rect.height);
    ctx.stroke();

    setHasDrawn(false);
    saveHistoryState();
  };

  // Pre-load a sample cursive note on the pad for instant testing
  const loadSampleHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();
    ctx.font = '24px "Caveat", cursive';
    ctx.fillStyle = '#1d3b58';
    
    // Draw 7 sample lines
    ctx.fillText('1. Date: Oct 28, 2026', 48, 56);
    ctx.fillText('2. Location: Madison Square Park', 48, 92);
    ctx.fillText('3. Time: 4:30 PM (Golden Light)', 48, 128);
    ctx.fillText('4. f/stop: f/2', 48, 164);
    ctx.fillText('5. Shutter: 1/500s', 48, 200);
    ctx.fillText('6. Film: Portra 400', 48, 236);
    ctx.fillText('7. Note: Flatiron reflection in fountain puddle', 48, 272);

    setHasDrawn(true);
    saveHistoryState();
  };

  // Recognize Handwriting via Gemini OCR
  const handleRecognize = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsRecognizing(true);
    setErrorMsg(null);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const response = await fetch('/api/gemini/recognize-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server OCR error');
      }

      const res = await response.json();
      if (res.success && res.data) {
        setRecognizedResult(res.data);
      } else {
        throw new Error('Invalid OCR response');
      }
    } catch (err: any) {
      console.error('Handwriting OCR failed:', err);
      setErrorMsg(err.message || 'Could not recognize handwriting. Please try writing clearly.');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleApply = () => {
    if (!recognizedResult) return;
    const canvas = canvasRef.current;
    const dataUrl = attachDrawing && canvas ? canvas.toDataURL('image/png') : undefined;

    onApplyTranscription(
      {
        camera: recognizedResult.camera || currentEntry.camera || '',
        lens: recognizedResult.lens || currentEntry.lens || '',
        date: recognizedResult.date || currentEntry.date || '',
        location: recognizedResult.location || currentEntry.location || '',
        timeOfDay: recognizedResult.timeOfDay || currentEntry.timeOfDay || '',
        fStop: recognizedResult.fStop || currentEntry.fStop || '',
        shutterSpeed: recognizedResult.shutterSpeed || currentEntry.shutterSpeed || '',
        filmSpeed: recognizedResult.filmSpeed || currentEntry.filmSpeed || '',
        personalNote: recognizedResult.personalNote || currentEntry.personalNote || '',
        inputMethod: 'handwriting',
      },
      dataUrl
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#f5efe3] rounded-2xl shadow-2xl border border-[#d6cbba] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#eae2d3] border-b border-[#d8cdbc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-900/10 flex items-center justify-center text-amber-900">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 tracking-tight">
                Handwriting Notebook Pad
              </h2>
              <p className="text-[11px] text-stone-600 font-mono">
                Frame #{currentEntry.frameNumber || 1} · Write 7 lines or freeform note
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawing Toolbar */}
        <div className="px-4 py-2 bg-[#f0e8da] border-b border-[#e2d6c3] flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Pens & Colors */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-500 font-medium mr-1 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" /> Ink:
            </span>
            {[
              { label: 'Fountain Blue', color: '#1d3b58' },
              { label: 'Carbon Black', color: '#1a1816' },
              { label: 'Graphite', color: '#4a4744' },
              { label: 'Red Grease', color: '#991b1b' },
            ].map(ink => (
              <button
                key={ink.color}
                title={ink.label}
                onClick={() => {
                  setPenColor(ink.color);
                  setIsEraser(false);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  !isEraser && penColor === ink.color
                    ? 'scale-110 border-stone-800 shadow-sm'
                    : 'border-white/80 hover:scale-105'
                }`}
                style={{ backgroundColor: ink.color }}
              />
            ))}

            <div className="h-4 w-px bg-stone-300 mx-1" />

            {/* Eraser */}
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 border transition-colors ${
                isEraser
                  ? 'bg-amber-800 text-white border-amber-900'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Eraser</span>
            </button>
          </div>

          {/* Stroke Width & Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            <select
              value={strokeWidth}
              onChange={e => setStrokeWidth(parseFloat(e.target.value))}
              className="bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-700"
            >
              <option value="1.8">Fine Nib (1.8px)</option>
              <option value="2.8">Medium Nib (2.8px)</option>
              <option value="4.2">Broad Nib (4.2px)</option>
            </select>

            <button
              onClick={undo}
              disabled={history.length <= 1}
              title="Undo stroke"
              className="p-1.5 rounded text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={clearCanvas}
              title="Clear paper"
              className="p-1.5 rounded text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={loadSampleHandwriting}
              className="px-2.5 py-1 rounded text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300/80 hover:bg-amber-200 transition-colors"
            >
              Load Sample Script
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative flex-1 p-3 flex flex-col items-center justify-center min-h-[300px] overflow-hidden bg-[#e4ded0]">
          <div className="relative w-full h-[330px] rounded-lg shadow-inner border border-[#d2c7b5] overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              className="w-full h-full touch-none"
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
            />

            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="text-center p-4 bg-white/70 backdrop-blur-xs rounded-xl border border-stone-200/80 max-w-sm">
                  <p className="text-xs font-medium text-stone-800 font-handwriting text-lg">
                    Draw or write your field notes with finger, stylus, or mouse
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Include: Date, Location, Time, f-stop, Shutter speed, Film, Note
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* OCR Result Preview (if recognized) */}
        {recognizedResult && (
          <div className="px-5 py-3 bg-amber-50/90 border-t border-amber-200/80 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Gemini OCR Transcribed 7 Lines:
              </span>
              <label className="flex items-center gap-1.5 text-stone-600 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachDrawing}
                  onChange={e => setAttachDrawing(e.target.checked)}
                  className="rounded text-amber-700"
                />
                Attach physical drawing to frame
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-stone-800 bg-white/80 p-2.5 rounded-lg border border-amber-200/70">
              <div><span className="text-stone-400">Camera:</span> {recognizedResult.camera || currentEntry.camera || '—'}</div>
              <div><span className="text-stone-400">Lens:</span> {recognizedResult.lens || currentEntry.lens || '—'}</div>
              <div><span className="text-stone-400">1. Date:</span> {recognizedResult.date || '—'}</div>
              <div><span className="text-stone-400">2. Loc:</span> {recognizedResult.location || '—'}</div>
              <div><span className="text-stone-400">3. Time:</span> {recognizedResult.timeOfDay || '—'}</div>
              <div><span className="text-stone-400">4. f/:</span> {recognizedResult.fStop || '—'}</div>
              <div><span className="text-stone-400">5. Shutter:</span> {recognizedResult.shutterSpeed || '—'}</div>
              <div><span className="text-stone-400">6. Film:</span> {recognizedResult.filmSpeed || '—'}</div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-stone-400">7. Note:</span> {recognizedResult.personalNote || '—'}
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="px-5 py-2 bg-red-50 border-t border-red-200 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#eae2d3] border-t border-[#d8cdbc] flex items-center justify-between gap-3">
          <p className="text-[11px] text-stone-500 hidden sm:block">
            Gemini Vision OCR decodes cursive and field shorthand into the 7 lines
          </p>

          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            {!recognizedResult ? (
              <button
                onClick={handleRecognize}
                disabled={isRecognizing || !hasDrawn}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-900 text-amber-50 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-40 transition-all shadow-md shadow-stone-900/10 active:scale-[0.98]"
              >
                {isRecognizing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Transcribing Handwriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Transcribe to 7 Notebook Lines
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setRecognizedResult(null)}
                  className="px-3 py-2 rounded-xl text-stone-700 bg-white border border-stone-300 text-xs hover:bg-stone-100"
                >
                  Re-scan
                </button>
                <button
                  onClick={handleApply}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-md active:scale-[0.98]"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Apply Transcribed Lines to Page
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
