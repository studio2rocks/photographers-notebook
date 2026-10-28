# Analog Field Notes — Photography Tracking Notebook

A tactile, mobile-first photography tracking notebook designed for manual analog and film photographers. Log and archive exposure metadata frame-by-frame with a physical Moleskine / Midori field notebook aesthetic.

---

## Key Features

### 1. Dedicated Gear & Exposure Header
- **Frame Input**: Interactive numeric input supporting **unlimited exposures** (1, 2, 3... 100+). Jump directly to any frame number.
- **Camera Input**: Direct text input with quick presets (*Leica M6, Nikon FM2, Canon AE-1, Olympus OM-1, Hasselblad 500C/M, etc.*) and microphone voice dictation.
- **Lens Input**: Direct text input with quick focal length presets (*28mm, 35mm, 50mm, 85mm, 105mm*) and microphone voice dictation.

### 2. Exact 7-Line Notebook Log
Every frame is recorded on realistic ruled ivory paper with:
- **Line 1: Date** — Direct typing, quick "Today" shortcut, or speech dictation.
- **Line 2: Location** — Direct typing, GPS button (fetches current location & city), or speech dictation.
- **Line 3: Time of Day** — Direct typing, "Now" shortcut, time tags (*Golden Hour, Blue Hour, High Noon*), or speech dictation.
- **Line 4: f Stop** — Aperture selector dial (*f/1.2* through *f/22*) or manual input.
- **Line 5: Shutter Speed** — Shutter presets (*1/4000s* down to *Bulb*) or manual input.
- **Line 6: Film Speed** — Film stock presets (*Kodak Portra 400, Tri-X 400, Ilford HP5+, CineStill 800T, etc.*) or custom ISO.
- **Line 7: Personal Note** — Multiline cursive handwritten note for lighting conditions, lens filters, subject details, or darkroom development notes.

### 3. Three Input Modalities
1. **Manual Text**: Tactile typewriter and handwriting typography with instant picker trays.
2. **Speech to Text**:
   - *Line-by-Line Dictation*: Individual microphone button beside every line.
   - *Master Voice Logger*: Speak a natural sentence (e.g., *"Frame 18 on Prince Street with Leica M6 and 35mm lens at golden hour, f/2.8 at 1/500th on Portra 400"*). Gemini AI parses the details and auto-fills all fields.
3. **Handwriting Pad & Gemini Vision OCR**:
   - Interactive drawing canvas with customizable pen nibs (*Fine, Medium, Broad*) and inks (*Parker Quink Blue, Carbon Black, Graphite, Grease Red*).
   - Gemini Vision OCR reads handwritten shorthand or cursive notes and transcribes them onto the notebook lines.
   - Option to preserve and display the original handwritten sketch/drawing right on the notebook page.

### 4. Image Attachment (512×512 px Thumbnail)
- Attach reference photos, test scans, or digital preview snaps to any frame.
- Automatically center-crops and converts uploads to crisp 512px × 512px square thumbnails directly in-browser using HTML5 Canvas.
- Displays as a darkroom test print pinned to the notebook page with full 512px lightbox inspection and contact sheet preview.

### 5. Built-In Photography Darkroom Tools
- **Darkroom Contact Sheet**: Interactive negative film strip grid with sprocket holes and rebate numbers; displays 512px thumbnails and exposure data. Click any frame to inspect or jump.
- **Sunny 16 Exposure Meter**: Quick lighting condition guide (*Bright Sun, Hazy Sun, Overcast, Heavy Overcast, Golden Hour*) that computes and applies recommended aperture and shutter speed pairings.
- **Roll Manager**: Create and organize rolls by camera body, stock, and format.
- **Data Export & Print**: Export formatted field notes to clipboard, download CSV spreadsheets for darkroom records, or print contact sheets.

### 6. Multi-Device Experience
- **iOS Mode**: iPhone chassis with Dynamic Island and native status bar.
- **Android Mode**: Modern Pixel chassis with centered camera punch-hole.
- **Desk View**: Fullscreen open dual-page journal spread.

---

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend & AI**: Node.js, Express, `@google/genai` (Gemini 3.8 Flash for OCR and voice parsing).
- **Tooling**: Vite, tsx.
