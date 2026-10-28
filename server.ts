import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// Shared Gemini Client with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * 1. Parse natural speech/text dictation into structured 7-line photography log
 */
app.post('/api/gemini/parse-voice-text', async (req: Request, res: Response) => {
  try {
    const { text, defaultDate, defaultFilmSpeed } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Missing text to parse' });
      return;
    }

    const prompt = `You are an expert analog photography darkroom and field notebook assistant.
A photographer spoke or typed a natural log of an exposure frame.
Extract and normalize the details into the photography tracking notebook fields:
- Frame: (Number or label e.g. 14 or "14", if mentioned)
- Camera: (Camera body e.g. "Leica M6", "Nikon FM2", "Canon AE-1", or as mentioned)
- Lens: (Lens used e.g. "35mm f/2 Summicron", "50mm f/1.4", "28mm f/2.8")
- Line 1: Date (e.g. "Oct 27, 2026" or format like "2026-10-27" or as mentioned; fallback to "${defaultDate || 'Today'}")
- Line 2: Location (e.g. "Brooklyn Bridge, NY", "SoHo streets", "In studio", "Central Park")
- Line 3: Time of day (e.g. "Golden Hour 6:15 PM", "High Noon", "Blue Hour", "Late Afternoon", "11:30 AM")
- Line 4: f stop (Aperture format: e.g. "f/2.8", "f/1.4", "f/8", "f/5.6", "f/16", "f/2")
- Line 5: Shutter speed (e.g. "1/500s", "1/250s", "1/1000s", "1/60s", "1/125s", "1s", "Bulb")
- Line 6: Film speed (ISO & film stock: e.g. "ISO 400 - Kodak Portra 400", "ISO 100", "Ilford HP5+ 400", fallback to "${defaultFilmSpeed || 'ISO 400'}")
- Line 7: Personal note (Subject, lighting notes, filters, push/pull dev thoughts, or mood)

Photographer's input: "${text}"

Be realistic and helpful. If a value isn't explicitly spoken, make a plausible estimate based on the scene context.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            frameNumber: { type: Type.INTEGER, description: 'Frame number if mentioned' },
            camera: { type: Type.STRING, description: 'Camera body name' },
            lens: { type: Type.STRING, description: 'Lens name and focal length' },
            date: { type: Type.STRING, description: 'Line 1: Date' },
            location: { type: Type.STRING, description: 'Line 2: Location' },
            timeOfDay: { type: Type.STRING, description: 'Line 3: Time of day' },
            fStop: { type: Type.STRING, description: 'Line 4: f-stop aperture' },
            shutterSpeed: { type: Type.STRING, description: 'Line 5: Shutter speed' },
            filmSpeed: { type: Type.STRING, description: 'Line 6: Film speed / ISO stock' },
            personalNote: { type: Type.STRING, description: 'Line 7: Personal note' },
            confidenceSummary: { type: Type.STRING, description: 'Short 1-sentence note of what was inferred' },
          },
          required: ['date', 'location', 'timeOfDay', 'fStop', 'shutterSpeed', 'filmSpeed', 'personalNote'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error parsing voice text:', error);
    res.status(500).json({ error: error?.message || 'Failed to parse text' });
  }
});

/**
 * 2. OCR Handwriting Recognition from Canvas
 */
app.post('/api/gemini/recognize-handwriting', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 data' });
      return;
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are a high-accuracy handwriting OCR engine specializing in photographers' handwritten field notebooks and darkroom logs.
Analyze this handwritten canvas drawing. The photographer may have written down frame, camera, lens, or exposure notes.

Transcribe the handwritten text exactly, and map whatever you decipher into the fields:
Frame: (Number or label e.g. 1, 2, 14, etc., if written)
Camera: (Camera body if written)
Lens: (Lens focal length / aperture if written)
Line 1: Date
Line 2: Location
Line 3: Time of day
Line 4: f stop (Aperture, e.g. f/2.8, f/4, f/1.4, f/8, f/11)
Line 5: Shutter speed (e.g. 1/500, 1/250, 1/125, 1/60)
Line 6: Film speed (ISO, e.g. ISO 400, Portra 400, HP5 400)
Line 7: Personal note (all other observations, lens notes, framing, remarks)

Also return rawTranscribedText containing everything you read. If any line wasn't written, provide an empty string or reasonable placeholder.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rawTranscribedText: { type: Type.STRING, description: 'Raw handwritten text transcribed directly' },
            frameNumber: { type: Type.INTEGER, description: 'Frame number if written' },
            camera: { type: Type.STRING, description: 'Camera body' },
            lens: { type: Type.STRING, description: 'Lens' },
            date: { type: Type.STRING, description: 'Line 1: Date' },
            location: { type: Type.STRING, description: 'Line 2: Location' },
            timeOfDay: { type: Type.STRING, description: 'Line 3: Time of day' },
            fStop: { type: Type.STRING, description: 'Line 4: f-stop' },
            shutterSpeed: { type: Type.STRING, description: 'Line 5: Shutter speed' },
            filmSpeed: { type: Type.STRING, description: 'Line 6: Film speed' },
            personalNote: { type: Type.STRING, description: 'Line 7: Personal note' },
          },
          required: ['rawTranscribedText', 'date', 'location', 'timeOfDay', 'fStop', 'shutterSpeed', 'filmSpeed', 'personalNote'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in handwriting recognition:', error);
    res.status(500).json({ error: error?.message || 'Handwriting recognition failed' });
  }
});

/**
 * 3. Transcribe and parse audio recording directly
 */
app.post('/api/gemini/transcribe-audio', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      res.status(400).json({ error: 'Missing audioBase64 data' });
      return;
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');

    const prompt = `Transcribe this audio recording of a photographer taking field exposure notes.
Map the spoken details into the 7 lines of a photography tracking notebook:
Line 1: Date
Line 2: Location
Line 3: Time of day
Line 4: f stop
Line 5: Shutter speed
Line 6: Film speed
Line 7: Personal note

Also provide the raw transcript.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rawTranscript: { type: Type.STRING, description: 'Raw transcription of audio' },
            date: { type: Type.STRING, description: 'Line 1: Date' },
            location: { type: Type.STRING, description: 'Line 2: Location' },
            timeOfDay: { type: Type.STRING, description: 'Line 3: Time of day' },
            fStop: { type: Type.STRING, description: 'Line 4: f-stop' },
            shutterSpeed: { type: Type.STRING, description: 'Line 5: Shutter speed' },
            filmSpeed: { type: Type.STRING, description: 'Line 6: Film speed' },
            personalNote: { type: Type.STRING, description: 'Line 7: Personal note' },
          },
          required: ['rawTranscript', 'date', 'location', 'timeOfDay', 'fStop', 'shutterSpeed', 'filmSpeed', 'personalNote'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: error?.message || 'Audio transcription failed' });
  }
});

/**
 * 4. Sunny 16 & Exposure Metering Advice
 */
app.post('/api/gemini/suggest-exposure', async (req: Request, res: Response) => {
  try {
    const { lightingCondition, filmIso, sceneDetails } = req.body;
    const prompt = `You are a manual analog photography light meter and Sunny 16 rule calculator.
Scene lighting: "${lightingCondition || 'Sunny daylight'}"
Film ISO: "${filmIso || 'ISO 400'}"
Scene details / intent: "${sceneDetails || 'General street snapshot'}"

Recommend the ideal exposure settings:
- fStop (e.g. f/16, f/11, f/8, f/5.6, f/4, f/2.8, f/2, f/1.4)
- shutterSpeed (e.g. 1/500s, 1/250s, 1/125s, 1/60s, 1/30s)
- explanation: brief 1-2 sentence rationale based on light intensity and depth of field or motion freeze.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fStop: { type: Type.STRING },
            shutterSpeed: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ['fStop', 'shutterSpeed', 'explanation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error suggesting exposure:', error);
    res.status(500).json({ error: error?.message || 'Failed to suggest exposure' });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Photography Tracking Notebook server listening on port ${PORT}`);
  });
}

startServer();
