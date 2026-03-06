import type { NoteIndex, NoteObject } from '../types';

const INDEX_KEY = 'date-noteId-index';

/**
 * StorageService — thin wrapper around chrome.storage.local.
 * Keeps an in-memory cache of the note index for fast lookups.
 * This entire module can be swapped for any other storage backend.
 */

let cachedIndex: NoteIndex | null = null;

function getStorage(): typeof chrome.storage.local | null {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return chrome.storage.local;
    }
    return null;
}

// ─── Fallback: localStorage shim for dev mode ───

function localGet(key: string): Promise<Record<string, unknown>> {
    const raw = localStorage.getItem(key);
    return Promise.resolve({ [key]: raw ? JSON.parse(raw) : undefined });
}

function localSet(items: Record<string, unknown>): Promise<void> {
    for (const [k, v] of Object.entries(items)) {
        localStorage.setItem(k, JSON.stringify(v));
    }
    return Promise.resolve();
}

async function storageGet(key: string): Promise<Record<string, unknown>> {
    const storage = getStorage();
    if (storage) {
        return new Promise((resolve) => storage.get([key], (result) => resolve(result as Record<string, unknown>)));
    }
    return localGet(key);
}

async function storageSet(items: Record<string, unknown>): Promise<void> {
    const storage = getStorage();
    if (storage) {
        return new Promise((resolve) => storage.set(items, resolve));
    }
    return localSet(items);
}

// ─── Index operations ───

export async function getIndex(): Promise<NoteIndex> {
    if (cachedIndex) return cachedIndex;

    const result = await storageGet(INDEX_KEY);
    const index = (result[INDEX_KEY] as NoteIndex) || [];
    cachedIndex = index;
    return index;
}

export async function setIndex(index: NoteIndex): Promise<void> {
    cachedIndex = index;
    await storageSet({ [INDEX_KEY]: index });
}

// ─── Note operations ───

export async function getNote(noteId: string): Promise<NoteObject | null> {
    const result = await storageGet(noteId);
    return (result[noteId] as NoteObject) || null;
}

export async function setNote(noteId: string, note: NoteObject): Promise<void> {
    await storageSet({ [noteId]: note });
}

// ─── Cache management ───

export function invalidateCache(): void {
    cachedIndex = null;
}
