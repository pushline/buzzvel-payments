import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ action, children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                    >
                        <ApplicationLogo className="h-9 w-9 text-blue-700" />
                        <span className="font-bold tracking-tight text-slate-950">
                            BuzzPay
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                        >
                            Back to home
                        </Link>
                        {action && (
                            <Link href={action.href} className="dark-button">
                                {action.label}
                            </Link>
                        )}
                    </div>
                </div>
            </header>
            <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-2">
                <div className="hidden max-w-lg lg:block">
                    <p className="eyebrow">Secure payment workflow</p>
                    <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-950">
                        Keep every currency conversion and decision in view.
                    </h1>
                    <p className="mt-5 text-base leading-7 text-slate-600">
                        BuzzPay gives employees a direct request flow and
                        finance a clear, auditable review queue.
                    </p>
                </div>
                <div className="surface mx-auto w-full max-w-md p-6 sm:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
