import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  Check, 
  Loader2, 
  Volume2, 
  Play, 
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { PhotographyLogEntry } from '../types/notebook';

interface SpeechInputModalProps {
  currentEntry: Partial<PhotographyLogEntry>;
  defaultFilmSpeed?: string;
  onApplyTranscription: (data: Partial<PhotographyLogEntry>) => void;
  onClose: () => void;
}

export const SpeechInputModal: React.FC<SpeechInputModalProps> = ({
  currentEntry,
  defaultFilmSpeed = 'ISO 400',
  onApplyTranscription,
  onClose,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(prev => {
          // If interim, update smoothly
          return currentTranscript;
        });
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. You can also test with quick speech samples below or type your spoken transcript.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setErrorMsg('Web Speech API is not supported in this browser window, but you can type your voice note or use one-click samples below.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const toggleListening = () => {
    setErrorMsg(null);
    if (!recognitionRef.current) {
      setErrorMsg('Microphone recognition unavailable. Try typing below or click sample dictations.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        console.error('Error starting recognition:', err);
        setErrorMsg('Could not access microphone: ' + err.message);
      }
    }
  };

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || transcript;
    if (!text.trim()) {
      setErrorMsg('Please speak or type your voice note first.');
      return;
    }

    setIsParsing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/parse-voice-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          defaultDate: currentEntry.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          defaultFilmSpeed,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Parsing error');
      }

      const res = await response.json();
      if (res.success && res.data) {
        setParsedResult(res.data);
      }
    } catch (err: any) {
      console.error('Failed to parse voice transcript:', err);
      setErrorMsg(err.message || 'Could not parse voice into notebook lines.');
    } finally {
      setIsParsing(false);
    }
  };

  const sampleDictations = [
    {
      label: 'Golden Hour Street Exposure',
      text: 'Frame 18 on Prince Street SoHo, late afternoon golden light around 5:15 PM. Shooting f/2.8 at 1/500th of a second on Kodak Portra 400. Beautiful warm side lighting hitting an old bakery storefront with long cast shadows.',
    },
    {
      label: 'Moody Overcast Portrait',
      text: 'October 27th at Seattle Pike Place Market, heavy overcast around 2 PM. Aperture wide open at f/1.4, shutter speed 1/250, Ilford HP5 400 black and white. Soft diffused skin tones on the flower vendor, excellent bokeh.',
    },
    {
      label: 'Night Neon Walk',
      text: 'Chinatown neon signs at 8:30 PM, shot at f/2 and 1/60th on CineStill 800T. Halation glow around red neon signs, slight motion blur in passing cyclist.',
    },
  ];

  const handleApply = () => {
    if (!parsedResult) return;
    onApplyTranscription({
      camera: parsedResult.camera || currentEntry.camera || '',
      lens: parsedResult.lens || currentEntry.lens || '',
      date: parsedResult.date || currentEntry.date || '',
      location: parsedResult.location || currentEntry.location || '',
      timeOfDay: parsedResult.timeOfDay || currentEntry.timeOfDay || '',
      fStop: parsedResult.fStop || currentEntry.fStop || '',
      shutterSpeed: parsedResult.shutterSpeed || currentEntry.shutterSpeed || '',
      filmSpeed: parsedResult.filmSpeed || currentEntry.filmSpeed || '',
      personalNote: parsedResult.personalNote || currentEntry.personalNote || '',
      inputMethod: 'speech',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#f7f2e7] rounded-2xl shadow-2xl border border-[#d6cbba] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#eae2d3] border-b border-[#d8cdbc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-900/10 flex items-center justify-center text-red-900">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 tracking-tight">
                Speech to Text Dictation
              </h2>
              <p className="text-[11px] text-stone-600 font-mono">
                Dictate exposure details naturally · AI will map into 7 lines
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

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Main Record Button & Waveform Area */}
          <div className="flex flex-col items-center justify-center py-4 bg-[#eee7d8] rounded-xl border border-[#dfd5c4] text-center p-4">
            <button
              onClick={toggleListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
                  : 'bg-stone-900 text-amber-100 hover:bg-stone-800 active:scale-95'
              }`}
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>

            <span className="text-xs font-semibold mt-3 text-stone-800">
              {isListening ? 'Listening... Speak your frame notes now' : 'Tap to start recording speech'}
            </span>
            <span className="text-[11px] text-stone-500 mt-0.5">
              Mention date, location, time, f-stop, shutter speed, film speed, or notes
            </span>
          </div>

          {/* Spoken Transcript Area */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Spoken Transcript (Editable)
            </label>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="e.g. 'October 27, Brooklyn Bridge park, sunset 6 PM. Shooting f/2.8 at 1/500th with Portra 400, rim lighting on model with violin...'"
              rows={3}
              className="w-full px-3 py-2 text-xs text-stone-900 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono resize-none"
            />
          </div>

          {/* Quick Pre-baked Samples for Immediate Testing */}
          <div>
            <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block mb-1.5">
              Or Test with One-Click Spoken Field Demos:
            </span>
            <div className="flex flex-col gap-1.5">
              {sampleDictations.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(sample.text);
                    handleParse(sample.text);
                  }}
                  className="text-left p-2.5 rounded-lg bg-white/70 hover:bg-white border border-stone-200 text-xs text-stone-700 transition-colors group flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-stone-900 block group-hover:text-amber-900">
                      {sample.label}
                    </span>
                    <span className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      "{sample.text}"
                    </span>
                  </div>
                  <Play className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-800 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Parsed Result Preview */}
          {parsedResult && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                Mapped into 7 Photography Notebook Lines:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-stone-800 bg-white/90 p-3 rounded-lg border border-emerald-100">
                {parsedResult.camera && (
                  <div><span className="text-stone-400">Camera:</span> <span className="font-semibold text-amber-950">{parsedResult.camera}</span></div>
                )}
                {parsedResult.lens && (
                  <div><span className="text-stone-400">Lens:</span> <span className="font-semibold text-amber-950">{parsedResult.lens}</span></div>
                )}
                <div><span className="text-stone-400">Line 1 Date:</span> <span className="font-semibold">{parsedResult.date}</span></div>
                <div><span className="text-stone-400">Line 2 Location:</span> <span className="font-semibold">{parsedResult.location}</span></div>
                <div><span className="text-stone-400">Line 3 Time of Day:</span> <span className="font-semibold">{parsedResult.timeOfDay}</span></div>
                <div><span className="text-stone-400">Line 4 f Stop:</span> <span className="font-semibold">{parsedResult.fStop}</span></div>
                <div><span className="text-stone-400">Line 5 Shutter Speed:</span> <span className="font-semibold">{parsedResult.shutterSpeed}</span></div>
                <div><span className="text-stone-400">Line 6 Film Speed:</span> <span className="font-semibold">{parsedResult.filmSpeed}</span></div>
                <div className="col-span-1 sm:col-span-2">
                  <span className="text-stone-400">Line 7 Personal Note:</span> <span>{parsedResult.personalNote}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#eae2d3] border-t border-[#d8cdbc] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-stone-700 bg-white border border-stone-300 text-xs hover:bg-stone-100"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!parsedResult ? (
              <button
                onClick={() => handleParse()}
                disabled={isParsing || !transcript.trim()}
                className="px-4 py-2.5 rounded-xl bg-stone-900 text-amber-50 text-xs font-semibold flex items-center gap-2 hover:bg-stone-800 disabled:opacity-40 transition-all shadow-md active:scale-[0.98]"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Parsing Spoken Details...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Parse into 7 Lines
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleApply}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-md active:scale-[0.98]"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Apply to Frame Lines
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
