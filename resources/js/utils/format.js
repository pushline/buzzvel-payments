export function formatMoney(amount, currency) {
    const value = Number(amount);

    if (Number.isNaN(value)) {
        return `${amount} ${currency ?? ''}`.trim();
    }

    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
        }).format(value);
    } catch {
        // Fall back when the currency code is not recognised by the runtime.
        return `${value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} ${currency ?? ''}`.trim();
    }
}

export function formatEur(amount) {
    return formatMoney(amount, 'EUR');
}

export function formatDateTime(value) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export function statusLabel(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}
