import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDateTime, formatEur, formatMoney } from '@/utils/format';
import { Head, Link, router, usePage } from '@inertiajs/react';

const STATUS_TABS = [
    { value: null, label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
];

const SUMMARY_CARDS = [
    { key: 'total', label: 'Total', accent: 'text-gray-900' },
    { key: 'pending', label: 'Pending', accent: 'text-amber-600' },
    { key: 'approved', label: 'Approved', accent: 'text-emerald-600' },
    { key: 'rejected', label: 'Rejected', accent: 'text-rose-600' },
    { key: 'expired', label: 'Expired', accent: 'text-gray-500' },
];

function applyFilter(status) {
    router.get(
        route('payment-requests.index'),
        status ? { status } : {},
        { preserveScroll: true, preserveState: true, replace: true },
    );
}

export default function Index({ paymentRequests, summary, filters, can }) {
    const isFinance = usePage().props.auth.user.role === 'finance';
    const activeStatus = filters.status ?? null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {isFinance ? 'Review queue' : 'My payment requests'}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {isFinance
                                ? 'All payment requests across the company.'
                                : 'Track the status of every request you submit.'}
                        </p>
                    </div>
                    {can.create && (
                        <Link
                            href={route('payment-requests.create')}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            New request
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Payment requests" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {SUMMARY_CARDS.map((card) => (
                            <div
                                key={card.key}
                                className="rounded-lg border border-gray-100 bg-white px-4 py-5 shadow-sm"
                            >
                                <dt className="text-sm font-medium text-gray-500">
                                    {card.label}
                                </dt>
                                <dd
                                    className={`mt-1 text-3xl font-semibold tracking-tight ${card.accent}`}
                                >
                                    {summary[card.key] ?? 0}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 py-3">
                            {STATUS_TABS.map((tab) => {
                                const active = activeStatus === tab.value;

                                return (
                                    <button
                                        key={tab.label}
                                        type="button"
                                        onClick={() => applyFilter(tab.value)}
                                        aria-pressed={active}
                                        className={`rounded-full px-3 py-1 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                                            active
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {paymentRequests.length === 0 ? (
                            <EmptyState
                                isFinance={isFinance}
                                filtered={Boolean(activeStatus)}
                                canCreate={can.create}
                            />
                        ) : (
                            <RequestTable
                                requests={paymentRequests}
                                showRequester={isFinance}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RequestTable({ requests, showRequester }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        {showRequester && <th className="px-4 py-3">Requester</th>}
                        <th className="px-4 py-3">Purpose</th>
                        <th className="px-4 py-3">Local amount</th>
                        <th className="px-4 py-3">EUR amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Submitted</th>
                        <th className="px-4 py-3">
                            <span className="sr-only">View</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                            {showRequester && (
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">
                                        {request.requester?.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {request.requester?.country_code}
                                    </div>
                                </td>
                            )}
                            <td className="max-w-xs px-4 py-3">
                                <span className="line-clamp-2 text-gray-700">
                                    {request.purpose}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                                {formatMoney(
                                    request.local_amount,
                                    request.local_currency,
                                )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                {formatEur(request.eur_amount)}
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge status={request.status} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                                {formatDateTime(request.created_at)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right">
                                <Link
                                    href={route(
                                        'payment-requests.show',
                                        request.id,
                                    )}
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    View
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EmptyState({ isFinance, filtered, canCreate }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
                </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">
                {filtered
                    ? 'No requests match this filter'
                    : isFinance
                      ? 'No payment requests yet'
                      : 'You have no payment requests'}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
                {filtered
                    ? 'Try selecting a different status.'
                    : isFinance
                      ? 'Requests submitted by employees will appear here.'
                      : 'Submit your first request and we will fetch the live exchange rate for you.'}
            </p>
            {canCreate && !filtered && (
                <Link
                    href={route('payment-requests.create')}
                    className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Create a request
                </Link>
            )}
        </div>
    );
}
