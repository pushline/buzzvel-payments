export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-300 text-blue-700 shadow-none focus:ring-blue-700 ' +
                className
            }
        />
    );
}
