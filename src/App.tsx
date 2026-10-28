import React, { useState, useEffect } from 'react';
import { 
  FilmRoll, 
  PhotographyLogEntry, 
  DeviceMode 
} from './types/notebook';
import { 
  getStoredRolls, 
  saveStoredRolls, 
  getStoredEntries, 
  saveStoredEntries, 
  getActiveRollId, 
  saveActiveRollId, 
  getActiveFrameNumber, 
  saveActiveFrameNumber 
} from './utils/storage';
import { DeviceFrame } from './components/DeviceFrame';
import { NotebookPage } from './components/NotebookPage';
import { HandwritingPad } from './components/HandwritingPad';
import { SpeechInputModal } from './components/SpeechInputModal';
import { Sunny16Calculator } from './components/Sunny16Calculator';
import { RollManagerModal } from './components/RollManagerModal';
import { ContactSheetView } from './components/ContactSheetView';
import { ExportModal } from './components/ExportModal';
import { 
  Camera, 
  Film, 
  Grid, 
  Download, 
  Sun, 
  Plus, 
  Smartphone, 
  BookOpen, 
  Check, 
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [rolls, setRolls] = useState<FilmRoll[]>(() => getStoredRolls());
  const [entries, setEntries] = useState<PhotographyLogEntry[]>(() => getStoredEntries());
  const [activeRollId, setActiveRollId] = useState<string>(() => getActiveRollId());
  const [activeFrameNumber, setActiveFrameNumber] = useState<number>(() => getActiveFrameNumber());
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('ios');

  // Modals
  const [showHandwritingModal, setShowHandwritingModal] = useState(false);
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [showSunny16Modal, setShowSunny16Modal] = useState(false);
  const [showRollManagerModal, setShowRollManagerModal] = useState(false);
  const [showContactSheetModal, setShowContactSheetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Active Roll
  const activeRoll = rolls.find(r => r.id === activeRollId) || rolls[0];

  // Active Entry for current roll and frame
  const currentEntry: PhotographyLogEntry = entries.find(
    e => e.rollId === activeRoll.id && e.frameNumber === activeFrameNumber
  ) || {
    id: `entry-${activeRoll.id}-${activeFrameNumber}`,
    rollId: activeRoll.id,
    frameNumber: activeFrameNumber,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    location: '',
    timeOfDay: '',
    fStop: '',
    shutterSpeed: '',
    filmSpeed: `${activeRoll.filmStock} (${activeRoll.iso})`,
    personalNote: '',
    updatedAt: new Date().toISOString(),
  };

  // Sync to local storage
  useEffect(() => {
    saveStoredRolls(rolls);
  }, [rolls]);

  useEffect(() => {
    saveStoredEntries(entries);
  }, [entries]);

  useEffect(() => {
    saveActiveRollId(activeRollId);
  }, [activeRollId]);

  useEffect(() => {
    saveActiveFrameNumber(activeFrameNumber);
  }, [activeFrameNumber]);

  // Handle entry update
  const handleUpdateEntry = (fields: Partial<PhotographyLogEntry>) => {
    setEntries(prev => {
      const existingIdx = prev.findIndex(
        e => e.rollId === activeRoll.id && e.frameNumber === activeFrameNumber
      );

      const updatedItem: PhotographyLogEntry = {
        ...currentEntry,
        ...fields,
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updatedItem;
        return copy;
      } else {
        return [...prev, updatedItem];
      }
    });
  };

  // Handle handwriting transcription
  const handleApplyHandwriting = (
    transcribed: Partial<PhotographyLogEntry>,
    canvasDataUrl?: string
  ) => {
    handleUpdateEntry({
      ...transcribed,
      handwritingImageData: canvasDataUrl || currentEntry.handwritingImageData,
      inputMethod: 'handwriting',
    });
    setShowHandwritingModal(false);
  };

  // Handle speech transcription
  const handleApplySpeech = (transcribed: Partial<PhotographyLogEntry>) => {
    handleUpdateEntry({
      ...transcribed,
      inputMethod: 'speech',
    });
    setShowSpeechModal(false);
  };

  // Next / Prev Frame navigation
  const handlePrevFrame = () => {
    if (activeFrameNumber > 1) {
      setActiveFrameNumber(activeFrameNumber - 1);
    }
  };

  const handleNextFrame = () => {
    if (activeFrameNumber < activeRoll.totalFrames) {
      setActiveFrameNumber(activeFrameNumber + 1);
    }
  };

  // Add new exposure (jump to next empty frame)
  const handleAddNewExposure = () => {
    const rollEntries = entries.filter(e => e.rollId === activeRoll.id);
    const loggedNumbers = new Set(rollEntries.map(e => e.frameNumber));
    
    // Find first unexposed frame
    for (let i = 1; i <= activeRoll.totalFrames; i++) {
      if (!loggedNumbers.has(i)) {
        setActiveFrameNumber(i);
        return;
      }
    }
    // If all full, go to end or stay
    setActiveFrameNumber(activeRoll.totalFrames);
  };

  // Handle creating new roll
  const handleCreateRoll = (newRollData: Omit<FilmRoll, 'id'>) => {
    const newId = `roll-${Date.now()}`;
    const newRoll: FilmRoll = {
      ...newRollData,
      id: newId,
    };
    setRolls(prev => [...prev, newRoll]);
    setActiveRollId(newId);
    setActiveFrameNumber(1);
    setShowRollManagerModal(false);
  };

  return (
    <div className="min-h-screen bg-[#151311] text-stone-100 flex flex-col font-sans">
      {/* Top Bar Contract (Strict 3 Zones separated by gap-8) */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-stone-800 bg-[#1c1916]/95 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-amber-50">
            Analog Field Notes
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-300">
          <button
            onClick={() => setShowRollManagerModal(true)}
            className="hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5 text-amber-500" />
            <span>Rolls</span>
          </button>
          <button
            onClick={() => setShowContactSheetModal(true)}
            className="hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Grid className="w-3.5 h-3.5 text-stone-400" />
            <span>Contact Sheet</span>
          </button>
          <button
            onClick={() => setShowSunny16Modal(true)}
            className="hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Sunny 16</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-stone-400" />
            <span>Export Log</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action / Device Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Segmented Device Mode Selector */}
          <div className="flex items-center p-1 bg-[#26221d] rounded-xl border border-stone-800">
            <button
              onClick={() => setDeviceMode('ios')}
              title="iOS iPhone Frame"
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                deviceMode === 'ios'
                  ? 'bg-amber-900 text-amber-50 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              iOS
            </button>
            <button
              onClick={() => setDeviceMode('android')}
              title="Android Pixel Frame"
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                deviceMode === 'android'
                  ? 'bg-amber-900 text-amber-50 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setDeviceMode('field-journal')}
              title="Expanded Field Journal"
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 hidden sm:block ${
                deviceMode === 'field-journal'
                  ? 'bg-amber-900 text-amber-50 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Desk View
            </button>
          </div>

          <button
            onClick={handleAddNewExposure}
            className="px-3 py-1.5 text-xs font-medium text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 border border-stone-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Exposure</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        <DeviceFrame
          deviceMode={deviceMode}
          onToggleMode={setDeviceMode}
        >
          <NotebookPage
            roll={activeRoll}
            entry={currentEntry}
            totalFrames={activeRoll.totalFrames}
            onUpdateEntry={handleUpdateEntry}
            onPrevFrame={handlePrevFrame}
            onNextFrame={handleNextFrame}
            onJumpToFrame={num => {
              const clamped = Math.max(1, Math.min(num, activeRoll.totalFrames));
              setActiveFrameNumber(clamped);
            }}
            onOpenHandwriting={() => setShowHandwritingModal(true)}
            onOpenSpeech={() => setShowSpeechModal(true)}
            onOpenSunny16={() => setShowSunny16Modal(true)}
            onOpenContactSheet={() => setShowContactSheetModal(true)}
          />
        </DeviceFrame>
      </main>

      {/* Modals */}
      {showHandwritingModal && (
        <HandwritingPad
          currentEntry={currentEntry}
          onApplyTranscription={handleApplyHandwriting}
          onClose={() => setShowHandwritingModal(false)}
        />
      )}

      {showSpeechModal && (
        <SpeechInputModal
          currentEntry={currentEntry}
          defaultFilmSpeed={activeRoll.filmStock + ' (' + activeRoll.iso + ')'}
          onApplyTranscription={handleApplySpeech}
          onClose={() => setShowSpeechModal(false)}
        />
      )}

      {showSunny16Modal && (
        <Sunny16Calculator
          currentFilmIso={activeRoll.iso}
          onApplyExposure={(fStop, shutterSpeed, note) => {
            handleUpdateEntry({
              fStop,
              shutterSpeed,
              personalNote: currentEntry.personalNote
                ? `${currentEntry.personalNote} (${note})`
                : note,
            });
          }}
          onClose={() => setShowSunny16Modal(false)}
        />
      )}

      {showRollManagerModal && (
        <RollManagerModal
          rolls={rolls}
          activeRollId={activeRoll.id}
          onSelectRoll={id => {
            setActiveRollId(id);
            setActiveFrameNumber(1);
            setShowRollManagerModal(false);
          }}
          onCreateRoll={handleCreateRoll}
          onClose={() => setShowRollManagerModal(false)}
        />
      )}

      {showContactSheetModal && (
        <ContactSheetView
          roll={activeRoll}
          entries={entries.filter(e => e.rollId === activeRoll.id)}
          currentFrame={activeFrameNumber}
          onSelectFrame={num => setActiveFrameNumber(num)}
          onClose={() => setShowContactSheetModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          roll={activeRoll}
          entries={entries.filter(e => e.rollId === activeRoll.id)}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
