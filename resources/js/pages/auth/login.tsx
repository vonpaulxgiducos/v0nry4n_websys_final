import { Form, Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

const rememberedEmailKey = (role: 'customer' | 'seller' | 'super_admin') =>
    `tunely.remembered_login_email.${role}`;

const roleSelectStyles = {
    customer: 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-400 focus:ring-indigo-200',
    seller: 'border-blue-500 bg-blue-600 text-white focus:border-blue-300 focus:ring-blue-200',
    super_admin:
        'border-slate-700 bg-slate-900 text-white focus:border-slate-400 focus:ring-slate-300',
} as const;

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

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [rememberEmail, setRememberEmail] = useState(false);
    const [activeRole, setActiveRole] = useState<'customer' | 'seller' | 'super_admin'>(
        'customer',
    );

    useEffect(() => {
        const rememberedEmail = window.localStorage.getItem(
            rememberedEmailKey(activeRole),
        ) ?? '';

        setEmail(rememberedEmail);
        setRememberEmail(Boolean(rememberedEmail));
    }, [activeRole]);

    const handleSubmitCapture = () => {
        if (rememberEmail && email.trim()) {
            window.localStorage.setItem(rememberedEmailKey(activeRole), email.trim());

            return;
        }

        window.localStorage.removeItem(rememberedEmailKey(activeRole));
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your username or email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                onSubmitCapture={handleSubmitCapture}
                autoComplete="off"
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="user_type">Role</Label>
                                <select
                                    id="user_type"
                                    name="user_type"
                                    value={activeRole}
                                    onChange={(event) =>
                                        setActiveRole(
                                            event.target.value as
                                                | 'customer'
                                                | 'seller'
                                                | 'super_admin',
                                        )
                                    }
                                    className={`h-11 rounded-xl border px-4 text-sm focus:outline-none focus:ring-2 ${
                                        roleSelectStyles[activeRole]
                                    } transition-colors duration-300 ease-in-out`}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="seller">Seller</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                                <InputError message={errors.user_type} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Username or email</Label>
                                <Input
                                    id="email"
                                    type="text"
                                    name="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="off"
                                    placeholder="Enter username or email"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="off"
                                        placeholder="Password"
                                        className="pr-20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <span className="sr-only">
                                            {showPassword ? 'Hide password' : 'Show password'}
                                        </span>
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    value="1"
                                    checked={rememberEmail}
                                    onChange={(event) =>
                                        setRememberEmail(event.target.checked)
                                    }
                                    tabIndex={3}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
