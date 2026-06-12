import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start rounded-lg px-3 py-2.5 ${
                active
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${className}`}
        >
            {children}
        </Link>
    );
}
