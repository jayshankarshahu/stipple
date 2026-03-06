/**
 * DateService — date formatting helpers.
 * Pure functions, no side effects, easily replaceable.
 */

/**
 * Returns today's date as "yyyy-mm-dd".
 */
export function getTodayString(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Formats "yyyy-mm-dd" to a human-friendly label like "Feb 18, 2026".
 */
export function formatDateLabel(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Formats a Unix timestamp (ms) to a relative or clock time.
 */
export function formatTimestamp(unixMs: number): string {
    const now = Date.now();
    const diffSec = Math.floor((now - unixMs) / 1000);

    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;

    const date = new Date(unixMs);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}
