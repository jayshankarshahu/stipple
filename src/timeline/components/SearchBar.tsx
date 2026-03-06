import React from 'react';
import './SearchBar.css';

interface SearchBarProps {
    query: string;
    onQueryChange: (q: string) => void;
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (d: string) => void;
    onDateToChange: (d: string) => void;
    onResetDates: () => void;
    resultCount: number;
    totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    query,
    onQueryChange,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    onResetDates,
    resultCount,
    totalCount,
}) => {
    const hasDateFilter = dateFrom || dateTo;

    return (
        <div className="search-bar">
            <div className="search-bar__row">
                <div className="search-bar__input-wrapper">
                    <span className="material-symbols-rounded search-bar__icon">search</span>
                    <input
                        type="text"
                        className="search-bar__input"
                        placeholder="Search notes..."
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                    />
                    {query && (
                        <button
                            className="search-bar__clear"
                            onClick={() => onQueryChange('')}
                        >
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    )}
                </div>
                <span className="search-bar__result-count">
                    {query || hasDateFilter
                        ? `${resultCount} of ${totalCount} notes`
                        : `${totalCount} notes`}
                </span>
            </div>

            <div className="search-bar__row">
                <div className="search-bar__date-range">
                    <span className="search-bar__date-label">From</span>
                    <input
                        type="date"
                        className="search-bar__date-input"
                        value={dateFrom}
                        onChange={(e) => onDateFromChange(e.target.value)}
                    />
                    <span className="search-bar__date-separator">→</span>
                    <span className="search-bar__date-label">To</span>
                    <input
                        type="date"
                        className="search-bar__date-input"
                        value={dateTo}
                        onChange={(e) => onDateToChange(e.target.value)}
                    />
                    {hasDateFilter && (
                        <button
                            className="search-bar__reset-dates"
                            onClick={onResetDates}
                        >
                            Clear dates
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
