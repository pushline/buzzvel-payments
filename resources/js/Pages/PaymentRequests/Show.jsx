import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDateTime, formatEur, formatMoney } from '@/utils/format';
import { Head, Link, useForm } from '@inertiajs/react';

function DetailRow({ label, children }) {
    return (
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="text-sm font-medium text-slate-950 sm:text-right">
                {children}
            </dd>
        </div>
    );
}

function DetailSection({ title, icon = null, children }) {
    return (
        <section className="surface">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
                {icon}
                <h3 className="text-base font-semibold text-slate-900">
                    {title}
                </h3>
            </div>
            {children}
        </section>
    );
}

function LockedRateIcon() {
    return (
        <svg
            className="h-4 w-4 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function AmountSummary({ request }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface p-6">
                <p className="text-sm font-medium text-slate-500">
                    Local amount
                </p>
                <p className="money mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    {formatMoney(
                        request.local_amount,
                        request.local_currency,
                    )}
                </p>
            </div>

            <div className="rounded-xl bg-blue-700 p-6 text-white shadow-sm">
                <p className="text-sm font-medium text-blue-100">
                    Converted (EUR)
                </p>
                <p className="money mt-1 text-3xl font-bold tracking-tight">
                    {formatEur(request.eur_amount)}
                </p>
            </div>
        </div>
    );
}

function RequestDetails({ request }) {
    return (
        <DetailSection title="Request details">
            <dl className="divide-y divide-slate-100 px-6">
                <DetailRow label="Purpose">
                    <span className="whitespace-pre-wrap">{request.purpose}</span>
                </DetailRow>
                <DetailRow label="Requested by">
                    {request.requester?.name}
                    <span className="block text-xs text-slate-500">
                        {request.requester?.email} /{' '}
                        {request.requester?.country_code}
                    </span>
                </DetailRow>
                <DetailRow label="Submitted">
                    {formatDateTime(request.created_at)}
                </DetailRow>
            </dl>
        </DetailSection>
    );
}

function ExchangeRateDetails({ rate }) {
    return (
        <DetailSection
            title="Exchange rate (locked at creation)"
            icon={<LockedRateIcon />}
        >
            <dl className="divide-y divide-slate-100 px-6">
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
        </DetailSection>
    );
}

function ReviewSection({ request, canReview }) {
    const approve = useForm({});
    const reject = useForm({});
    const busy = approve.processing || reject.processing;

    const submitReview = (form, action) => {
        form.post(route(`payment-requests.${action}`, request.id), {
            preserveScroll: true,
        });
    };

    return (
        <DetailSection title="Review">
            <div className="px-6 py-4">
                {request.status === 'pending' ? (
                    canReview ? (
                        <ReviewActions
                            approve={approve}
                            reject={reject}
                            busy={busy}
                            submitReview={submitReview}
                        />
                    ) : (
                        <p className="text-sm text-slate-500">
                            This request is awaiting review by the finance team.
                        </p>
                    )
                ) : (
                    <ReviewDecision request={request} />
                )}
            </div>
        </DetailSection>
    );
}

function ReviewActions({ approve, reject, busy, submitReview }) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500">
                Approve or reject this pending request. This action cannot be
                undone.
            </p>
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => submitReview(approve, 'approve')}
                    className="inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {approve.processing ? 'Approving...' : 'Approve'}
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => submitReview(reject, 'reject')}
                    className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {reject.processing ? 'Rejecting...' : 'Reject'}
                </button>
            </div>
        </div>
    );
}

function ReviewDecision({ request }) {
    return (
        <dl className="divide-y divide-slate-100">
            <DetailRow label="Decision">
                <StatusBadge status={request.status} />
            </DetailRow>
            {request.reviewer && (
                <DetailRow label="Reviewed by">
                    {request.reviewer.name}
                </DetailRow>
            )}
            {request.reviewed_at && (
                <DetailRow label="Reviewed at">
                    {formatDateTime(request.reviewed_at)}
                </DetailRow>
            )}
            {request.status === 'expired' && (
                <p className="pt-3 text-sm text-slate-500">
                    This request expired automatically after remaining pending
                    for more than 48 hours.
                </p>
            )}
        </dl>
    );
}

export default function Show({ paymentRequest, can }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('payment-requests.index')}
                            className="text-sm font-semibold text-slate-500 hover:text-blue-700"
                        >
                            Back
                        </Link>
                        <h1 className="text-xl font-bold leading-tight text-slate-950">
                            Payment request #{paymentRequest.id}
                        </h1>
                    </div>
                    <StatusBadge status={paymentRequest.status} />
                </div>
            }
        >
            <Head title={`Payment request #${paymentRequest.id}`} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <AmountSummary request={paymentRequest} />
                    <RequestDetails request={paymentRequest} />
                    <ExchangeRateDetails rate={paymentRequest.exchange_rate} />
                    <ReviewSection
                        request={paymentRequest}
                        canReview={can.review}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
