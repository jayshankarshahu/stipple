import React, { useRef } from 'react';
import { formatDateLabel, getTodayString } from '../services/DateService';
import './TopBar.css';

interface TopBarProps {
    date: string;
    canGoPrev: boolean;
    canGoNext: boolean;
    onPrev: () => void;
    onNext: () => void;
    onJumpToDate: (date: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    date,
    canGoPrev,
    canGoNext,
    onPrev,
    onNext,
    onJumpToDate,
}) => {
    const dateInputRef = useRef<HTMLInputElement>(null);

    const handleDateClick = () => {
        dateInputRef.current?.showPicker?.();
        dateInputRef.current?.click();
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            onJumpToDate(e.target.value);
        }
    };

    const today = getTodayString();

    return (
        <div className="top-bar">
            <div
                className={`top-bar__nav ${!canGoPrev ? 'top-bar__nav--disabled' : ''}`}
                onClick={canGoPrev ? onPrev : undefined}
                role="button"
                tabIndex={canGoPrev ? 0 : -1}
                onKeyDown={(e) => e.key === 'Enter' && canGoPrev && onPrev()}
                title="Previous Note"
                aria-label="Previous Note"
            >
                <span className="material-symbols-rounded top-bar__nav-icon">chevron_left</span>
            </div>

            <div className="top-bar__date-wrapper">
                <button
                    className="top-bar__date"
                    onClick={handleDateClick}
                    title="Click to jump to a date"
                >
                    {formatDateLabel(date)}
                    <span className="material-symbols-rounded top-bar__date-icon">event</span>
                </button>
                <input
                    ref={dateInputRef}
                    type="date"
                    className="top-bar__date-input"
                    value={date}
                    onChange={handleDateChange}
                    aria-label="Jump to date"
                />

                {date !== today && (
                    <button
                        type="button"
                        className="top-bar__today"
                        onClick={() => onJumpToDate(today)}
                        title="Today's note"
                        aria-label="Today's note"
                    >
                        <span className="material-symbols-rounded">today</span>
                    </button>
                )}
            </div>

            <div
                className={`top-bar__nav ${!canGoNext ? 'top-bar__nav--disabled' : ''}`}
                onClick={canGoNext ? onNext : undefined}
                role="button"
                tabIndex={canGoNext ? 0 : -1}
                onKeyDown={(e) => e.key === 'Enter' && canGoNext && onNext()}
                title="Next Note"
                aria-label="Next Note"
            >
                <span className="material-symbols-rounded top-bar__nav-icon">chevron_right</span>
            </div>
        </div>
    );
};
