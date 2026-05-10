# Stipple Chrome Extension - Agent Documentation

This file provides context and architectural overview for AI agents working on the "Stipple" project.

## Project Overview
**Stipple** is a Notion-inspired dark-mode note-taking Chrome extension. It operates mainly within the Chrome Side Panel API, offering daily markdown notes, tag management, and a timeline view. It has an integrated Next.js backend for handling external functionalities such as image uploads.

## Technology Stack

### Frontend (Chrome Extension)
- **Framework**: React 18, Vite
- **Language**: TypeScript
- **Editor**: Milkdown (ProseMirror-based headless markdown editor)
- **Styling**: Vanilla CSS (`.css` files per component, dark-mode focused)
- **APIs Used**: Chrome Side Panel API, Chrome Storage Local API.

### Backend (API Service)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Storage**: Cloudflare R2 (via general upload handlers for images)
- **Environment**: Node.js

## Project Structure

The project is split into two main domains: the browser extension (`src/`) and the standalone API (`backend/`).

### Extension (`/src`)
- `components/`: UI components (e.g., `Editor.tsx`, `TagsModal.tsx`, `TopBar.tsx`).
- `hooks/`: Custom React hooks (e.g., `useNotes.ts` for managing editor state).
- `services/`: Business logic decoupled from UI.
  - `StorageService.ts`: Thin wrapper around `chrome.storage.local` with a fallback to browser `localStorage` for dev mode.
  - `NoteService.ts`: CRUD operations and daily-note management.
  - `DateService.ts`: Date formatting utilities.
- `slash/`: Implementation of Notion-style `/` slash commands using `@milkdown/plugin-slash`. Contains a registry of commands (Heading, Bullet List, Code Block, etc.).
- `timeline/`: The timeline view UI, rendered via a separate entry point (`timeline.html`).
- `types/`: Shared TypeScript interfaces.

### Backend (`/backend`)
A headless Next.js app serving as the API backend for the extension.
- `src/app/api/upload/image/route.ts`: API endpoint for handling `multipart/form-data` image uploads, including validation for size (5MB max) and MIME types.

## Architecture & Data Flow

1. **State Management**:
   The primary state involves navigating "Daily Notes". The `StorageService` maintains an index (`date-noteId-index`) that maps dates to unique `noteId`s.
   Notes are stored as flat objects: `{ date, noteData (markdown), tags, lastEdited }`.

2. **Editor**:
   The editor uses **Milkdown** and **ProseMirror**.
   - Raw Markdown is the source of truth (`onContentChange` captures markdown).
   - Pasting text intercepts raw markdown to force a re-parse, allowing rich-text pasting.
   - Slash commands are decoupled. Typing `/` opens a contextual menu rendered in React (`SlashMenu.tsx`).

3. **Background & Build**:
   - `vite.config.ts` has multiple inputs: `popup` (index.html), `timeline` (timeline.html), and `service-worker` (src/service-worker.ts).
   - A Next.js API server runs independently to support heavy operations (like image processing/hosting) that shouldn't live in the extension bundle.

## Recent Context & Milestones
- **Side Panel Migration**: The extension migrated from a basic popup to utilizing the `chrome.sidePanel` API for a persistent sidebar experience.
- **Slash Commands**: Replaced basic typing with a modular command registry for `/` shortcuts.
- **Image Uploads**: Added functionality to intercept `stipple:image-upload` events in the editor, POSTing them to the Next.js backend, and receiving a public URL (Cloudflare R2).

## AI Agent Guidelines
- **CSS**: The project uses component-scoped plain CSS (e.g. `Editor.css`, `SlashMenu.css`). Do NOT introduce Tailwind or other CSS frameworks unless requested.
- **Chrome APIs**: Be aware that the extension uses `chrome.storage.local`. For local web development (outside the extension environment), it smoothly degrades to `localStorage`.
- **Milkdown**: When modifying editor behavior, rely on Milkdown headless plugins and ProseMirror APIs (e.g., transactions, node resolutions) rather than direct DOM manipulation.
- **File Modifying**: Always check `package.json` or `manifest.json` versions before proposing new dependencies.
