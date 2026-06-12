import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDateTime, formatEur, formatMoney } from '@/utils/format';
import { Head, Link, useForm } from '@inertiajs/react';

function DetailRow({ label, children }) {
    return (
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-900 sm:text-right">{children}</dd>
        </div>
    );
}

export default function Show({ paymentRequest, can }) {
    const request = paymentRequest;
    const rate = request.exchange_rate;
    const reviewer = request.reviewer;

    const approve = useForm({});
    const reject = useForm({});
    const busy = approve.processing || reject.processing;

    const submitReview = (form, action) => {
        form.post(route(`payment-requests.${action}`, request.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('payment-requests.index')}
                            className="text-sm font-medium text-gray-500 hover:text-gray-800"
                        >
                            ← Back
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Payment request #{request.id}
                        </h2>
                    </div>
                    <StatusBadge status={request.status} />
                </div>
            }
        >
            <Head title={`Payment request #${request.id}`} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Local amount
                            </p>
                            <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                                {formatMoney(
                                    request.local_amount,
                                    request.local_currency,
                                )}
                            </p>
                        </div>
                        <div className="rounded-lg bg-indigo-600 p-6 text-white shadow-sm">
                            <p className="text-sm font-medium text-indigo-100">
                                Converted (EUR)
                            </p>
                            <p className="mt-1 text-3xl font-semibold tracking-tight">
                                {formatEur(request.eur_amount)}
                            </p>
                        </div>
                    </div>

                    <section className="rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Request details
                            </h3>
                        </div>
                        <dl className="divide-y divide-gray-100 px-6">
                            <DetailRow label="Purpose">
                                <span className="whitespace-pre-wrap">
                                    {request.purpose}
                                </span>
                            </DetailRow>
                            <DetailRow label="Requested by">
                                {request.requester?.name}
                                <span className="block text-xs text-gray-500">
                                    {request.requester?.email} ·{' '}
                                    {request.requester?.country_code}
                                </span>
                            </DetailRow>
                            <DetailRow label="Submitted">
                                {formatDateTime(request.created_at)}
                            </DetailRow>
                        </dl>
                    </section>

                    <section className="rounded-lg bg-white shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                            </svg>
                            <h3 className="text-base font-semibold text-gray-900">
                                Exchange rate (locked at creation)
                            </h3>
                        </div>
                        <dl className="divide-y divide-gray-100 px-6">
                            <DetailRow label="Rate">
                                1 {rate.base_currency} ={' '}
                                {Number(rate.rate).toLocaleString(undefined, {
                                    maximumFractionDigits: 6,
                                })}{' '}
                                {rate.target_currency}
                            </DetailRow>
                            <DetailRow label="Source">{rate.source}</DetailRow>
                            <DetailRow label="Fetched at">
                                {formatDateTime(rate.fetched_at)}
                            </DetailRow>
                        </dl>
                    </section>

                    <section className="rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Review
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            {request.status === 'pending' ? (
                                can.review ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500">
                                            Approve or reject this pending
                                            request. This action cannot be
                                            undone.
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() =>
                                                    submitReview(
                                                        approve,
                                                        'approve',
                                                    )
                                                }
                                                className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {approve.processing
                                                    ? 'Approving…'
                                                    : 'Approve'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() =>
                                                    submitReview(
                                                        reject,
                                                        'reject',
                                                    )
                                                }
                                                className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm ring-1 ring-inset ring-rose-200 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {reject.processing
                                                    ? 'Rejecting…'
                                                    : 'Reject'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        This request is awaiting review by the
                                        finance team.
                                    </p>
                                )
                            ) : (
                                <dl className="divide-y divide-gray-100">
                                    <DetailRow label="Decision">
                                        <StatusBadge status={request.status} />
                                    </DetailRow>
                                    {reviewer && (
                                        <DetailRow label="Reviewed by">
                                            {reviewer.name}
                                        </DetailRow>
                                    )}
                                    {request.reviewed_at && (
                                        <DetailRow label="Reviewed at">
                                            {formatDateTime(
                                                request.reviewed_at,
                                            )}
                                        </DetailRow>
                                    )}
                                    {request.status === 'expired' && (
                                        <p className="pt-3 text-sm text-gray-500">
                                            This request expired automatically
                                            after remaining pending for more than
                                            48 hours.
                                        </p>
                                    )}
                                </dl>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
