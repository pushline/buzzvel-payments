import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex h-full items-center border-b-2 px-1 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ' +
                (active
                    ? 'border-blue-700 text-slate-950'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900') +
                className
            }
        >
            {children}
        </Link>
    );
}
