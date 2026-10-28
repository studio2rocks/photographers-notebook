import React, { useState } from 'react';
import { FilmRoll, COMMON_FILM_STOCKS } from '../types/notebook';
import { Film, Plus, Camera, Check, X, Calendar, Layers } from 'lucide-react';

interface RollManagerModalProps {
  rolls: FilmRoll[];
  activeRollId: string;
  onSelectRoll: (id: string) => void;
  onCreateRoll: (newRoll: Omit<FilmRoll, 'id'>) => void;
  onClose: () => void;
}

export const RollManagerModal: React.FC<RollManagerModalProps> = ({
  rolls,
  activeRollId,
  onSelectRoll,
  onCreateRoll,
  onClose,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [camera, setCamera] = useState('Leica M6 · 35mm f/2');
  const [filmStock, setFilmStock] = useState('Kodak Portra 400');
  const [iso, setIso] = useState('ISO 400');
  const [totalFrames, setTotalFrames] = useState(36);

  const handleSelectStock = (stock: typeof COMMON_FILM_STOCKS[0]) => {
    setFilmStock(stock.name);
    setIso(stock.iso);
    if (!name) {
      setName(`Roll #${rolls.length + 1} · ${stock.name}`);
    }
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateRoll({
      name: name.trim(),
      camera: camera.trim() || 'Manual 35mm Camera',
      filmStock,
      iso,
      totalFrames,
      startDate: new Date().toISOString().split('T')[0],
      isArchived: false,
    });
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#f7f3ea] rounded-2xl shadow-2xl border border-[#d8cdbc] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#ebe3d5] border-b border-[#dad0bf] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Film className="w-4 h-4 text-amber-900" />
            <h3 className="text-sm font-semibold text-stone-900">
              Film Rolls & Camera Journal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!isCreating ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Loaded Rolls ({rolls.length})
                </span>
                <button
                  onClick={() => {
                    setName(`Roll #${rolls.length + 1} · Kodak Portra 400`);
                    setIsCreating(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 text-amber-50 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Load New Film Roll
                </button>
              </div>

              <div className="space-y-2.5">
                {rolls.map(roll => {
                  const isActive = roll.id === activeRollId;
                  return (
                    <div
                      key={roll.id}
                      onClick={() => onSelectRoll(roll.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-amber-100/80 border-amber-800/60 ring-1 ring-amber-800/30'
                          : 'bg-white/80 border-stone-200 hover:bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-stone-900">{roll.name}</h4>
                          {isActive && (
                            <span className="text-[10px] font-mono text-amber-900 bg-amber-200/70 px-1.5 py-0.5 rounded">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3 text-stone-400" />
                            {roll.camera}
                          </span>
                          <span>·</span>
                          <span>{roll.filmStock} ({roll.iso})</span>
                          <span>·</span>
                          <span>{roll.isUnlimited || (roll.totalFrames && roll.totalFrames > 100) ? 'Continuous' : `${roll.totalFrames} exp`}</span>
                        </div>
                      </div>

                      {isActive && <Check className="w-4 h-4 text-amber-900 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmitCreate} className="space-y-3.5">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Load New Roll Into Camera
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Roll Title / Description
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Roll #03 · Tokyo Street Scenes"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Camera Body & Lens
                </label>
                <input
                  type="text"
                  value={camera}
                  onChange={e => setCamera(e.target.value)}
                  placeholder="e.g. Nikon FM2 · Nikkor 50mm f/1.4"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Select Film Stock
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {COMMON_FILM_STOCKS.map(stock => (
                    <button
                      type="button"
                      key={stock.name}
                      onClick={() => handleSelectStock(stock)}
                      className={`text-left p-2 rounded-lg border text-xs font-mono transition-colors ${
                        filmStock === stock.name
                          ? 'bg-amber-100 border-amber-800 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="block truncate">{stock.name}</span>
                      <span className="text-[10px] text-stone-500">{stock.iso}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Frame Count
                  </label>
                  <select
                    value={totalFrames}
                    onChange={e => setTotalFrames(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg font-mono"
                  >
                    <option value="999999">Continuous field log</option>
                    <option value="36">36 exposures (Standard 35mm roll)</option>
                    <option value="24">24 exposures (Short 35mm roll)</option>
                    <option value="12">12 exposures (120 6x6 Medium Format)</option>
                    <option value="10">10 exposures (120 6x7 Medium Format)</option>
                    <option value="16">16 exposures (120 6x4.5 Medium Format)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Base ISO Speed
                  </label>
                  <input
                    type="text"
                    value={iso}
                    onChange={e => setIso(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-stone-900 text-amber-50 text-xs font-semibold hover:bg-stone-800"
                >
                  Confirm & Load Roll
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#ebe3d5] border-t border-[#dad0bf] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 text-stone-100 text-xs font-semibold hover:bg-stone-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
