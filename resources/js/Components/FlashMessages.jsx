import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function Banner({ tone, message, onDismiss }) {
    const tones = {
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        error: 'border-rose-200 bg-rose-50 text-rose-800',
    };

    return (
        <div
            role="status"
            className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm ${tones[tone]}`}
        >
            <span>{message}</span>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss message"
                className="rounded text-current/70 transition hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-current"
            >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
            </button>
        </div>
    );
}

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [dismissed, setDismissed] = useState({});

    useEffect(() => {
        setDismissed({});
    }, [flash?.success, flash?.error]);

    const messages = [
        flash?.success && !dismissed.success
            ? { key: 'success', tone: 'success', message: flash.success }
            : null,
        flash?.error && !dismissed.error
            ? { key: 'error', tone: 'error', message: flash.error }
            : null,
    ].filter(Boolean);

    if (messages.length === 0) {
        return null;
    }

    return (
        <div className="mx-auto max-w-7xl space-y-3 px-4 pt-6 sm:px-6 lg:px-8">
            {messages.map((item) => (
                <Banner
                    key={item.key}
                    tone={item.tone}
                    message={item.message}
                    onDismiss={() =>
                        setDismissed((prev) => ({ ...prev, [item.key]: true }))
                    }
                />
            ))}
        </div>
    );
}
