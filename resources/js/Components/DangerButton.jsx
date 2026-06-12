export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 focus-visible:ring-offset-2 ${
                    disabled && 'cursor-not-allowed opacity-50'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
