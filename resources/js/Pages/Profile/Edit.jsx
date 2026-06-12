import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

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
                <div className="mx-auto max-w-2xl space-y-5 px-4 sm:px-6 lg:px-8">

                    {/* Identity card */}
                    <div className="surface p-5 sm:p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-700 text-base font-bold tracking-wide text-white ring-4 ring-blue-100 dark:ring-blue-900">
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-slate-950">
                                    {user.name}
                                </p>
                                <p className="truncate text-sm text-slate-500">
                                    {user.email}
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-800 ring-1 ring-inset ring-blue-200">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    {/* Profile information */}
                    <div className="surface overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                                    <svg className="h-4 w-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.25 1.25 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.125-2.095a1.25 1.25 0 0 0 .41-1.412A9.5 9.5 0 0 0 10 11a9.5 9.5 0 0 0-6.535 3.493Z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-950">Profile information</p>
                                    <p className="text-xs text-slate-500">Update your name and email address.</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-6 sm:px-8">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="surface overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                                    <svg className="h-4 w-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-950">Password</p>
                                    <p className="text-xs text-slate-500">Use a long, random password to stay secure.</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-6 sm:px-8">
                            <UpdatePasswordForm />
                        </div>
                    </div>

                    {/* Danger zone */}
                    <div className="surface overflow-hidden border-rose-200 dark:border-rose-900">
                        <div className="border-b border-rose-100 bg-rose-50/50 px-5 py-4 dark:border-rose-900 dark:bg-rose-950/40 sm:px-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/60">
                                    <svg className="h-4 w-4 text-rose-600 dark:text-rose-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Danger zone</p>
                                    <p className="text-xs text-rose-500 dark:text-rose-400">Irreversible and destructive actions.</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-6 sm:px-8">
                            <DeleteUserForm />
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
