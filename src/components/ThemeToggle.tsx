import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

function getStorage(): typeof chrome.storage.local | null {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return chrome.storage.local;
    }
    return null;
}

function getStoredTheme(): Promise<'dark' | 'light'> {
    const storage = getStorage();
    if (!storage) throw new Error('Chrome storage not available');
    return new Promise((resolve) => {
        storage.get(['theme'], (result) => {
            resolve((result.theme as 'dark' | 'light') || 'dark');
        });
    });
}

async function applyTheme(theme: 'dark' | 'light'): Promise<void> {
    document.documentElement.setAttribute('data-theme', theme);
    const storage = getStorage();
    if (!storage) throw new Error('Chrome storage not available');
    return new Promise((resolve, reject) => {
        storage.set({ theme }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve();
            }
        });
    });
}

export const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    // Apply the stored theme on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const stored = await getStoredTheme();
                setTheme(stored);
                await applyTheme(stored);
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        };
        loadTheme();
    }, []);

    const toggle = async () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        try {
            await applyTheme(next);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    return (
        <button
            className="theme-toggle"
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <span className="material-symbols-rounded">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    );
};
