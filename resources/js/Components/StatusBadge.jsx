import { statusLabel } from '@/utils/format';

const styles = {
    pending:
        'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
    approved:
        'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    rejected:
        'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
    expired:
        'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function StatusBadge({ status, className = '' }) {
    const style = styles[status] ?? styles.expired;

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold leading-none ${style} ${className}`}
        >
            {statusLabel(status)}
        </span>
    );
}
