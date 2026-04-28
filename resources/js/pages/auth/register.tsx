import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

type RoleId = 'customer' | 'seller' | 'super_admin';

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

export default function Register() {
    const pageProps = usePage<{ csrf_token?: string }>().props;
    const csrfTokenFromMeta = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    const csrfToken = pageProps.csrf_token ?? csrfTokenFromMeta ?? '';
    const [activeRole, setActiveRole] = useState<RoleId>('customer');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="_token" value={csrfToken} />
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="user_type">Role</Label>
                                <select
                                    id="user_type"
                                    name="user_type"
                                    value={activeRole}
                                    onChange={(event) =>
                                        setActiveRole(
                                            event.target.value as RoleId
                                        )
                                    }
                                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors duration-300 ease-in-out"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="seller">Seller</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                                <InputError message={errors.user_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    name="username"
                                    placeholder="Choose a username"
                                />
                                <InputError message={errors.username} />
                            </div>

                            {(activeRole === 'customer' ||
                                activeRole === 'super_admin') && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name">
                                            First name
                                        </Label>
                                        <Input
                                            id="first_name"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            autoComplete="given-name"
                                            name="first_name"
                                            placeholder="First name"
                                        />
                                        <InputError message={errors.first_name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">
                                            Last name
                                        </Label>
                                        <Input
                                            id="last_name"
                                            type="text"
                                            required
                                            tabIndex={3}
                                            autoComplete="family-name"
                                            name="last_name"
                                            placeholder="Last name"
                                        />
                                        <InputError message={errors.last_name} />
                                    </div>
                                </div>
                            )}

                            {activeRole === 'seller' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="business_name">
                                            Business name
                                        </Label>
                                        <Input
                                            id="business_name"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            name="business_name"
                                            placeholder="Your business name"
                                        />
                                        <InputError
                                            message={errors.business_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="owner_name">
                                            Owner name
                                        </Label>
                                        <Input
                                            id="owner_name"
                                            type="text"
                                            required
                                            tabIndex={3}
                                            name="owner_name"
                                            placeholder="Owner name"
                                        />
                                        <InputError message={errors.owner_name} />
                                    </div>
                                </>
                            )}

                            {activeRole === 'super_admin' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="registration_passkey">
                                        Registration Passkey (Required)
                                    </Label>
                                    <Input
                                        id="registration_passkey"
                                        type="text"
                                        required
                                        tabIndex={4}
                                        name="registration_passkey"
                                        maxLength={24}
                                        placeholder="Enter passkey from existing admin"
                                    />
                                    <InputError message={errors.registration_passkey} />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={5}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone number</Label>
                                <Input
                                    id="phone"
                                    type="text"
                                    tabIndex={6}
                                    required={activeRole === 'seller'}
                                    autoComplete="tel"
                                    name="phone"
                                    placeholder="09XX XXX XXXX"
                                    inputMode="numeric"
                                    maxLength={13}
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(
                                            formatPhoneNumber(event.target.value),
                                        )
                                    }
                                />
                                <InputError message={errors.phone} />
                            </div>

                            {(activeRole === 'customer' ||
                                activeRole === 'seller') && (
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        tabIndex={7}
                                        required={activeRole === 'seller'}
                                        autoComplete="street-address"
                                        name="address"
                                        placeholder="Street address"
                                    />
                                    <InputError message={errors.address} />
                                </div>
                            )}

                            {activeRole === 'customer' && (
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            tabIndex={8}
                                            autoComplete="address-level2"
                                            name="city"
                                            placeholder="City"
                                        />
                                        <InputError message={errors.city} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="province">
                                            Province
                                        </Label>
                                        <Input
                                            id="province"
                                            type="text"
                                            tabIndex={9}
                                            autoComplete="address-level1"
                                            name="province"
                                            placeholder="Province"
                                        />
                                        <InputError message={errors.province} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="postal_code">
                                            Postal code
                                        </Label>
                                        <Input
                                            id="postal_code"
                                            type="text"
                                            tabIndex={10}
                                            autoComplete="postal-code"
                                            name="postal_code"
                                            placeholder="Postal code"
                                        />
                                        <InputError
                                            message={errors.postal_code}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={11}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                        className="pr-20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <span className="sr-only">
                                            {showPassword ? 'Hide password' : 'Show password'}
                                        </span>
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={
                                            showPasswordConfirmation
                                                ? 'text'
                                                : 'password'
                                        }
                                        required
                                        tabIndex={12}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm password"
                                        className="pr-20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswordConfirmation(
                                                (prev) => !prev,
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900"
                                        aria-label={
                                            showPasswordConfirmation
                                                ? 'Hide confirmation password'
                                                : 'Show confirmation password'
                                        }
                                    >
                                        <span className="sr-only">
                                            {showPasswordConfirmation
                                                ? 'Hide confirmation password'
                                                : 'Show confirmation password'}
                                        </span>
                                        {showPasswordConfirmation ? (
                                            <EyeOffIcon />
                                        ) : (
                                            <EyeIcon />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={13}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={14}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
