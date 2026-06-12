import { statusLabel } from '@/utils/format';

const styles = {
    pending: 'bg-amber-50 text-amber-800 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    rejected: 'bg-rose-50 text-rose-800 ring-rose-200',
    expired: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function StatusBadge({ status, className = '' }) {
    const style = styles[status] ?? styles.expired;

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style} ${className}`}
        >
            {statusLabel(status)}
        </span>
    );
}
