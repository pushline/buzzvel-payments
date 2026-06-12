import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import FlashMessages from '@/Components/FlashMessages';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const isFinance = user.role === 'finance';
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="flex h-[68px] items-center justify-between">
                        <div className="flex h-full items-center gap-8">
                            <Link
                                href="/"
                                className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                            >
                                <ApplicationLogo className="h-9 w-9 text-blue-700" />
                                <span className="font-bold tracking-[-0.02em] text-slate-950">BuzzPay</span>
                            </Link>
                            <div className="hidden h-full items-center gap-7 sm:flex">
                                <NavLink
                                    href={route('payment-requests.index')}
                                    active={route().current(
                                        'payment-requests.index',
                                    )}
                                >
                                    {isFinance ? 'Review queue' : 'My requests'}
                                </NavLink>
                                {!isFinance && (
                                    <NavLink
                                        href={route('payment-requests.create')}
                                        active={route().current(
                                            'payment-requests.create',
                                        )}
                                    >
                                        New request
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden items-center gap-2 sm:flex">
                            <ThemeToggle />
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-800 ring-1 ring-inset ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800">
                                {user.role}
                            </span>
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                                    >
                                        {user.name}
                                        <svg
                                            className="h-4 w-4 text-slate-400"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('payment-requests.index')}>
                                        {isFinance
                                            ? 'Review queue'
                                            : 'Payment requests'}
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">Log out</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <div className="flex items-center gap-1 sm:hidden">
                            <ThemeToggle className="[&_span]:hidden" />
                            <button
                                type="button"
                                onClick={() => setOpen(!open)}
                                aria-expanded={open}
                                aria-label="Toggle navigation"
                                className="rounded-lg p-2.5 text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                            >
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        d={
                                            open
                                                ? 'M6 6l12 12M18 6 6 18'
                                                : 'M4 7h16M4 12h16M4 17h16'
                                        }
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                {open && (
                    <div className="border-t border-slate-200 bg-white pb-3 dark:border-slate-800 dark:bg-slate-900 sm:hidden">
                        <div className="space-y-1 px-3 py-3">
                            <ResponsiveNavLink
                                href={route('payment-requests.index')}
                                active={route().current(
                                    'payment-requests.index',
                                )}
                            >
                                {isFinance ? 'Review queue' : 'My requests'}
                            </ResponsiveNavLink>
                            {!isFinance && (
                                <ResponsiveNavLink
                                    href={route('payment-requests.create')}
                                    active={route().current(
                                        'payment-requests.create',
                                    )}
                                >
                                    New request
                                </ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log out</ResponsiveNavLink>
                        </div>
                        <div className="border-t border-slate-100 px-4 pt-3 text-sm">
                            <p className="font-semibold text-slate-900">
                                {user.name}
                            </p>
                            <p className="text-slate-500">{user.email}</p>
                        </div>
                    </div>
                )}
            </nav>

            {header && (
                <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}
            <FlashMessages />
            <main>{children}</main>
        </div>
    );
}
