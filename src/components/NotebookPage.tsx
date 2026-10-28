import React, { useState, useEffect } from 'react';
import { 
  FilmRoll, 
  PhotographyLogEntry, 
  COMMON_APERTURES, 
  COMMON_SHUTTERS, 
  COMMON_TIMES, 
  COMMON_FILM_STOCKS,
  COMMON_CAMERAS,
  COMMON_LENSES
} from '../types/notebook';
import { 
  ChevronLeft, 
  ChevronRight, 
  Mic, 
  MicOff, 
  PenTool, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Aperture, 
  Camera, 
  Sun, 
  Grid, 
  FileText, 
  Check, 
  Layers,
  Image as ImageIcon,
  RotateCcw,
  Sliders,
  Focus
} from 'lucide-react';

interface NotebookPageProps {
  roll: FilmRoll;
  entry: PhotographyLogEntry;
  totalFrames: number;
  onUpdateEntry: (updated: Partial<PhotographyLogEntry>) => void;
  onPrevFrame: () => void;
  onNextFrame: () => void;
  onJumpToFrame?: (frameNum: number) => void;
  onOpenHandwriting: () => void;
  onOpenSpeech: () => void;
  onOpenSunny16: () => void;
  onOpenContactSheet: () => void;
}

export const NotebookPage: React.FC<NotebookPageProps> = ({
  roll,
  entry,
  totalFrames,
  onUpdateEntry,
  onPrevFrame,
  onNextFrame,
  onJumpToFrame,
  onOpenHandwriting,
  onOpenSpeech,
  onOpenSunny16,
  onOpenContactSheet,
}) => {
  // Quick picker drawer active tab (null, 'aperture', 'shutter', 'time', 'film')
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [activeLineSpeech, setActiveLineSpeech] = useState<string | null>(null);
  const [showHandwrittenCanvas, setShowHandwrittenCanvas] = useState(false);

  // Line Speech Recognition instance
  const lineRecognitionRef = React.useRef<any>(null);

  const startLineSpeech = (field: keyof PhotographyLogEntry) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use the Speech-to-Text modal.');
      return;
    }

    if (activeLineSpeech === field) {
      if (lineRecognitionRef.current) lineRecognitionRef.current.stop();
      setActiveLineSpeech(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setActiveLineSpeech(field as string);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          onUpdateEntry({ [field]: spoken, inputMethod: 'speech' });
        }
        setActiveLineSpeech(null);
      };

      recognition.onerror = () => {
        setActiveLineSpeech(null);
      };

      recognition.onend = () => {
        setActiveLineSpeech(null);
      };

      lineRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Line speech error:', err);
      setActiveLineSpeech(null);
    }
  };

  // Quick GPS Location helper
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        
        try {
          // Attempt reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.suburb || data.address?.village || '';
            const road = data.address?.road || '';
            const locName = [road, city].filter(Boolean).join(', ') || `${lat}° N, ${lon}° W`;
            onUpdateEntry({ location: locName });
            setIsLocating(false);
            return;
          }
        } catch (e) {
          // Fallback to coordinates
        }
        onUpdateEntry({ location: `${lat}° N, ${lon}° W` });
        setIsLocating(false);
      },
      error => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        onUpdateEntry({ location: 'Outdoor Field Location' });
      },
      { timeout: 7000 }
    );
  };

  const handleSetToday = () => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    onUpdateEntry({ date: today });
  };

  const handleSetNow = () => {
    const now = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    onUpdateEntry({ timeOfDay: now });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1b18] select-text overflow-hidden">
      {/* Notebook Top Leather Header / Frame Ribbon */}
      <div className="px-4 py-2.5 bg-[#25221d] border-b border-[#3d3831] flex items-center justify-between text-xs shrink-0 select-none shadow-sm z-10">
        <div className="flex items-center gap-2">
          {/* Film negative frame badge with direct editable input */}
          <div className="px-2 py-0.5 rounded bg-[#151311] border border-amber-900/60 font-mono text-[11px] text-amber-400 font-bold tracking-wider flex items-center gap-1.5 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>EXP #</span>
            <input
              type="number"
              min={1}
              max={totalFrames}
              value={entry.frameNumber}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  if (onJumpToFrame) onJumpToFrame(val);
                  else onUpdateEntry({ frameNumber: val });
                }
              }}
              title="Click or type to change Frame Number"
              className="w-10 bg-[#25201b] border border-amber-800/60 rounded text-center text-amber-300 font-bold font-mono focus:bg-black focus:outline-none focus:ring-1 focus:ring-amber-500 py-0.5"
            />
            <span className="text-stone-500 font-normal">/ {totalFrames}</span>
          </div>

          <div className="flex items-center gap-1 text-stone-300">
            <Camera className="w-4 h-4 text-amber-400" />
            <span className="text-stone-400 font-mono text-[11px] hidden sm:inline truncate max-w-[150px]">
              {entry.camera || roll.camera}
            </span>
          </div>
        </div>

        {/* Notebook Mode Shortcuts */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSunny16}
            title="Sunny 16 Exposure Meter"
            className="p-1.5 rounded-lg bg-[#322c25] hover:bg-[#3e372e] text-amber-200 border border-stone-700/60 transition-colors"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenContactSheet}
            title="Darkroom Contact Sheet"
            className="p-1.5 rounded-lg bg-[#322c25] hover:bg-[#3e372e] text-stone-200 border border-stone-700/60 transition-colors"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {entry.handwritingImageData && (
            <button
              onClick={() => setShowHandwrittenCanvas(!showHandwrittenCanvas)}
              title="Toggle Original Handwritten Drawing"
              className={`p-1.5 rounded-lg border transition-colors ${
                showHandwrittenCanvas 
                  ? 'bg-amber-800 text-amber-100 border-amber-700' 
                  : 'bg-[#322c25] text-stone-300 border-stone-700/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Ruled Notebook Paper Area */}
      <div className="flex-1 overflow-y-auto notebook-ruled-page p-3 sm:p-5 relative shadow-inner">
        {/* Notebook Page Binding Hole / Spiral simulation on left edge */}
        <div className="absolute left-1 top-4 bottom-4 flex flex-col justify-around pointer-events-none opacity-25">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-stone-700 border border-stone-900 shadow-inner" />
          ))}
        </div>

        {/* Page Inner Container */}
        <div className="pl-9 pr-2 max-w-xl mx-auto space-y-3 sm:space-y-4">
          
          {/* Header on Paper */}
          <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between select-none">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase">
                EXPOSURE TRACKING LOG
              </span>
              <h2 className="text-sm font-bold text-stone-900 tracking-tight font-serif">
                Frame #{entry.frameNumber} · Field Notebook
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Handwriting trigger */}
              <button
                onClick={onOpenHandwriting}
                className="px-2 py-1 rounded-md bg-[#eee7d8] hover:bg-[#e4dcce] border border-[#d2c7b5] text-stone-800 text-[11px] font-medium flex items-center gap-1 transition-colors"
                title="Open handwriting canvas pad"
              >
                <PenTool className="w-3 h-3 text-amber-900" />
                <span>Handwrite</span>
              </button>

              {/* Master Voice Dictate trigger */}
              <button
                onClick={onOpenSpeech}
                className="px-2 py-1 rounded-md bg-[#eee7d8] hover:bg-[#e4dcce] border border-[#d2c7b5] text-stone-800 text-[11px] font-medium flex items-center gap-1 transition-colors"
                title="Dictate entire frame via speech"
              >
                <Mic className="w-3 h-3 text-red-800" />
                <span>Dictate</span>
              </button>
            </div>
          </div>

          {/* REQUESTED INPUTS: FRAME, CAMERA, LENS GEAR BLOCK */}
          <div className="bg-[#f3edd9]/90 p-2.5 rounded-xl border border-[#dcd1be] shadow-xs space-y-2 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* FRAME INPUT */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-stone-600 mb-0.5">
                  <span className="flex items-center gap-1 text-stone-700">
                    <Focus className="w-3 h-3 text-amber-900" />
                    FRAME
                  </span>
                  <span className="text-[10px] text-stone-400">of {totalFrames}</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={totalFrames}
                    value={entry.frameNumber}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        if (onJumpToFrame) onJumpToFrame(val);
                        else onUpdateEntry({ frameNumber: val });
                      }
                    }}
                    placeholder="1"
                    className="w-full px-2 py-1 bg-white border border-stone-300 rounded text-center text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              {/* CAMERA INPUT */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-stone-600 mb-0.5">
                  <span className="flex items-center gap-1 text-stone-700">
                    <Camera className="w-3 h-3 text-amber-900" />
                    CAMERA
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setActivePicker(activePicker === 'camera' ? null : 'camera')}
                      className="text-[10px] text-amber-900 hover:underline px-0.5"
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => startLineSpeech('camera')}
                      title="Speak camera name"
                      className={`p-0.5 rounded text-stone-500 hover:text-stone-900 ${
                        activeLineSpeech === 'camera' ? 'text-red-600 animate-pulse' : ''
                      }`}
                    >
                      <Mic className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={entry.camera !== undefined ? entry.camera : roll.camera}
                  onChange={e => onUpdateEntry({ camera: e.target.value, inputMethod: 'manual' })}
                  placeholder="e.g. Leica M6"
                  className="w-full px-2 py-1 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800 truncate"
                />
              </div>

              {/* LENS INPUT */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-stone-600 mb-0.5">
                  <span className="flex items-center gap-1 text-stone-700">
                    <Aperture className="w-3 h-3 text-amber-900" />
                    LENS
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setActivePicker(activePicker === 'lens' ? null : 'lens')}
                      className="text-[10px] text-amber-900 hover:underline px-0.5"
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => startLineSpeech('lens')}
                      title="Speak lens"
                      className={`p-0.5 rounded text-stone-500 hover:text-stone-900 ${
                        activeLineSpeech === 'lens' ? 'text-red-600 animate-pulse' : ''
                      }`}
                    >
                      <Mic className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={entry.lens || ''}
                  onChange={e => onUpdateEntry({ lens: e.target.value, inputMethod: 'manual' })}
                  placeholder="e.g. 35mm f/2"
                  className="w-full px-2 py-1 bg-white border border-stone-300 rounded text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800 truncate"
                />
              </div>
            </div>

            {/* Quick Camera Presets Tray */}
            {activePicker === 'camera' && (
              <div className="p-2 bg-white rounded-lg border border-stone-300 shadow-xs space-y-1">
                <span className="text-[10px] text-stone-500 font-semibold uppercase block">Quick Camera Select:</span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_CAMERAS.map(cam => (
                    <button
                      key={cam}
                      type="button"
                      onClick={() => {
                        onUpdateEntry({ camera: cam, inputMethod: 'manual' });
                        setActivePicker(null);
                      }}
                      className="text-[10px] px-2 py-0.5 bg-[#f6f1e5] hover:bg-amber-100 rounded border border-stone-300 text-stone-800"
                    >
                      {cam}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Lens Presets Tray */}
            {activePicker === 'lens' && (
              <div className="p-2 bg-white rounded-lg border border-stone-300 shadow-xs space-y-1">
                <span className="text-[10px] text-stone-500 font-semibold uppercase block">Quick Lens Select:</span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_LENSES.map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        onUpdateEntry({ lens: l, inputMethod: 'manual' });
                        setActivePicker(null);
                      }}
                      className="text-[10px] px-2 py-0.5 bg-[#f6f1e5] hover:bg-amber-100 rounded border border-stone-300 text-stone-800"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toggle between Typed Lines vs Original Handwritten Image */}
          {showHandwrittenCanvas && entry.handwritingImageData ? (
            <div className="bg-[#faf5eb] p-3 rounded-xl border border-stone-300 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600 font-mono">
                <span className="flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-amber-900" />
                  Photographer's Original Handwritten Ink Drawing
                </span>
                <button
                  onClick={() => setShowHandwrittenCanvas(false)}
                  className="text-amber-900 hover:underline"
                >
                  View Ruled Lines
                </button>
              </div>
              <img
                src={entry.handwritingImageData}
                alt="Handwritten note"
                className="w-full rounded-lg border border-stone-300 shadow-xs object-contain max-h-[360px]"
              />
            </div>
          ) : (
            /* EXACT 7 LINES AS REQUESTED */
            <div className="space-y-3 font-mono">
              
              {/* LINE 1: DATE */}
              <div className="group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px]">1</span>
                    Line 1: Date
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSetToday}
                      className="text-[10px] text-amber-900 hover:underline px-1 py-0.5"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => startLineSpeech('date')}
                      title="Speak date"
                      className={`p-1 rounded text-stone-500 hover:text-stone-900 ${
                        activeLineSpeech === 'date' ? 'text-red-600 animate-pulse' : ''
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={entry.date}
                  onChange={e => onUpdateEntry({ date: e.target.value, inputMethod: 'manual' })}
                  placeholder="e.g. Oct 27, 2026"
                  className="w-full bg-transparent border-b border-stone-300/80 focus:border-amber-900 focus:outline-none text-sm text-stone-900 py-1 font-typewriter tracking-wide"
                />
              </div>

              {/* LINE 2: LOCATION */}
              <div className="group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px]">2</span>
                    Line 2: Location
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="text-[10px] text-amber-900 hover:underline px-1 py-0.5 flex items-center gap-0.5"
                    >
                      <MapPin className="w-2.5 h-2.5" />
                      {isLocating ? 'Locating...' : 'GPS'}
                    </button>
                    <button
                      onClick={() => startLineSpeech('location')}
                      title="Speak location"
                      className={`p-1 rounded text-stone-500 hover:text-stone-900 ${
                        activeLineSpeech === 'location' ? 'text-red-600 animate-pulse' : ''
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={entry.location}
                  onChange={e => onUpdateEntry({ location: e.target.value, inputMethod: 'manual' })}
                  placeholder="e.g. Washington Square Park, NYC"
                  className="w-full bg-transparent border-b border-stone-300/80 focus:border-amber-900 focus:outline-none text-sm text-stone-900 py-1 font-typewriter tracking-wide"
                />
              </div>

              {/* LINE 3: TIME OF DAY */}
              <div className="group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px]">3</span>
                    Line 3: Time of Day
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSetNow}
                      className="text-[10px] text-amber-900 hover:underline px-1 py-0.5"
                    >
                      Now
                    </button>
                    <button
                      onClick={() => setActivePicker(activePicker === 'time' ? null : 'time')}
                      className="text-[10px] text-amber-900 hover:underline px-1 py-0.5"
                    >
                      Tags
                    </button>
                    <button
                      onClick={() => startLineSpeech('timeOfDay')}
                      title="Speak time"
                      className={`p-1 rounded text-stone-500 hover:text-stone-900 ${
                        activeLineSpeech === 'timeOfDay' ? 'text-red-600 animate-pulse' : ''
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={entry.timeOfDay}
                  onChange={e => onUpdateEntry({ timeOfDay: e.target.value, inputMethod: 'manual' })}
                  placeholder="e.g. Golden Hour (5:45 PM)"
                  className="w-full bg-transparent border-b border-stone-300/80 focus:border-amber-900 focus:outline-none text-sm text-stone-900 py-1 font-typewriter tracking-wide"
                />

                {/* Quick Time Tags Tray */}
                {activePicker === 'time' && (
                  <div className="flex flex-wrap gap-1 mt-1.5 p-2 bg-[#f2ecdd] rounded-lg border border-[#e0d5c2]">
                    {COMMON_TIMES.map(t => (
                      <button
                        key={t}
                        onClick={() => {
                          onUpdateEntry({ timeOfDay: t, inputMethod: 'manual' });
                          setActivePicker(null);
                        }}
                        className="text-[10px] px-2 py-0.5 bg-white rounded border border-stone-300 text-stone-700 hover:bg-stone-50"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* LINE 4: F STOP (APERTURE) */}
              <div className="group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px]">4</span>
                    Line 4: f Stop
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActivePicker(activePicker === 'aperture' ? null : 'aperture')}
                      className="text-[10px] text-amber-900 hover:underline px-1 py-0.5"
                    >
                      Apertures
                    </button>
                    <button
                      onClick={() => startLineSpeech('fStop')}
                      title="Speak aperture"
                      className={`p-1 rounded text-stone-500 hover:text-stone-900 ${
                        activeLineSpeech === 'fStop' ? 'text-red-600 animate-pulse' : ''
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={entry.fStop}
                  onChange={e => onUpdateEntry({ fStop: e.target.value, inputMethod: 'manual' })}
                  placeholder="e.g. f/2.8 or f/4"
                  className="w-full bg-transparent border-b border-stone-300/80 focus:border-amber-900 focus:outline-none text-sm text-stone-900 py-1 font-typewriter tracking-wide font-bold"
                />

                {/* Aperture Dial Tray */}
                {activePicker === 'aperture' && (
                  <div className="flex flex-wrap gap-1 mt-1.5 p-2 bg-[#f2ecdd] rounded-lg border border-[#e0d5c2]">
                    {COMMON_APERTURES.map(ap => (
                      <button
                        key={ap}
                        onClick={() => {
                          onUpdateEntry({ fStop: ap, inputMethod: 'manual' });
                          setActivePicker(null);
                        }}
                        className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                          entry.fStop === ap
                            ? 'bg-amber-900 text-white border-amber-950 font-bold'
                            : 'bg-white rounded border-stone-300 text-stone-800 hover:bg-stone-50'
                        }`}
                      >
                        {ap}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* LINE 5: SHUTTER SPEED */}
              <div className="group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px]">5</span>
                    Line 5: Shutter Speed
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActivePicker(activePicker === 'shutter' ? null : 'shutter')}
                      className="text-[10px] text-amber-900 hover:underline px-1 py-0.5"
                    >
                      Speeds
                    </button>
                    <button
                      onClick={() => startLineSpeech('shutterSpeed')}
                      title="Speak shutter speed"
                      className={`p-1 rounded text-stone-500 hover:text-stone-900 ${
                        activeLineSpeech === 'shutterSpeed' ? 'text-red-600 animate-pulse' : ''
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={entry.shutterSpeed}
                  onChange={e => onUpdateEntry({ shutterSpeed: e.target.value, inputMethod: 'manual' })}
                  placeholder="e.g. 1/500s or 1/250s"
                  className="w-full bg-transparent border-b border-stone-300/80 focus:border-amber-900 focus:outline-none text-sm text-stone-900 py-1 font-typewriter tracking-wide font-bold"
                />

                {/* Shutter Speed Tray */}
                {activePicker === 'shutter' && (
                  <div className="flex flex-wrap gap-1 mt-1.5 p-2 bg-[#f2ecdd] rounded-lg border border-[#e0d5c2]">
                    {COMMON_SHUTTERS.map(sh => (
                      <button
                        key={sh}
                        onClick={() => {
                          onUpdateEntry({ shutterSpeed: sh, inputMethod: 'manual' });
                          setActivePicker(null);
                        }}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                          entry.shutterSpeed === sh
                            ? 'bg-amber-900 text-white border-amber-950 font-bold'
                            : 'bg-white border-stone-300 text-stone-800 hover:bg-stone-50'
                        }`}
                      >
                        {sh}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* LINE 6: FILM SPEED */}
              <div className="group">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px]">6</span>
                    Line 6: Film Speed
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateEntry({ filmSpeed: roll.filmStock + ' (' + roll.iso + ')' })}
                      className="text-[10px] text-amber-900 hover:underline px-1 py-0.5"
                    >
                      Roll Stock
                    </button>
                    <button
                      onClick={() => setActivePicker(activePicker === 'film' ? null : 'film')}
                      className="text-[10px] text-amber-900 hover:underline px-1 py-0.5"
                    >
                      Presets
                    </button>
                    <button
                      onClick={() => startLineSpeech('filmSpeed')}
                      title="Speak film speed"
                      className={`p-1 rounded text-stone-500 hover:text-stone-900 ${
                        activeLineSpeech === 'filmSpeed' ? 'text-red-600 animate-pulse' : ''
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={entry.filmSpeed}
                  onChange={e => onUpdateEntry({ filmSpeed: e.target.value, inputMethod: 'manual' })}
                  placeholder="e.g. ISO 400 · Kodak Portra 400"
                  className="w-full bg-transparent border-b border-stone-300/80 focus:border-amber-900 focus:outline-none text-sm text-stone-900 py-1 font-typewriter tracking-wide"
                />

                {/* Film Stock Tray */}
                {activePicker === 'film' && (
                  <div className="flex flex-wrap gap-1 mt-1.5 p-2 bg-[#f2ecdd] rounded-lg border border-[#e0d5c2]">
                    {COMMON_FILM_STOCKS.map(st => (
                      <button
                        key={st.name}
                        onClick={() => {
                          onUpdateEntry({ filmSpeed: `${st.name} (${st.iso})`, inputMethod: 'manual' });
                          setActivePicker(null);
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 bg-white rounded border border-stone-300 text-stone-700 hover:bg-stone-50"
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* LINE 7: PERSONAL NOTE */}
              <div className="group pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px]">7</span>
                    Line 7: Personal Note
                  </span>
                  <button
                    onClick={() => startLineSpeech('personalNote')}
                    title="Speak personal note"
                    className={`p-1 rounded text-stone-500 hover:text-stone-900 ${
                      activeLineSpeech === 'personalNote' ? 'text-red-600 animate-pulse' : ''
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                </div>
                <textarea
                  value={entry.personalNote}
                  onChange={e => onUpdateEntry({ personalNote: e.target.value, inputMethod: 'manual' })}
                  rows={3}
                  placeholder="Lighting conditions, lens used, subject notes, filter factor, developer notes..."
                  className="w-full bg-transparent border-b border-stone-300/80 focus:border-amber-900 focus:outline-none text-xs text-stone-900 py-1 font-handwriting text-[17px] leading-relaxed resize-none"
                />
              </div>

            </div>
          )}

          {/* Quick Input Method Badge */}
          <div className="pt-2 border-t border-stone-300/60 flex items-center justify-between text-[10px] text-stone-500 font-mono">
            <span>Method: {entry.inputMethod ? entry.inputMethod.toUpperCase() : 'MANUAL'}</span>
            <span>Last Edited: {new Date(entry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

        </div>
      </div>

      {/* Bottom Thumb Navigation Bar */}
      <div className="px-4 py-3 bg-[#24211c] border-t border-[#3a352c] flex items-center justify-between shrink-0 select-none z-20">
        <button
          onClick={onPrevFrame}
          disabled={entry.frameNumber <= 1}
          className="min-h-[44px] px-3.5 rounded-xl bg-[#322d25] hover:bg-[#3d372e] disabled:opacity-30 disabled:pointer-events-none text-stone-200 text-xs font-semibold flex items-center gap-1 border border-stone-700/60 transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Main Voice Quick Dictate */}
          <button
            onClick={onOpenSpeech}
            className="min-h-[44px] px-3.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800/80 text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="Dictate frame with voice"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Voice Note</span>
          </button>

          {/* Handwriting pad */}
          <button
            onClick={onOpenHandwriting}
            className="min-h-[44px] px-3.5 rounded-xl bg-[#322d25] hover:bg-[#3d372e] text-stone-200 border border-stone-700/60 text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="Write with digital ink"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ink Pad</span>
          </button>
        </div>

        <button
          onClick={onNextFrame}
          disabled={entry.frameNumber >= totalFrames}
          className="min-h-[44px] px-3.5 rounded-xl bg-amber-900 text-white hover:bg-amber-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 shadow-sm transition-all active:scale-95"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
