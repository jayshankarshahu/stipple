/**
 * Represents a single entry in the date-noteId index.
 */
export interface NoteIndexEntry {
    date: string;   // "yyyy-mm-dd"
    noteId: string; // UUID
}

/**
 * The stored note object, keyed by noteId in chrome.storage.local.
 */
export interface NoteObject {
    date: string;       // "yyyy-mm-dd"
    noteData: string;   // Markdown text
    tags: string[];     // User-assigned tags
    lastEdited: number; // Unix timestamp (ms)
}

/**
 * The full index stored under "date-noteId-index" key.
 */
export type NoteIndex = NoteIndexEntry[];
