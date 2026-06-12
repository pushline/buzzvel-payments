import { forwardRef } from 'react';

export default forwardRef(function SelectInput(
    { className = '', children, ...props },
    ref,
) {
    return (
        <select
            {...props}
            ref={ref}
            className={
                'rounded-lg border-slate-300 bg-white text-slate-950 shadow-none focus:border-blue-700 focus:ring-blue-700 ' +
                className
            }
        >
            {children}
        </select>
    );
});
