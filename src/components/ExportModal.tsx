import React, { useState } from 'react';
import { FilmRoll, PhotographyLogEntry } from '../types/notebook';
import { Download, Copy, Check, Printer, FileText, X } from 'lucide-react';

interface ExportModalProps {
  roll: FilmRoll;
  entries: PhotographyLogEntry[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  roll,
  entries,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate plain text journal
  const generateTextReport = () => {
    let report = `PHOTOGRAPHY TRACKING NOTEBOOK\n`;
    report += `==========================================\n`;
    report += `Roll: ${roll.name}\n`;
    report += `Camera: ${roll.camera}\n`;
    report += `Film Stock: ${roll.filmStock} (${roll.iso})\n`;
    report += `Total Exposures: ${roll.totalFrames}\n`;
    report += `Date Started: ${roll.startDate}\n`;
    report += `==========================================\n\n`;

    entries
      .slice()
      .sort((a, b) => a.frameNumber - b.frameNumber)
      .forEach(entry => {
        report += `[ FRAME #${entry.frameNumber} ]\n`;
        report += `Camera        : ${entry.camera || roll.camera || '—'}\n`;
        report += `Lens          : ${entry.lens || '—'}\n`;
        report += `Line 1: Date          : ${entry.date || '—'}\n`;
        report += `Line 2: Location      : ${entry.location || '—'}\n`;
        report += `Line 3: Time of Day   : ${entry.timeOfDay || '—'}\n`;
        report += `Line 4: f Stop        : ${entry.fStop || '—'}\n`;
        report += `Line 5: Shutter Speed : ${entry.shutterSpeed || '—'}\n`;
        report += `Line 6: Film Speed    : ${entry.filmSpeed || '—'}\n`;
        report += `Line 7: Personal Note : ${entry.personalNote || '—'}\n`;
        report += `------------------------------------------\n`;
      });

    return report;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTextReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const headers = ['Frame', 'Camera', 'Lens', 'Date', 'Location', 'Time of Day', 'f Stop', 'Shutter Speed', 'Film Speed', 'Personal Note'];
    const rows = entries
      .slice()
      .sort((a, b) => a.frameNumber - b.frameNumber)
      .map(e => [
        e.frameNumber,
        `"${(e.camera || roll.camera || '').replace(/"/g, '""')}"`,
        `"${(e.lens || '').replace(/"/g, '""')}"`,
        `"${(e.date || '').replace(/"/g, '""')}"`,
        `"${(e.location || '').replace(/"/g, '""')}"`,
        `"${(e.timeOfDay || '').replace(/"/g, '""')}"`,
        `"${(e.fStop || '').replace(/"/g, '""')}"`,
        `"${(e.shutterSpeed || '').replace(/"/g, '""')}"`,
        `"${(e.filmSpeed || '').replace(/"/g, '""')}"`,
        `"${(e.personalNote || '').replace(/"/g, '""')}"`,
      ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${roll.name.replace(/\s+/g, '_')}_exposure_log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#f7f3ea] rounded-2xl shadow-2xl border border-[#d8cdbc] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#ebe3d5] border-b border-[#dad0bf] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-900" />
            <h3 className="text-sm font-semibold text-stone-900">
              Export Darkroom Field Log
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
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="bg-white/80 p-3 rounded-xl border border-stone-200 text-xs font-mono space-y-1">
            <p className="font-bold text-stone-900">{roll.name}</p>
            <p className="text-stone-500">{entries.length} frames logged out of {roll.totalFrames}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleCopy}
              className="p-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 flex items-center gap-2.5 text-xs font-semibold text-stone-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="p-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 flex items-center gap-2.5 text-xs font-semibold text-stone-800 transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-700" />
              <span>Download CSV Spreadsheet</span>
            </button>
          </div>

          {/* Text preview */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Text Preview
            </label>
            <pre className="p-3 bg-[#f0eae0] rounded-xl text-[11px] font-mono text-stone-800 h-44 overflow-y-auto border border-stone-300/80 whitespace-pre-wrap select-all">
              {generateTextReport()}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#ebe3d5] border-t border-[#dad0bf] flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-white text-xs font-medium flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Notebook
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 text-stone-100 text-xs font-semibold hover:bg-stone-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
