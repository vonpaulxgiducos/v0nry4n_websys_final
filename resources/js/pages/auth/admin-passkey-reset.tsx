import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';

function EyeIcon({ className = 'h-4 w-4' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon({ className = 'h-4 w-4' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M3 3l18 18" />
            <path d="M10.8 10.8a3 3 0 0 0 4.24 4.24" />
            <path d="M9.88 4.24A10.74 10.74 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-4.17 5.37" />
            <path d="M6.63 6.63A17.58 17.58 0 0 0 2 12s3.5 8 10 8a10.7 10.7 0 0 0 5.37-1.46" />
        </svg>
    );
}

export default function AdminPasskeyReset({ status }: { status?: string }) {
    const [showPasskey, setShowPasskey] = useState(false);

    return (
        <AuthLayout
            title="Admin password reset"
            description="Admin-only reset: enter a new password and an existing admin passkey"
        >
            <Head title="Admin password reset" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form action="/admin/forgot-password" method="post">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="login">Admin username or email</Label>
                                <Input
                                    id="login"
                                    type="text"
                                    name="login"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="Enter username or email"
                                />
                                <InputError message={errors.login} />
                            </div>

                            <div className="mt-4 grid gap-2">
                                <Label htmlFor="password">New password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    autoComplete="new-password"
                                    placeholder="Enter new password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="mt-4 grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm new password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <div className="mt-4 rounded-2xl border border-amber-400/80 bg-amber-100/10 px-4 py-4">
                                <p className="text-sm font-semibold text-amber-600 dark:text-amber-300">
                                    Registration Passkey
                                </p>
                                <label className="mt-2 grid gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                                    Passkey (Required)
                                    <div className="relative">
                                        <input
                                            id="passkey"
                                            type={showPasskey ? 'text' : 'password'}
                                            name="passkey"
                                            required
                                            autoComplete="off"
                                            maxLength={24}
                                            placeholder="Enter passkey from existing user"
                                            className="h-11 w-full rounded-xl border border-amber-400/40 bg-white dark:bg-slate-900/40 px-4 pr-20 text-sm text-slate-900 dark:text-slate-100 shadow-inner placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasskey((prev) => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
                                            aria-label={showPasskey ? 'Hide passkey' : 'Show passkey'}
                                        >
                                            <span className="sr-only">
                                                {showPasskey ? 'Hide passkey' : 'Show passkey'}
                                            </span>
                                            {showPasskey ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                        Use a valid registration passkey from an existing admin account.
                                    </p>
                                    <InputError message={errors.passkey} />
                                </label>
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button className="w-full" disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Reset password using passkey
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <TextLink href={login()}>log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
