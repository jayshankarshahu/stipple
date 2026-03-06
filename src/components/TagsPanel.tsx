import React, { useState, useRef, useEffect, useMemo } from 'react';
import './TagsPanel.css';

interface TagsPanelProps {
    tags: string[];
    allTags: string[];
    onAddTag: (tag: string) => Promise<void>;
    onRemoveTag: (tag: string) => Promise<void>;
}

export const TagsPanel: React.FC<TagsPanelProps> = ({
    tags,
    allTags,
    onAddTag,
    onRemoveTag,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when panel opens
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Filtered suggestions
    const suggestions = useMemo(() => {
        if (!inputValue.trim()) return [];
        const q = inputValue.toLowerCase();
        return allTags
            .filter((t) => t.toLowerCase().includes(q) && !tags.includes(t))
            .slice(0, 5);
    }, [inputValue, allTags, tags]);

    const handleAdd = async (value?: string) => {
        const trimmed = (value ?? inputValue).trim();
        if (!trimmed) return;
        await onAddTag(trimmed);
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="tags-panel">
            {/* Existing tags */}
            <div className="tags-panel__chips">
                {tags.length === 0 ? (
                    <span className="tags-panel__empty">No tags — add one below</span>
                ) : (
                    tags.map((tag) => (
                        <span key={tag} className="tags-panel__chip">
                            {tag}
                            <button
                                className="tags-panel__chip-remove"
                                onClick={() => onRemoveTag(tag)}
                                aria-label={`Remove ${tag}`}
                            >
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </span>
                    ))
                )}
            </div>

            {/* Input + suggestions */}
            <div className="tags-panel__input-area">
                <div className="tags-panel__input-row">
                    <span className="material-symbols-rounded tags-panel__input-icon">label</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="tags-panel__input"
                        placeholder="Add tag..."
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        autoComplete="off"
                    />
                    {inputValue && (
                        <button
                            className="tags-panel__add-btn"
                            onClick={() => handleAdd()}
                        >
                            <span className="material-symbols-rounded">add</span>
                        </button>
                    )}
                </div>

                {showSuggestions && suggestions.length > 0 && (
                    <ul className="tags-panel__suggestions">
                        {suggestions.map((s) => (
                            <li
                                key={s}
                                className="tags-panel__suggestion"
                                onMouseDown={() => handleAdd(s)}
                            >
                                <span className="material-symbols-rounded tags-panel__suggestion-icon">label</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
