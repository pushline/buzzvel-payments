import { statusLabel } from '@/utils/format';

const styles = {
    pending: 'bg-amber-100 text-amber-800 ring-amber-600/20',
    approved: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    rejected: 'bg-rose-100 text-rose-800 ring-rose-600/20',
    expired: 'bg-gray-100 text-gray-600 ring-gray-500/20',
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
