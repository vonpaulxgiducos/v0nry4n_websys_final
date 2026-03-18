import { Form, Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import InputError from '@/components/input-error';
import { store as loginStore } from '@/routes/login';
import { store as registerStore } from '@/routes/register';

type RoleId = 'customer' | 'seller' | 'super_admin';

type RoleInfo = {
    id: RoleId;
    label: string;
    tagline: string;
};

const roles: RoleInfo[] = [
    {
        id: 'customer',
        label: 'Customer',
        tagline: 'Shops for instruments and tracks orders.',
    },
    {
        id: 'seller',
        label: 'Seller',
        tagline: 'Manages listings and store inventory.',
    },
    {
        id: 'super_admin',
        label: 'Super Admin',
        tagline: 'Oversees the entire marketplace.',
    },
];

const activeRoleButtonStyles: Record<RoleId, string> = {
    customer: 'bg-white text-slate-900 shadow-sm',
    seller: 'bg-blue-600 text-white shadow-sm',
    super_admin: 'bg-slate-900 text-white shadow-sm',
};

const roleSelectorStyles: Record<RoleId, string> = {
    customer: 'bg-slate-100',
    seller: 'bg-blue-100/80',
    super_admin: 'bg-slate-200/80',
};

const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 4) {
        return digits;
    }

    if (digits.length <= 7) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

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

export default function Welcome() {
    const pageProps = usePage<{ status?: string; csrf_token?: string }>().props;
    const status = pageProps.status;
    const csrfTokenFromMeta = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    const csrfToken = pageProps.csrf_token ?? csrfTokenFromMeta ?? '';
    const [activeRole, setActiveRole] = useState<RoleId>('customer');
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [phone, setPhone] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterPasswordConfirmation, setShowRegisterPasswordConfirmation] =
        useState(false);

    const activeRoleInfo = useMemo(
        () => roles.find((role) => role.id === activeRole) ?? roles[0],
        [activeRole],
    );

    return (
        <>
            <Head title="Sign In" />
            <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(1200px_circle_at_12%_10%,#eef2ff,transparent_60%),radial-gradient(900px_circle_at_88%_18%,#e7efff,transparent_55%),linear-gradient(180deg,#f7f9ff_0%,#eef2ff_55%,#e8eefb_100%)] px-6 py-10 text-slate-900">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl" />
                    <div className="absolute right-0 top-32 h-56 w-56 rounded-full bg-indigo-200/50 blur-3xl" />
                    <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
                </div>

                <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col items-center justify-center gap-10">
                    <header className="text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 text-white shadow-[0_20px_40px_-20px_rgba(30,64,175,0.8)]">
                            <svg
                                viewBox="0 0 24 24"
                                className="h-7 w-7"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 18V5l10-2v13" />
                                <circle cx="6" cy="18" r="3" />
                                <circle cx="16" cy="16" r="3" />
                            </svg>
                        </div>
                        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 [font-family:'Space_Grotesk',sans-serif]">
                            Tunely Music Store
                        </h1>
                        <p className="mt-1 text-sm uppercase tracking-[0.2em] text-slate-500">
                            E-Commerce System
                        </p>
                    </header>

                    <main className="w-full max-w-2xl">
                        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur">
                            <div className="flex flex-col gap-6">
                                <div>
                                    <div className="mb-4 inline-flex rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-500 transition-colors duration-300 ease-in-out">
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode('login')}
                                            className={`rounded-full px-4 py-2 transition-all duration-300 ease-in-out ${
                                                authMode === 'login'
                                                    ? 'bg-white text-slate-900 shadow-sm'
                                                    : 'hover:text-slate-700'
                                            }`}
                                        >
                                            Log in
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode('register')}
                                            className={`rounded-full px-4 py-2 transition-all duration-300 ease-in-out ${
                                                authMode === 'register'
                                                    ? 'bg-amber-400 text-white shadow-sm'
                                                    : 'hover:text-slate-700'
                                            }`}
                                        >
                                            Register
                                        </button>
                                    </div>
                                    <h2 className="text-xl font-semibold text-slate-900 [font-family:'Space_Grotesk',sans-serif]">
                                        {authMode === 'login'
                                            ? 'Welcome back'
                                            : 'Create your account as'}
                                    </h2>
                                    <div
                                        className={`mt-4 flex items-center gap-2 rounded-full p-1 ${
                                            roleSelectorStyles[activeRole]
                                        } transition-colors duration-300 ease-in-out`}
                                    >
                                        {roles.map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setActiveRole(role.id)}
                                                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out ${
                                                    activeRole === role.id
                                                        ? activeRoleButtonStyles[role.id]
                                                        : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                {role.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {authMode === 'login'
                                            ? 'Sign in to manage your musical store journey.'
                                            : 'Enter your details to get started.'}
                                    </p>
                                    {status && (
                                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                            {status}
                                        </div>
                                    )}
                                </div>

                                {authMode === 'login' ? (
                                    <Form
                                        {...loginStore.form()}
                                        resetOnSuccess={['password']}
                                        autoComplete="off"
                                        className="grid gap-4"
                                    >
                                        {({ processing, errors }) => (
                                            <div
                                                key={activeRoleInfo.id}
                                                className="grid gap-4"
                                            >
                                                <input type="hidden" name="_token" value={csrfToken} />
                                                <input
                                                    type="hidden"
                                                    name="user_type"
                                                    value={activeRole}
                                                />
                                                {errors.user_type && (
                                                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                                                        Choose your role correctly. You may have entered an account that is not on the corresponding role.
                                                    </div>
                                                )}
                                                {!errors.user_type &&
                                                    (errors.email || errors.password) && (
                                                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                                                            Invalid username/email or password. Please try again.
                                                        </div>
                                                    )}
                                                <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                    Username or email
                                                    <input
                                                        type="text"
                                                        name="email"
                                                        required
                                                        autoComplete="off"
                                                        placeholder="Username or email"
                                                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                    />
                                                    <InputError message={errors.email} />
                                                </label>
                                                <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                    Password
                                                    <div className="relative">
                                                        <input
                                                            type={
                                                                showLoginPassword
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            name="password"
                                                            required
                                                            autoComplete="off"
                                                            placeholder="Password"
                                                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowLoginPassword(
                                                                    (prev) =>
                                                                        !prev,
                                                                )
                                                            }
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                                                            aria-label={
                                                                showLoginPassword
                                                                    ? 'Hide password'
                                                                    : 'Show password'
                                                            }
                                                        >
                                                            <span className="sr-only">
                                                                {showLoginPassword
                                                                    ? 'Hide password'
                                                                    : 'Show password'}
                                                            </span>
                                                            {showLoginPassword ? (
                                                                <EyeOffIcon />
                                                            ) : (
                                                                <EyeIcon />
                                                            )}
                                                        </button>
                                                    </div>
                                                </label>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="mt-2 h-11 rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-[0_18px_30px_-18px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 hover:bg-slate-900"
                                                >
                                                    Sign In
                                                </button>
                                            </div>
                                        )}
                                    </Form>
                                ) : (
                                    <Form
                                        {...registerStore.form()}
                                        resetOnSuccess={['password', 'password_confirmation']}
                                        className="grid gap-4"
                                    >
                                        {({ processing, errors }) => (
                                            <div
                                                key={activeRole}
                                                className="grid gap-4"
                                            >
                                                <input type="hidden" name="_token" value={csrfToken} />
                                                <input
                                                    type="hidden"
                                                    name="user_type"
                                                    value={activeRole}
                                                />
                                                <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                    Username
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        required
                                                        autoComplete="username"
                                                        placeholder="Choose a username"
                                                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                    />
                                                    <InputError message={errors.username} />
                                                </label>

                                                {(activeRole === 'customer' ||
                                                    activeRole === 'super_admin') && (
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                            First name
                                                            <input
                                                                type="text"
                                                                name="first_name"
                                                                required
                                                                autoComplete="given-name"
                                                                placeholder="First name"
                                                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.first_name
                                                                }
                                                            />
                                                        </label>
                                                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                            Last name
                                                            <input
                                                                type="text"
                                                                name="last_name"
                                                                required
                                                                autoComplete="family-name"
                                                                placeholder="Last name"
                                                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.last_name
                                                                }
                                                            />
                                                        </label>
                                                    </div>
                                                )}

                                                {activeRole === 'seller' && (
                                                    <>
                                                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                            Business name
                                                            <input
                                                                type="text"
                                                                name="business_name"
                                                                required
                                                                placeholder="Your business name"
                                                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.business_name
                                                                }
                                                            />
                                                        </label>
                                                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                            Owner name
                                                            <input
                                                                type="text"
                                                                name="owner_name"
                                                                required
                                                                placeholder="Owner name"
                                                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.owner_name
                                                                }
                                                            />
                                                        </label>
                                                    </>
                                                )}

                                                <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                    Email address
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        required
                                                        autoComplete="email"
                                                        placeholder="Enter your email"
                                                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                    />
                                                    <InputError message={errors.email} />
                                                </label>

                                                <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                    Phone number
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        required={activeRole === 'seller'}
                                                        autoComplete="tel"
                                                        placeholder="09XX XXX XXXX"
                                                        inputMode="numeric"
                                                        maxLength={13}
                                                        value={phone}
                                                        onChange={(event) =>
                                                            setPhone(
                                                                formatPhoneNumber(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                    />
                                                    <InputError message={errors.phone} />
                                                </label>

                                                {(activeRole === 'customer' ||
                                                    activeRole === 'seller') && (
                                                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                        Address
                                                        <input
                                                            type="text"
                                                            name="address"
                                                            required={activeRole === 'seller'}
                                                            autoComplete="street-address"
                                                            placeholder="Street address"
                                                            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.address
                                                            }
                                                        />
                                                    </label>
                                                )}

                                                {activeRole === 'customer' && (
                                                    <div className="grid gap-4 sm:grid-cols-3">
                                                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                            City
                                                            <input
                                                                type="text"
                                                                name="city"
                                                                autoComplete="address-level2"
                                                                placeholder="City"
                                                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.city
                                                                }
                                                            />
                                                        </label>
                                                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                            Province
                                                            <input
                                                                type="text"
                                                                name="province"
                                                                autoComplete="address-level1"
                                                                placeholder="Province"
                                                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.province
                                                                }
                                                            />
                                                        </label>
                                                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                            Postal code
                                                            <input
                                                                type="text"
                                                                name="postal_code"
                                                                autoComplete="postal-code"
                                                                placeholder="Postal code"
                                                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.postal_code
                                                                }
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                                <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                    Password
                                                    <div className="relative">
                                                        <input
                                                            type={
                                                                showRegisterPassword
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            name="password"
                                                            required
                                                            autoComplete="new-password"
                                                            placeholder="Create a password"
                                                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowRegisterPassword(
                                                                    (prev) =>
                                                                        !prev,
                                                                )
                                                            }
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                                                            aria-label={
                                                                showRegisterPassword
                                                                    ? 'Hide password'
                                                                    : 'Show password'
                                                            }
                                                        >
                                                            <span className="sr-only">
                                                                {showRegisterPassword
                                                                    ? 'Hide password'
                                                                    : 'Show password'}
                                                            </span>
                                                            {showRegisterPassword ? (
                                                                <EyeOffIcon />
                                                            ) : (
                                                                <EyeIcon />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <InputError message={errors.password} />
                                                </label>
                                                <label className="grid gap-2 text-sm font-medium text-slate-700">
                                                    Confirm password
                                                    <div className="relative">
                                                        <input
                                                            type={
                                                                showRegisterPasswordConfirmation
                                                                    ? 'text'
                                                                    : 'password'
                                                            }
                                                            name="password_confirmation"
                                                            required
                                                            autoComplete="new-password"
                                                            placeholder="Confirm your password"
                                                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowRegisterPasswordConfirmation(
                                                                    (prev) =>
                                                                        !prev,
                                                                )
                                                            }
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                                                            aria-label={
                                                                showRegisterPasswordConfirmation
                                                                    ? 'Hide confirmation password'
                                                                    : 'Show confirmation password'
                                                            }
                                                        >
                                                            <span className="sr-only">
                                                                {showRegisterPasswordConfirmation
                                                                    ? 'Hide confirmation password'
                                                                    : 'Show confirmation password'}
                                                            </span>
                                                            {showRegisterPasswordConfirmation ? (
                                                                <EyeOffIcon />
                                                            ) : (
                                                                <EyeIcon />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <InputError
                                                        message={
                                                            errors.password_confirmation
                                                        }
                                                    />
                                                </label>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="mt-2 h-11 rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-[0_18px_30px_-18px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 hover:bg-slate-900"
                                                >
                                                    Create account
                                                </button>
                                            </div>
                                        )}
                                    </Form>
                                )}

                                <div className="border-t border-slate-200 pt-5">
                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-900">
                                                Login as {activeRoleInfo.label}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {activeRoleInfo.tagline}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <p className="mt-6 text-center text-xs text-slate-500">
                            © 2026 Tunely Music Store and Services.
                            <span className="block text-[11px] text-slate-400">
                                All Rights Reserved. 
                            </span>
                        </p>
                    </main>
                </div>
            </div>
        </>
    );
}
