import React from 'react';
import { FilmRoll, PhotographyLogEntry } from '../types/notebook';
import { Film, CheckCircle2, CircleDashed, ChevronRight, X, PenTool, Mic } from 'lucide-react';

interface ContactSheetViewProps {
  roll: FilmRoll;
  entries: PhotographyLogEntry[];
  currentFrame: number;
  onSelectFrame: (frameNum: number) => void;
  onClose: () => void;
}

export const ContactSheetView: React.FC<ContactSheetViewProps> = ({
  roll,
  entries,
  currentFrame,
  onSelectFrame,
  onClose,
}) => {
  const frameNumbers = Array.from({ length: roll.totalFrames }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#1c1a17] text-stone-200 rounded-2xl shadow-2xl border border-stone-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Contact Sheet Header */}
        <div className="px-5 py-3.5 bg-[#141210] border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Film className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="text-sm font-semibold text-stone-100 tracking-tight font-mono">
                DARKROOM CONTACT SHEET · {roll.name.toUpperCase()}
              </h3>
              <p className="text-[11px] text-stone-400 font-mono">
                {roll.filmStock} · {roll.camera} · {entries.length} / {roll.totalFrames} exposures logged
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sprocket Bar Top */}
        <div className="bg-[#0f0e0c] px-4 py-1.5 flex items-center justify-between overflow-x-hidden border-b border-stone-900 select-none">
          <span className="text-[10px] text-amber-500/80 font-mono font-bold tracking-widest">
            SAFETY FILM ▲ {roll.filmStock.toUpperCase()}
          </span>
          <div className="flex gap-2">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="w-2.5 h-3.5 bg-stone-900 rounded-xs border border-stone-800" />
            ))}
          </div>
        </div>

        {/* Frames Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-[#181614]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {frameNumbers.map(num => {
              const entry = entries.find(e => e.frameNumber === num);
              const isSelected = num === currentFrame;
              const hasData = !!entry && (!!entry.location || !!entry.fStop || !!entry.personalNote);

              return (
                <div
                  key={num}
                  onClick={() => {
                    onSelectFrame(num);
                    onClose();
                  }}
                  className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                      : hasData
                      ? 'bg-[#221f1c] border-stone-700/80 hover:border-amber-400/60 hover:bg-[#282522]'
                      : 'bg-[#181614] border-stone-800/80 hover:border-stone-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* Top Bar of Negative Frame */}
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="font-bold text-amber-400">EXP #{num}</span>
                    {hasData ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        {entry?.inputMethod === 'handwriting' && <PenTool className="w-2.5 h-2.5" />}
                        {entry?.inputMethod === 'speech' && <Mic className="w-2.5 h-2.5" />}
                        Logged
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500">Unexposed</span>
                    )}
                  </div>

                  {/* Frame Body Preview */}
                  {hasData && entry ? (
                    <div className="space-y-1 text-[11px] font-mono text-stone-300 my-1">
                      <div className="flex items-center justify-between text-stone-400 text-[10px]">
                        <span className="text-amber-200 font-bold">{entry.fStop || '—'}</span>
                        <span>{entry.shutterSpeed || '—'}</span>
                      </div>
                      <p className="line-clamp-1 text-stone-300 text-[11px] font-sans">
                        {entry.location || 'Location not noted'}
                      </p>
                      {entry.personalNote && (
                        <p className="line-clamp-1 text-[10px] text-stone-400 italic font-sans">
                          "{entry.personalNote}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-600 my-2">
                      <CircleDashed className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-mono">Ready to log</span>
                    </div>
                  )}

                  {/* Bottom negative rebate */}
                  <div className="pt-1 border-t border-stone-800/80 flex items-center justify-between text-[9px] font-mono text-stone-500">
                    <span>{num}</span>
                    <span>{num}A</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sprocket Bar Bottom */}
        <div className="bg-[#0f0e0c] px-4 py-1.5 flex items-center justify-between overflow-x-hidden border-t border-stone-900 select-none">
          <div className="flex gap-2">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="w-2.5 h-3.5 bg-stone-900 rounded-xs border border-stone-800" />
            ))}
          </div>
          <span className="text-[10px] text-stone-500 font-mono">
            {roll.totalFrames} FRAMES TOTAL
          </span>
        </div>
      </div>
    </div>
  );
};
