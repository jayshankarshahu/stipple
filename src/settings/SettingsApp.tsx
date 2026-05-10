import React, { useEffect, useState } from 'react';
import './SettingsApp.css';

type OpenPreference = 'sidepanel' | 'popup';

type ThemeMode = 'dark' | 'light';

export type { ThemeMode };

export async function getStoredTheme(): Promise<ThemeMode> {
    const storage = getStorage();
    if (!storage) throw new Error('Chrome storage not available');
    return new Promise((resolve) => {
        storage.get(['theme'], (result) => {
            resolve((result.theme as ThemeMode) || 'dark');
        });
    });
}

async function applyTheme(theme: ThemeMode): Promise<void> {
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

function getStorage(): typeof chrome.storage.local | null {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return chrome.storage.local;
    }
    return null;
}

const OPEN_PREFERENCE_KEY = 'openPreference';

export const SettingsApp: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [openPreference, setOpenPreference] = useState<OpenPreference>('sidepanel');
    const [theme, setTheme] = useState<ThemeMode>('dark');

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedTheme = await getStoredTheme();
                setTheme(storedTheme);
                await applyTheme(storedTheme);

                const storage = getStorage();
                if (storage) {
                    const result = await new Promise<Record<string, unknown>>((resolve) => storage.get([OPEN_PREFERENCE_KEY], (result) => resolve(result as Record<string, unknown>)));
                    setOpenPreference((result[OPEN_PREFERENCE_KEY] as OpenPreference) || 'sidepanel');
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        };
        loadSettings();
    }, []);

    const handleThemeToggle = async () => {
        const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        try {
            await applyTheme(nextTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const saveOpenPreference = async (preference: OpenPreference) => {
        setOpenPreference(preference);
        const storage = getStorage();
        if (storage) {
            try {
                await new Promise<void>((resolve, reject) => {
                    storage.set({ [OPEN_PREFERENCE_KEY]: preference }, () => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            resolve();
                        }
                    });
                });
            } catch (error) {
                console.error('Failed to save open preference:', error);
            }
        }
    };

    return (
        <div className="settings-page">
            <aside className="settings-sidebar">
                <div className="settings-sidebar__header">
                    <h2>Settings</h2>
                    <p>Configure your extension experience.</p>
                </div>
                <button
                    className={`settings-category ${selectedCategory === 'general' ? 'settings-category--active' : ''}`}
                    onClick={() => setSelectedCategory('general')}
                >
                    General
                </button>
            </aside>

            <main className="settings-content">
                <div className="settings-content__header">
                    <h1>General</h1>
                    <p>Control how the extension opens and the active theme.</p>
                </div>

                <div className="settings-row">
                    <div className="settings-label">
                        <span className="settings-label__title">Open In</span>
                        <span className="settings-label__description">Choose whether the extension launches in the side panel or as a popup.</span>
                    </div>
                    <div className="settings-control">
                        <label className="settings-option">
                            <input
                                type="radio"
                                name="openPreference"
                                value="sidepanel"
                                checked={openPreference === 'sidepanel'}
                                onChange={() => saveOpenPreference('sidepanel')}
                            />
                            Side Panel
                        </label>
                        <label className="settings-option">
                            <input
                                type="radio"
                                name="openPreference"
                                value="popup"
                                checked={openPreference === 'popup'}
                                onChange={() => saveOpenPreference('popup')}
                            />
                            Popup
                        </label>
                    </div>
                </div>

                <div className="settings-row">
                    <div className="settings-label">
                        <span className="settings-label__title">Theme</span>
                        <span className="settings-label__description">Toggle between light and dark mode.</span>
                    </div>
                    <div className="settings-control">
                        <button className="theme-control" onClick={handleThemeToggle}>
                            <span className="material-symbols-rounded">
                                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                            </span>
                            {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
