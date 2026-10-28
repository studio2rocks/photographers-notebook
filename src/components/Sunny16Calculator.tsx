import React, { useState } from 'react';
import { Sun, Cloud, CloudSun, Sunset, Moon, Sparkles, Check, X } from 'lucide-react';

interface Sunny16CalculatorProps {
  currentFilmIso: string;
  onApplyExposure: (fStop: string, shutterSpeed: string, noteAppendix?: string) => void;
  onClose: () => void;
}

export const Sunny16Calculator: React.FC<Sunny16CalculatorProps> = ({
  currentFilmIso,
  onApplyExposure,
  onClose,
}) => {
  // Extract number from ISO string, e.g. "ISO 400" -> 400
  const match = currentFilmIso.match(/(\d+)/);
  const isoNumber = match ? parseInt(match[1], 10) : 400;

  // Closest standard shutter speed to 1/ISO
  const getBaseShutter = (iso: number) => {
    if (iso >= 3200) return '1/4000s';
    if (iso >= 1600) return '1/2000s';
    if (iso >= 800) return '1/1000s';
    if (iso >= 400) return '1/500s';
    if (iso >= 200) return '1/250s';
    if (iso >= 100) return '1/125s';
    if (iso >= 50) return '1/60s';
    return '1/500s';
  };

  const baseShutter = getBaseShutter(isoNumber);

  const LIGHT_CONDITIONS = [
    {
      id: 'bright-sun',
      title: 'Bright Sunny Daylight',
      desc: 'Distinct, sharp dark shadows',
      fStop: 'f/16',
      shutter: baseShutter,
      icon: Sun,
    },
    {
      id: 'hazy-sun',
      title: 'Hazy Sun / Slight Overcast',
      desc: 'Soft edges around shadows',
      fStop: 'f/11',
      shutter: baseShutter,
      icon: CloudSun,
    },
    {
      id: 'overcast',
      title: 'Overcast / Open Shade',
      desc: 'Barely visible shadows, diffused light',
      fStop: 'f/8',
      shutter: baseShutter,
      icon: Cloud,
    },
    {
      id: 'heavy-overcast',
      title: 'Heavy Overcast / Deep Shade',
      desc: 'No shadows, stormy skies or under trees',
      fStop: 'f/5.6',
      shutter: baseShutter,
      icon: Cloud,
    },
    {
      id: 'golden-hour',
      title: 'Sunset / Golden Hour',
      desc: 'Warm low angle, dramatic backlight',
      fStop: 'f/2.8',
      shutter: baseShutter === '1/500s' ? '1/250s' : baseShutter,
      icon: Sunset,
    },
  ];

  const [selectedCondition, setSelectedCondition] = useState(LIGHT_CONDITIONS[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#f7f3ea] rounded-2xl shadow-2xl border border-[#d8cdbc] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#ebe3d5] border-b border-[#dad0bf] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-semibold text-stone-900">
              Sunny 16 Exposure Metering Guide
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
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/70 font-mono">
            <span className="text-stone-600">Base Film Speed:</span>
            <span className="font-bold text-amber-950">{currentFilmIso} (1/{isoNumber}s rule)</span>
          </div>

          <div className="space-y-2">
            {LIGHT_CONDITIONS.map(cond => {
              const Icon = cond.icon;
              const isSelected = selectedCondition.id === cond.id;
              return (
                <button
                  key={cond.id}
                  onClick={() => setSelectedCondition(cond)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-100/70 border-amber-800/60 shadow-xs ring-1 ring-amber-800/30'
                      : 'bg-white/80 border-stone-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900">{cond.title}</h4>
                      <p className="text-[11px] text-stone-500">{cond.desc}</p>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className="text-xs font-bold text-stone-900 block">{cond.fStop}</span>
                    <span className="text-[11px] text-stone-600">{cond.shutter}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#ebe3d5] border-t border-[#dad0bf] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl text-stone-700 bg-white border border-stone-300 text-xs hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApplyExposure(selectedCondition.fStop, selectedCondition.shutter, `Sunny 16: ${selectedCondition.title}`);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-800 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Apply {selectedCondition.fStop} @ {selectedCondition.shutter}
          </button>
        </div>
      </div>
    </div>
  );
};
