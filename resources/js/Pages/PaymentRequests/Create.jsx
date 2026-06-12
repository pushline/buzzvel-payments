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
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    New payment request
                </h2>
            }
        >
            <Head title="New payment request" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-indigo-50/60 px-6 py-4">
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="What is this payment for?"
                                />
                                <InputError message={errors.purpose} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                                <Link
                                    href={route('payment-requests.index')}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
