import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ currencies = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        country_code: '',
        currency_code: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            action={{
                href: route('login'),
                label: 'Log in',
            }}
        >
            <Head title="Register" />
            <div className="mb-7">
                <p className="eyebrow">Employee access</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    Create your BuzzPay account
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your country and local currency determine how requests are
                    submitted.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="country_code" value="Country code" />

                    <TextInput
                        id="country_code"
                        name="country_code"
                        value={data.country_code}
                        className="mt-1 block w-full uppercase"
                        maxLength={2}
                        onChange={(e) => setData('country_code', e.target.value)}
                        required
                    />

                    <InputError message={errors.country_code} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="currency_code" value="Local currency" />

                    <SelectInput
                        id="currency_code"
                        name="currency_code"
                        value={data.currency_code}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('currency_code', e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select your currency
                        </option>
                        {currencies.map((code) => (
                            <option key={code} value={code}>
                                {code}
                            </option>
                        ))}
                    </SelectInput>

                    <InputError message={errors.currency_code} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href={route('login')}
                        className="text-sm font-semibold text-slate-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
