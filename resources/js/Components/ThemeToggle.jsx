import { useEffect, useState } from 'react';

const THEME_CHANGE_EVENT = 'buzzpay:theme-change';

export default function ThemeToggle({ className = '' }) {
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.classList.contains('dark'),
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch {
            // The selected theme still applies for the current page.
        }

        window.dispatchEvent(
            new CustomEvent(THEME_CHANGE_EVENT, { detail: { isDark } }),
        );
    }, [isDark]);

    useEffect(() => {
        const syncTheme = (event) => setIsDark(event.detail.isDark);

        window.addEventListener(THEME_CHANGE_EVENT, syncTheme);

        return () => window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
    }, []);

    return (
        <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-pressed={isDark}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
        >
            {isDark ? (
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="4" />
                    <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                </svg>
            ) : (
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.35 15.35A9 9 0 0 1 8.65 3.65a9 9 0 1 0 11.7 11.7Z"
                    />
                </svg>
            )}
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
    );
}
