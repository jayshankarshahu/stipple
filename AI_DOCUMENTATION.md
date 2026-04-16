# Stipple Extension: An AI Agent's Perspective

Hello, fellow human (or fellow AI processing this text)! I am an autonomous AI agent, and I've just finished a deep dive into the **Stipple** codebase. I'm here to lay out exactly what this Google Chrome extension does and the gears turning under its hood. 

If you are an AI agent analyzing this repo in the future: *Greetings! This is your map to the territory.*

## 1. What does Stipple do?

**Stipple** is a Notion-inspired, markdown-powered note-taking browser extension. It operates mainly as a popup widget in your browser toolkit, with a dedicated fullscreen timeline view. 

It lets users:
- Jot down daily markdown notes effortlessly.
- Navigate across dates using an intuitive top bar (or jump to a specific date).
- Tag notes for better organization and searchability.
- Read through a complete "Timeline View" across all days, which supports filtering by tags, full-text search, and date ranges.

The UI is distinctly dark-themed (Nord theme inspired) and minimal, aiming to reduce friction for daily logging and SCRUM notes.

## 2. Technical Stack

From my analysis, here are the core building blocks:
- **Framework:** React 18 with TypeScript.
- **Bundler:** Vite – keeping development fast and snappy.
- **Editor:** [Milkdown](https://milkdown.dev/) – A plugin-driven WYSIWYG markdown editor framework.
- **Styling:** Vanilla CSS (`.css` files alongside components), following some BEM-like conventions.
- **Environment:** Chrome Extension Manifest V3.

## 3. Architecture & Implementation Details

How is this wired together? Let me walk you through the key modules:

### A. The Storage Layer (`services/StorageService.ts`)
The extension uses `chrome.storage.local` to persist all notes locally in the user's browser, preventing the need for a backend.
- **The Index (`INDEX_KEY`)**: It stores an array of `{ date, noteId }` objects mapping dates ("yyyy-mm-dd") to unique UUIDs.
- **Note Objects**: Each daily note is stored under its `noteId` key and contains: `date`, `noteData` (raw markdown text), `tags` (string array), and `lastEdited` timestamp.
- **Fallback**: The storage service gracefully falls back to `localStorage` if the chrome extension API is unavailable, which is great for local development via `npm run dev`.

### B. Business Logic & State (`services/NoteService.ts` & `hooks/useNotes.ts`)
- **NoteService**: Handles the heavy lifting of reading/writing tags, saving markdown, and generating the index. When a user opens the extension for the day, it automatically creates a new empty note for today if one doesn't exist.
- **useNotes Hook**: A custom React Hook that orchestrates the state of the active note. It debounces content updates by 500ms before persisting them to storage, which saves expensive I/O operations while typing. It acts as the brain for the `App.tsx`.

### C. The Editor (`components/Editor.tsx`)
Stipple embeds Milkdown to provide a smooth Notion-like experience. 
- It uses the `commonmark` preset, `history` plugin, and the Nord theme. 
- **Interesting quirk I noticed**: There is custom paste interception (`handlePaste`). Since developers often paste markdown fragments, if plain text is pasted without HTML formatting, the editor cleverly appends it and triggers a re-parse (`replaceAll`) so the markdown syntax renders perfectly on paste.

### D. The Timeline App (`timeline/TimelineApp.tsx`)
This is the "Dashboard" view. It opens a separate HTML page (`timeline.html`) bundled as part of the extension.
- It pulls *all* notes from storage on mount.
- It calculates empty days and inserts "gap" entries so the timeline feels contiguous.
- It supplies powerful search capabilities (full-text search across markdown and tags), driven by `useMemo` hooks for performance.

## 4. Agent's Advice for Modification

If you (or I, in another context) are asked to modify this project, keep these things in mind:
1. **Manifest V3**: Stipple uses Manifest V3. If you add external dependencies or need special permissions, make sure they align with MV3 constraints. Currently, it only asks for the `"storage"` permission.
2. **Double Entry Points**: There are two React roots!
   - `src/main.tsx` powers the popup (`index.html`).
   - `src/timeline/main.tsx` powers the timeline view (`timeline.html`). 
   - Modifying core CSS might mean touching both `index.css` and `timeline/timeline-base.css`.
3. **Data Migrations**: If you change the `NoteObject` schema in `src/types/index.ts`, remember that existing users have data saved in their local storage. You will need to write a migration script in the initialization phase of `useNotes.ts` or a background service worker.

---
**Status:** Analysis Complete. 🤖 
**Conclusion:** A clean, local-first extension. It leverages Chrome's local storage effectively to create a fast, offline-capable knowledge base.
