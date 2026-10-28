export interface PhotographyLogEntry {
  id: string;
  rollId: string;
  frameNumber: number; // 1 to 36 (editable)
  camera?: string;     // Camera input (e.g. Leica M6)
  lens?: string;       // Lens input (e.g. 35mm f/2 Summicron)
  date: string;        // Line 1: Date
  location: string;    // Line 2: Location
  timeOfDay: string;   // Line 3: Time of day
  fStop: string;       // Line 4: f stop
  shutterSpeed: string;// Line 5: Shutter speed
  filmSpeed: string;   // Line 6: Film speed
  personalNote: string;// Line 7: Personal note
  handwritingImageData?: string; // Stored canvas ink drawing data URL
  inputMethod?: 'manual' | 'speech' | 'handwriting';
  updatedAt: string;
}

export interface FilmRoll {
  id: string;
  name: string;
  camera: string;
  filmStock: string;
  iso: string;
  totalFrames: number;
  startDate: string;
  completedDate?: string;
  isArchived?: boolean;
}

export type DeviceMode = 'ios' | 'android' | 'field-journal';
export type InkStyle = 'blue-ink' | 'black-ink' | 'pencil' | 'typewriter';

export const COMMON_APERTURES = [
  'f/1.2', 'f/1.4', 'f/1.8', 'f/2', 'f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16', 'f/22'
];

export const COMMON_SHUTTERS = [
  '1/4000s', '1/2000s', '1/1000s', '1/500s', '1/250s', '1/125s', '1/60s', '1/30s', '1/15s', '1/8s', '1/4s', '1/2s', '1s', '2s', 'Bulb'
];

export const COMMON_FILM_STOCKS = [
  { name: 'Kodak Portra 400', iso: 'ISO 400', type: 'Color Negative' },
  { name: 'Kodak Portra 160', iso: 'ISO 160', type: 'Color Negative' },
  { name: 'Kodak Portra 800', iso: 'ISO 800', type: 'Color Negative' },
  { name: 'Kodak Tri-X 400', iso: 'ISO 400', type: 'Black & White' },
  { name: 'Kodak Gold 200', iso: 'ISO 200', type: 'Color Negative' },
  { name: 'Ilford HP5 Plus 400', iso: 'ISO 400', type: 'Black & White' },
  { name: 'Ilford Delta 3200', iso: 'ISO 3200', type: 'Black & White' },
  { name: 'CineStill 800T', iso: 'ISO 800', type: 'Tungsten Color' },
  { name: 'Fujifilm 400', iso: 'ISO 400', type: 'Color Negative' },
];

export const COMMON_CAMERAS = [
  'Leica M6',
  'Leica M3',
  'Nikon FM2',
  'Canon AE-1',
  'Olympus OM-1',
  'Pentax K1000',
  'Hasselblad 500C/M',
  'Mamiya 7 II',
  'Contax G2',
  'Rollei 35S',
];

export const COMMON_LENSES = [
  '28mm f/2.8',
  '35mm f/1.4',
  '35mm f/2 Summicron',
  '40mm f/2',
  '50mm f/1.4',
  '50mm f/1.8',
  '80mm f/2.8 Planar',
  '85mm f/1.4',
  '90mm f/2.8',
  '105mm f/2.5',
];

export const COMMON_TIMES = [
  'Sunrise', 'Golden Hour (AM)', 'Mid-Morning', 'High Noon', 'Afternoon Sun', 'Golden Hour (PM)', 'Blue Hour', 'Twilight / Dusk', 'Night'
];
