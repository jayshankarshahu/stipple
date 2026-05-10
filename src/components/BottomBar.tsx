import React from 'react';
import './BottomBar.css';

interface BottomBarProps {
    tagCount: number;
    isTagsOpen: boolean;
    onToggleTags: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
    tagCount,
    isTagsOpen,
    onToggleTags,
}) => {
    const openTimeline = () => {
        const url = typeof chrome !== 'undefined' && chrome.runtime
            ? chrome.runtime.getURL('timeline.html')
            : '/timeline.html';
        window.open(url, '_blank');
    };

    const openSettings = () => {
        const url = typeof chrome !== 'undefined' && chrome.runtime
            ? chrome.runtime.getURL('settings.html')
            : '/settings.html';
        window.open(url, '_blank');
    };

    return (
        <div className="bottom-bar">
            <div className="bottom-bar__actions">
                <button
                    className={`bottom-bar__action ${isTagsOpen ? 'bottom-bar__action--active' : ''}`}
                    onClick={onToggleTags}
                    title="Tags"
                    aria-label="Tags"
                >
                    <span className="material-symbols-rounded bottom-bar__action-icon">label</span>
                    {tagCount > 0 && (
                        <span className="bottom-bar__badge">{tagCount}</span>
                    )}
                </button>

                <button
                    className="bottom-bar__action"
                    onClick={openTimeline}
                    title="Timeline"
                    aria-label="Timeline"
                >
                    <span className="material-symbols-rounded bottom-bar__action-icon">timeline</span>
                </button>

                <button
                    className="bottom-bar__action"
                    onClick={openSettings}
                    title="Settings"
                    aria-label="Settings"
                >
                    <span className="material-symbols-rounded bottom-bar__action-icon">settings</span>
                </button>
            </div>
        </div>
    );
};
