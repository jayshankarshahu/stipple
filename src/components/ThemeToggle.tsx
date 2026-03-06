import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

function getStoredTheme(): 'dark' | 'light' {
    try {
        return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    } catch {
        return 'dark';
    }
}

function applyTheme(theme: 'dark' | 'light'): void {
    document.documentElement.setAttribute('data-theme', theme);
    try {
        localStorage.setItem('theme', theme);
    } catch {
        // ignore storage errors in extension context
    }
}

export const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    // Apply the stored theme on mount
    useEffect(() => {
        const stored = getStoredTheme();
        setTheme(stored);
        applyTheme(stored);
    }, []);

    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        applyTheme(next);
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
