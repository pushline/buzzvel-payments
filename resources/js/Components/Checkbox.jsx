export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-300 bg-white text-blue-700 shadow-none checked:bg-blue-700 hover:checked:bg-blue-700 focus:checked:bg-blue-700 focus:ring-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:checked:bg-blue-700 dark:hover:checked:bg-blue-700 dark:focus:checked:bg-blue-700 ' +
                className
            }
        />
    );
}
