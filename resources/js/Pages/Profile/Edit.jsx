import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="eyebrow">Account settings</p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                        Profile
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Manage your account details and security.
                    </p>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="surface p-5 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="surface p-5 sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="surface border-rose-200 p-5 sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
