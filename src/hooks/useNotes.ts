import { useState, useEffect, useCallback, useRef } from 'react';
import type { NoteObject, NoteIndex } from '../types';
import * as NoteService from '../services/NoteService';
import * as StorageService from '../services/StorageService';
import { saveStateManager } from '../state';

interface UseNotesReturn {
    currentNote: NoteObject | null;
    currentNoteId: string | null;
    currentIndex: number;
    totalNotes: number;
    isLoading: boolean;
    allTags: string[];
    goToPrev: () => void;
    goToNext: () => void;
    goToDate: (date: string) => Promise<void>;
    saveContent: (markdown: string) => void;
    addTag: (tag: string) => Promise<void>;
    removeTag: (tag: string) => Promise<void>;
}

const DEBOUNCE_MS = 500;

export function useNotes(): UseNotesReturn {
    const [currentNote, setCurrentNote] = useState<NoteObject | null>(null);
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sortedIndex, setSortedIndex] = useState<NoteIndex>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [allTags, setAllTags] = useState<string[]>([]);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize — load or create today's note and collect all tags
    useEffect(() => {
        const init = async () => {
            try {
                const lastOpenedDate = await StorageService.getLastOpenedDate();
                const result = lastOpenedDate
                    ? await NoteService.getOrCreateDateNote(lastOpenedDate)
                    : await NoteService.getOrCreateTodayNote();

                setCurrentNote(result.note);
                setCurrentNoteId(result.noteId);
                setCurrentIndex(result.currentIndex);
                setSortedIndex(result.sortedIndex);
                await StorageService.setLastOpenedDate(result.note.date);

                // Collect all unique tags across all notes
                const tagSet = new Set<string>();
                for (const entry of result.sortedIndex) {
                    const note = await StorageService.getNote(entry.noteId);
                    if (note) {
                        note.tags.forEach((t) => tagSet.add(t));
                    }
                }
                setAllTags(Array.from(tagSet).sort());
            } catch (err) {
                console.error('Failed to initialize notes:', err);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // Navigate to a specific index
    const navigateTo = useCallback(async (index: number) => {
        const result = await NoteService.getNoteAtIndex(index);
        if (result) {
            setCurrentNote(result.note);
            setCurrentNoteId(result.noteId);
            setCurrentIndex(index);
            await StorageService.setLastOpenedDate(result.note.date);
        }
    }, []);

    const goToPrev = useCallback(async () => {
        if (currentIndex > 0) {
            await navigateTo(currentIndex - 1);
        }
    }, [currentIndex, navigateTo]);

    const goToNext = useCallback(async () => {
        if (currentIndex < sortedIndex.length - 1) {
            await navigateTo(currentIndex + 1);
        }
    }, [currentIndex, sortedIndex.length, navigateTo]);

    // Jump to a note by date string (yyyy-mm-dd), creating one if needed
    const goToDate = useCallback(async (date: string) => {
        const result = await NoteService.getOrCreateDateNote(date);
        setCurrentNote(result.note);
        setCurrentNoteId(result.noteId);
        setCurrentIndex(result.currentIndex);
        setSortedIndex(result.sortedIndex);
        await StorageService.setLastOpenedDate(result.note.date);
    }, []);

    // Debounced save
    const saveContent = useCallback(
        (markdown: string) => {
            if (!currentNoteId) return;

            // Optimistic local update
            setCurrentNote((prev) =>
                prev ? { ...prev, noteData: markdown, lastEdited: Date.now() } : prev
            );

            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            // Mark as saving when the debounce timer starts
            saveStateManager.setState('saving');

            debounceTimer.current = setTimeout(async () => {
                try {
                    await NoteService.saveNoteContent(currentNoteId, markdown);
                    saveStateManager.setState('saved');
                } catch (error) {
                    console.error('Failed to save note:', error);
                    saveStateManager.setState('error');
                }
            }, DEBOUNCE_MS);
        },
        [currentNoteId]
    );

    // Tag operations
    const addTag = useCallback(
        async (tag: string) => {
            if (!currentNoteId) return;
            saveStateManager.setState('saving');
            try {
                const updated = await NoteService.addTag(currentNoteId, tag);
                if (updated) {
                    setCurrentNote(updated);
                    // Update allTags if this is a new tag
                    setAllTags((prev) =>
                        prev.includes(tag) ? prev : [...prev, tag].sort()
                    );
                }
                saveStateManager.setState('saved');
            } catch (error) {
                console.error('Failed to add tag:', error);
                saveStateManager.setState('error');
            }
        },
        [currentNoteId]
    );

    const removeTag = useCallback(
        async (tag: string) => {
            if (!currentNoteId) return;
            saveStateManager.setState('saving');
            try {
                const updated = await NoteService.removeTag(currentNoteId, tag);
                if (updated) setCurrentNote(updated);
                saveStateManager.setState('saved');
            } catch (error) {
                console.error('Failed to remove tag:', error);
                saveStateManager.setState('error');
            }
        },
        [currentNoteId]
    );

    return {
        currentNote,
        currentNoteId,
        currentIndex,
        totalNotes: sortedIndex.length,
        isLoading,
        allTags,
        goToPrev,
        goToNext,
        goToDate,
        saveContent,
        addTag,
        removeTag,
    };
}
