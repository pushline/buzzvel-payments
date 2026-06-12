import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

const WORKFLOW_STEPS = [
    {
        number: '01',
        title: 'Employee submits',
        copy: "The amount is entered in the employee's assigned local currency with a clear business purpose.",
    },
    {
        number: '02',
        title: 'BuzzPay converts',
        copy: 'A live EUR rate is fetched, used for conversion, and permanently stored with its source and timestamp.',
    },
    {
        number: '03',
        title: 'Finance decides',
        copy: 'Finance reviews one consistent record and approves or rejects it before the 48-hour expiry window.',
    },
];

const CONTROL_ITEMS = [
    {
        title: 'Immutable rate record',
        copy: 'The original conversion metadata stays unchanged after submission.',
    },
    {
        title: 'Clear role boundaries',
        copy: 'Employees see their requests; finance sees and reviews all requests.',
    },
    {
        title: 'Focused review states',
        copy: 'Pending requests can be approved or rejected exactly once.',
    },
    {
        title: 'Automatic expiration',
        copy: 'Unreviewed requests expire after more than 48 hours.',
    },
];

function ArrowIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <path
                d="M4 10h12m-5-5 5 5-5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path
                d="m4 10 4 4 8-9"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function Brand({ compact = false }) {
    return (
        <div className="flex items-center gap-3">
            <ApplicationLogo
                className={`${compact ? 'h-7 w-7' : 'h-9 w-9'} text-blue-700`}
            />
            <span className="font-bold tracking-[-0.02em] text-slate-950">
                BuzzPay
            </span>
        </div>
    );
}

export function MarketingHeader({ user }) {
    return (
        <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95">
            <nav
                className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8"
                aria-label="Main navigation"
            >
                <Link
                    href="/"
                    className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                >
                    <Brand />
                </Link>

                <div className="hidden items-center gap-7 md:flex">
                    <a href="#product" className="marketing-nav-link">
                        Product
                    </a>
                    <a href="#workflow" className="marketing-nav-link">
                        How it works
                    </a>
                    <a href="#controls" className="marketing-nav-link">
                        Controls
                    </a>
                </div>

                <div className="flex items-center gap-2">
                    {user ? (
                        <Link href={route('dashboard')} className="dark-button">
                            Open dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="hidden rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="dark-button"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

export function HeroSection() {
    const benefits = [
        'Immutable exchange rates',
        'Role-based access',
        'Automatic expiry',
    ];

    return (
        <section className="overflow-hidden border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
                <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
                    <div className="max-w-3xl">
                        <p className="eyebrow">Built for international teams</p>
                        <h1 className="mt-2 text-5xl font-bold leading-[1.03] tracking-[-0.055em] text-slate-950 sm:text-7xl">
                            Local requests.
                            <span className="block text-blue-700">
                                One finance view.
                            </span>
                        </h1>
                        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                            BuzzPay is a multi-currency payment request system.
                            Employees request payments in their own currency
                            while finance reviews every request in EUR with the
                            original exchange rate preserved.
                        </p>

                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link
                                href={route('register')}
                                className="primary-marketing-button"
                            >
                                Create employee account
                                <ArrowIcon />
                            </Link>
                            <Link
                                href={route('login')}
                                className="secondary-marketing-button"
                            >
                                Log in
                            </Link>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-slate-600">
                            {benefits.map((benefit) => (
                                <span
                                    key={benefit}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-blue-700">
                                        <CheckIcon />
                                    </span>
                                    {benefit}
                                </span>
                            ))}
                        </div>
                    </div>

                    <PaymentRequestPreview />
                </div>
            </div>
        </section>
    );
}

function PaymentRequestPreview() {
    return (
        <div className="relative lg:pl-8">
            <div className="absolute -left-6 top-12 hidden h-32 w-px bg-blue-300 lg:block" />
            <div className="surface overflow-hidden border-slate-300 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <ApplicationLogo className="h-7 w-7 text-blue-700" />
                        <div>
                            <p className="text-xs font-bold text-slate-950">
                                Request #1048
                            </p>
                            <p className="text-xs text-slate-500">
                                Submitted by Ana Silva
                            </p>
                        </div>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                        Pending
                    </span>
                </div>

                <div className="p-5 sm:p-7">
                    <p className="text-sm font-semibold text-slate-950">
                        Conference travel and accommodation
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <PreviewAmount
                            label="Local amount"
                            amount="R$ 1,250.00"
                            note="Brazilian real"
                        />
                        <PreviewAmount
                            label="Finance view"
                            amount="EUR 209.08"
                            note="Converted at creation"
                            highlighted
                        />
                    </div>

                    <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 px-4">
                        <PreviewRow label="Locked rate" value="1 EUR = 5.978700 BRL" />
                        <PreviewRow label="Rate provider" value="ExchangeRate-API" />
                        <PreviewRow label="Review deadline" value="Within 48 hours" />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-emerald-700 py-2.5 text-center text-sm font-semibold text-white">
                            Approve
                        </div>
                        <div className="rounded-lg border border-rose-200 py-2.5 text-center text-sm font-semibold text-rose-700">
                            Reject
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PreviewAmount({ label, amount, note, highlighted = false }) {
    return (
        <div
            className={`rounded-lg border p-4 ${
                highlighted
                    ? 'border-blue-200 bg-blue-50 text-blue-950'
                    : 'border-slate-200'
            }`}
        >
            <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                    highlighted ? 'text-blue-700' : 'text-slate-500'
                }`}
            >
                {label}
            </p>
            <p className="money mt-2 text-xl font-bold">{amount}</p>
            <p
                className={`mt-1 text-xs ${
                    highlighted ? 'text-blue-700' : 'text-slate-500'
                }`}
            >
                {note}
            </p>
        </div>
    );
}

function PreviewRow({ label, value }) {
    return (
        <div className="flex justify-between gap-4 py-3 text-xs">
            <span className="text-slate-500">{label}</span>
            <span className="money text-right font-semibold">{value}</span>
        </div>
    );
}

export function ProductSection() {
    return (
        <section
            id="product"
            className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
        >
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
                <div>
                    <p className="eyebrow">What BuzzPay is</p>
                    <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
                        A shared language between employees and finance.
                    </h2>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                    <RoleDescription
                        role="For employees"
                        title="Request without converting manually."
                        copy="Submit the real local amount and explain its purpose. BuzzPay handles the EUR calculation and keeps you informed as finance reviews it."
                        accent="blue"
                    />
                    <RoleDescription
                        role="For finance"
                        title="Compare and decide consistently."
                        copy="Review requests from every country in one queue, with local context, normalized EUR values, and immutable rate evidence."
                    />
                </div>
            </div>
        </section>
    );
}

function RoleDescription({ role, title, copy, accent = 'slate' }) {
    const accentClasses =
        accent === 'blue'
            ? 'border-blue-700 text-blue-700'
            : 'border-slate-950 text-slate-950';

    return (
        <article className={`border-t-2 pt-5 ${accentClasses}`}>
            <p className="text-sm font-bold">{role}</p>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
                {title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
        </article>
    );
}

export function WorkflowSection() {
    return (
        <section
            id="workflow"
            className="border-y border-slate-200 bg-slate-950 text-white"
        >
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
                <div className="max-w-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                        One traceable workflow
                    </p>
                    <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                        From local amount to finance decision.
                    </h2>
                </div>

                <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-slate-700 bg-slate-700 lg:grid-cols-3">
                    {WORKFLOW_STEPS.map((step) => (
                        <article
                            key={step.number}
                            className="bg-slate-950 p-6 sm:p-8"
                        >
                            <p className="money text-sm font-bold text-blue-300">
                                {step.number}
                            </p>
                            <h3 className="mt-6 text-xl font-bold">
                                {step.title}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                {step.copy}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ControlsSection() {
    return (
        <section
            id="controls"
            className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
        >
            <div className="surface grid overflow-hidden lg:grid-cols-[.9fr_1.1fr]">
                <div className="border-b border-slate-200 bg-blue-50 p-7 sm:p-10 lg:border-b-0 lg:border-r">
                    <p className="eyebrow">Designed for control</p>
                    <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em]">
                        The conversion cannot quietly change later.
                    </h2>
                    <p className="mt-5 text-sm leading-7 text-slate-600">
                        Every request becomes an auditable snapshot: amount,
                        currency, EUR conversion, applied rate, source, and
                        provider timestamp.
                    </p>
                </div>

                <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
                    {CONTROL_ITEMS.map((item) => (
                        <article key={item.title} className="bg-white p-7">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                <CheckIcon />
                            </div>
                            <h3 className="mt-5 font-bold">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {item.copy}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function CallToAction() {
    return (
        <section className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="eyebrow">Ready to request</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight">
                        Make the next payment request clear from the start.
                    </h2>
                </div>
                <div className="flex shrink-0 gap-3">
                    <Link
                        href={route('login')}
                        className="secondary-marketing-button"
                    >
                        Log in
                    </Link>
                    <Link
                        href={route('register')}
                        className="primary-marketing-button"
                    >
                        Get started
                        <ArrowIcon />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export function MarketingFooter() {
    return (
        <footer className="border-t border-slate-200 bg-[#f6f7f9]">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <Brand compact />
                <span>
                    Multi-currency requests with traceable EUR conversion.
                </span>
            </div>
        </footer>
    );
}
