import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ currency }) {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        purpose: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('payment-requests.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="eyebrow">Employee request</p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                        New payment request
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Submit the local amount and business purpose for finance
                        review.
                    </p>
                </div>
            }
        >
            <Head title="New payment request" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="surface overflow-hidden">
                        <div className="border-b border-blue-100 bg-blue-50/70 px-6 py-5">
                            <p className="text-sm text-gray-600">
                                Amounts are submitted in your local currency,{' '}
                                <span className="font-semibold text-gray-900">
                                    {currency}
                                </span>
                                . We fetch the live EUR exchange rate and store
                                it permanently with the request.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6 p-6" noValidate>
                            <div>
                                <InputLabel htmlFor="amount" value={`Amount (${currency})`} />
                                <div className="relative mt-1">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">
                                        {currency}
                                    </span>
                                    <TextInput
                                        id="amount"
                                        type="number"
                                        inputMode="decimal"
                                        step="0.0001"
                                        min="0"
                                        name="amount"
                                        value={data.amount}
                                        className="block w-full pl-14"
                                        isFocused
                                        autoComplete="off"
                                        placeholder="0.00"
                                        onChange={(e) =>
                                            setData('amount', e.target.value)
                                        }
                                        aria-invalid={Boolean(errors.amount)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.amount} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="purpose" value="Purpose" />
                                <textarea
                                    id="purpose"
                                    name="purpose"
                                    value={data.purpose}
                                    rows={4}
                                    maxLength={2000}
                                    onChange={(e) =>
                                        setData('purpose', e.target.value)
                                    }
                                    aria-invalid={Boolean(errors.purpose)}
                                    required
                                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-none focus:border-blue-700 focus:ring-blue-700"
                                    placeholder="What is this payment for?"
                                />
                                <InputError message={errors.purpose} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                                <Link
                                    href={route('payment-requests.index')}
                                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Submitting…' : 'Submit request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
