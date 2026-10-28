import React from 'react';
import { DeviceMode } from '../types/notebook';
import { Wifi, Battery, Signal, Sparkles, Smartphone } from 'lucide-react';

interface DeviceFrameProps {
  deviceMode: DeviceMode;
  children: React.ReactNode;
  onToggleMode: (mode: DeviceMode) => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceMode,
  children,
  onToggleMode,
}) => {
  // Current time for phone status bar
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (deviceMode === 'field-journal') {
    return (
      <div className="w-full min-h-screen py-4 sm:py-8 px-2 sm:px-6 flex flex-col items-center justify-start">
        <div className="w-full max-w-4xl">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-3 sm:py-6 px-2 flex flex-col items-center justify-center">
      {/* Device Body Container */}
      <div
        className={`relative w-full max-w-[420px] h-[870px] max-h-[96vh] rounded-[48px] p-3 shadow-2xl transition-all duration-300 flex flex-col ${
          deviceMode === 'ios'
            ? 'bg-[#1e1c1a] ring-4 ring-stone-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]'
            : 'bg-[#151412] ring-3 ring-stone-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]'
        }`}
      >
        {/* Physical outer button accents */}
        <div className="absolute -left-[5px] top-28 w-[3px] h-9 bg-stone-700 rounded-l-xs" />
        <div className="absolute -left-[5px] top-40 w-[3px] h-12 bg-stone-700 rounded-l-xs" />
        <div className="absolute -left-[5px] top-56 w-[3px] h-12 bg-stone-700 rounded-l-xs" />
        <div className="absolute -right-[5px] top-36 w-[3px] h-16 bg-stone-700 rounded-r-xs" />

        {/* Screen Bezel */}
        <div className="relative w-full h-full bg-[#121110] rounded-[38px] overflow-hidden flex flex-col border border-stone-800">
          {/* iOS Dynamic Island & Status Bar */}
          {deviceMode === 'ios' && (
            <div className="h-11 px-7 pt-2 flex items-center justify-between text-stone-200 select-none shrink-0 z-30">
              <span className="text-[13px] font-semibold tracking-tight">{currentTime}</span>

              {/* Dynamic Island */}
              <div className="w-24 h-6 bg-black rounded-full flex items-center justify-between px-2.5 mx-auto -mt-1 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-900 ring-1 ring-stone-800" />
                <div className="w-2 h-2 rounded-full bg-stone-900" />
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 text-stone-300">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Android Punch Hole & Status Bar */}
          {deviceMode === 'android' && (
            <div className="h-10 px-6 pt-1.5 flex items-center justify-between text-stone-200 select-none shrink-0 z-30">
              <span className="text-[12px] font-medium font-mono">{currentTime}</span>

              {/* Android Center Camera Hole */}
              <div className="w-3.5 h-3.5 bg-black rounded-full ring-1 ring-stone-900 mx-auto" />

              <div className="flex items-center gap-1.5 text-stone-300">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* App Screen Content */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {children}
          </div>

          {/* iOS / Android Bottom Home Bar */}
          <div className="h-5 shrink-0 flex items-center justify-center bg-[#1c1916] pb-1 z-30">
            {deviceMode === 'ios' ? (
              <div className="w-32 h-1 bg-stone-400 rounded-full" />
            ) : (
              <div className="w-20 h-1 bg-stone-500 rounded-full" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
