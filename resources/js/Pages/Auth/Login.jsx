import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            action={{
                href: route('register'),
                label: 'Get started',
            }}
        >
            <Head title="Log in" />
            <div className="mb-7">
                <p className="eyebrow">Welcome back</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    Log in to BuzzPay
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Access your payment requests and review queue.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-semibold text-slate-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>

            <p className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
                Don't have an account?{' '}
                <Link
                    href={route('register')}
                    className="font-semibold text-blue-700 hover:text-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                >
                    Click here
                </Link>
            </p>
        </GuestLayout>
    );
}
