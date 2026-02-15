import { Form, Head } from '@inertiajs/react';
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

const roles: { id: RoleId; label: string }[] = [
    { id: 'customer', label: 'Customer' },
    { id: 'seller', label: 'Seller' },
    { id: 'super_admin', label: 'Super Admin' },
];

export default function Register() {
    const [activeRole, setActiveRole] = useState<RoleId>('customer');

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
                        <input type="hidden" name="user_type" value={activeRole} />
                        <div className="grid gap-6">
                            <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-500">
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setActiveRole(role.id)}
                                        className={`flex-1 rounded-full px-3 py-2 transition ${
                                            activeRole === role.id
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'hover:text-slate-700'
                                        }`}
                                    >
                                        {role.label}
                                    </button>
                                ))}
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

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={4}
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
                                    tabIndex={5}
                                    required={activeRole === 'seller'}
                                    autoComplete="tel"
                                    name="phone"
                                    placeholder="Phone number"
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
                                        tabIndex={6}
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
                                            tabIndex={7}
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
                                            tabIndex={8}
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
                                            tabIndex={9}
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
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={10}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={11}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={12}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={13}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
