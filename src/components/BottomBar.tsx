import React from 'react';
import { formatTimestamp } from '../services/DateService';
import './BottomBar.css';

interface BottomBarProps {
    tagCount: number;
    lastEdited: number;
    isTagsOpen: boolean;
    onToggleTags: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
    tagCount,
    lastEdited,
    isTagsOpen,
    onToggleTags,
}) => {
    const openTimeline = () => {
        const url = typeof chrome !== 'undefined' && chrome.runtime
            ? chrome.runtime.getURL('timeline.html')
            : '/timeline.html';
        window.open(url, '_blank');
    };

    return (
        <div className="bottom-bar">
            <div className="bottom-bar__actions">
                <button
                    className={`bottom-bar__action ${isTagsOpen ? 'bottom-bar__action--active' : ''}`}
                    onClick={onToggleTags}
                >
                    <span className="material-symbols-rounded bottom-bar__action-icon">label</span>
                    <span>Tags</span>
                    {tagCount > 0 && (
                        <span className="bottom-bar__badge">{tagCount}</span>
                    )}
                </button>

                <button className="bottom-bar__action" onClick={openTimeline}>
                    <span className="material-symbols-rounded bottom-bar__action-icon">timeline</span>
                    <span>Timeline</span>
                </button>
            </div>

            <span className="bottom-bar__saved">
                {lastEdited > 0 ? formatTimestamp(lastEdited) : ''}
            </span>
        </div>
    );
};
