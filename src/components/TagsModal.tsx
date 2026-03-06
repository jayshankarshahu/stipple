import React, { useState, useRef, useEffect, useMemo } from 'react';
import './TagsModal.css';

interface TagsModalProps {
    tags: string[];
    allTags: string[];
    onAddTag: (tag: string) => Promise<void>;
    onRemoveTag: (tag: string) => Promise<void>;
    onClose: () => void;
}

export const TagsModal: React.FC<TagsModalProps> = ({
    tags,
    allTags,
    onAddTag,
    onRemoveTag,
    onClose,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Filtered suggestions: matches input, not already added
    const suggestions = useMemo(() => {
        if (!inputValue.trim()) return [];
        const q = inputValue.toLowerCase();
        return allTags.filter(
            (t) => t.toLowerCase().includes(q) && !tags.includes(t)
        ).slice(0, 6);
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
            if (showSuggestions) {
                setShowSuggestions(false);
            } else {
                onClose();
            }
        }
    };

    return (
        <div className="tags-modal-overlay" onClick={onClose}>
            <div className="tags-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tags-modal__header">
                    <span className="tags-modal__title">Tags</span>
                    <button className="tags-modal__close" onClick={onClose} aria-label="Close">
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                <div className="tags-modal__input-area">
                    <div className="tags-modal__input-row">
                        <input
                            ref={inputRef}
                            type="text"
                            className="tags-modal__input"
                            placeholder="Add a tag..."
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
                        <button className="tags-modal__add-btn" onClick={() => handleAdd()}>
                            <span className="material-symbols-rounded">add</span>
                            Add
                        </button>
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="tags-modal__suggestions">
                            {suggestions.map((s) => (
                                <li
                                    key={s}
                                    className="tags-modal__suggestion"
                                    onMouseDown={() => handleAdd(s)}
                                >
                                    <span className="material-symbols-rounded tags-modal__suggestion-icon">label</span>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="tags-modal__tags-list">
                    {tags.length === 0 ? (
                        <span className="tags-modal__empty">No tags yet</span>
                    ) : (
                        tags.map((tag) => (
                            <span key={tag} className="tags-modal__tag">
                                {tag}
                                <button
                                    className="tags-modal__tag-remove"
                                    onClick={() => onRemoveTag(tag)}
                                    aria-label={`Remove tag ${tag}`}
                                >
                                    <span className="material-symbols-rounded">close</span>
                                </button>
                            </span>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
