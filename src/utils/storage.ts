import { FilmRoll, PhotographyLogEntry } from '../types/notebook';

const STORAGE_KEYS = {
  ROLLS: 'analog_notebook_rolls_v1',
  ENTRIES: 'analog_notebook_entries_v1',
  ACTIVE_ROLL_ID: 'analog_notebook_active_roll_v1',
  ACTIVE_FRAME: 'analog_notebook_active_frame_v1',
  DEVICE_MODE: 'analog_notebook_device_mode_v1',
  INK_STYLE: 'analog_notebook_ink_style_v1',
};

export const INITIAL_ROLLS: FilmRoll[] = [
  {
    id: 'roll-01',
    name: 'Roll #01 · New York Autumn Walk',
    camera: 'Leica M6 · 35mm f/2 Summicron',
    filmStock: 'Kodak Portra 400',
    iso: 'ISO 400',
    totalFrames: 36,
    startDate: '2026-10-25',
    isArchived: false,
  },
  {
    id: 'roll-02',
    name: 'Roll #02 · Darkroom Monochrome Study',
    camera: 'Hasselblad 500C/M · Planar 80mm f/2.8',
    filmStock: 'Ilford HP5 Plus 400',
    iso: 'ISO 400',
    totalFrames: 12,
    startDate: '2026-10-27',
    isArchived: false,
  },
];

export const INITIAL_ENTRIES: PhotographyLogEntry[] = [
  {
    id: 'entry-01-01',
    rollId: 'roll-01',
    frameNumber: 1,
    camera: 'Leica M6',
    lens: '35mm f/2 Summicron',
    date: 'Oct 26, 2026',
    location: 'Washington Square Park Arch, NYC',
    timeOfDay: 'Golden Hour (5:45 PM)',
    fStop: 'f/2.8',
    shutterSpeed: '1/500s',
    filmSpeed: 'ISO 400 · Kodak Portra 400',
    personalNote: 'Low raking sunlight hitting the street pianist, slight amber flare on 35mm lens. Metered for mid-shadows on coat.',
    inputMethod: 'manual',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-01-02',
    rollId: 'roll-01',
    frameNumber: 2,
    camera: 'Leica M6',
    lens: '50mm f/1.4',
    date: 'Oct 26, 2026',
    location: 'DUMBO, Washington & Water St',
    timeOfDay: 'Blue Hour (6:35 PM)',
    fStop: 'f/1.4',
    shutterSpeed: '1/60s',
    filmSpeed: 'ISO 400 · Kodak Portra 400',
    personalNote: 'Handheld braced against cast iron lamp post. Manhattan Bridge leg framed between historic red brick warehouses.',
    inputMethod: 'speech',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-01-03',
    rollId: 'roll-01',
    frameNumber: 3,
    camera: 'Leica M6',
    lens: '28mm f/2.8',
    date: 'Oct 27, 2026',
    location: 'High Line elevated walkway, Chelsea',
    timeOfDay: 'Mid-Morning (10:15 AM)',
    fStop: 'f/8',
    shutterSpeed: '1/250s',
    filmSpeed: 'ISO 400 · Kodak Portra 400',
    personalNote: 'Geometric steel beam shadow grid falling across timber benches. Sharp contrast, no filter.',
    inputMethod: 'handwriting',
    updatedAt: new Date().toISOString(),
  },
];

export function getStoredRolls(): FilmRoll[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROLLS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading rolls from storage:', e);
  }
  saveStoredRolls(INITIAL_ROLLS);
  return INITIAL_ROLLS;
}

export function saveStoredRolls(rolls: FilmRoll[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ROLLS, JSON.stringify(rolls));
  } catch (e) {
    console.error('Error saving rolls to storage:', e);
  }
}

export function getStoredEntries(): PhotographyLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading entries from storage:', e);
  }
  saveStoredEntries(INITIAL_ENTRIES);
  return INITIAL_ENTRIES;
}

export function saveStoredEntries(entries: PhotographyLogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving entries to storage:', e);
  }
}

export function getActiveRollId(): string {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLL_ID) || 'roll-01';
}

export function saveActiveRollId(id: string) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLL_ID, id);
}

export function getActiveFrameNumber(): number {
  const val = localStorage.getItem(STORAGE_KEYS.ACTIVE_FRAME);
  return val ? parseInt(val, 10) : 1;
}

export function saveActiveFrameNumber(frame: number) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_FRAME, frame.toString());
}
