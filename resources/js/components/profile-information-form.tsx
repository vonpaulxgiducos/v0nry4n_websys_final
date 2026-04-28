import { Transition } from '@headlessui/react';
import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type ProfileData, type UserType } from '@/types';

interface ProfileInformationFormProps {
    profileData?: ProfileData | null;
    userType?: UserType | null;
}

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

function CycleIcon({ className = 'h-4 w-4' }: { className?: string }) {
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
            <path d="M21 12a9 9 0 0 0-15.5-6.36L3 8" />
            <path d="M3 4v4h4" />
            <path d="M3 12a9 9 0 0 0 15.5 6.36L21 16" />
            <path d="M21 20v-4h-4" />
        </svg>
    );
}

export default function ProfileInformationForm({
    profileData,
    userType,
}: ProfileInformationFormProps) {
    const currentProfileData = profileData ?? {};
    const [showPasskey, setShowPasskey] = useState(false);
    const [registrationPasskey, setRegistrationPasskey] = useState(
        currentProfileData.registration_passkey ?? '',
    );

    useEffect(() => {
        setRegistrationPasskey(currentProfileData.registration_passkey ?? '');
    }, [currentProfileData.registration_passkey]);

    const generateRegistrationPasskey = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const randomValues = crypto.getRandomValues(new Uint8Array(24));

        return Array.from(randomValues, (value) => characters[value % characters.length]).join('');
    };

    return (
        <div className="space-y-6">
            <HeadingSmall
                title="Profile information"
                description="Update your account details"
            />

            <Form
                {...ProfileController.update.form()}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ errors, processing, recentlySuccessful }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                defaultValue={currentProfileData.username ?? ''}
                                autoComplete="username"
                                placeholder="Username"
                            />
                            <InputError message={errors.username} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={currentProfileData.email ?? ''}
                                autoComplete="email"
                                placeholder="Email address"
                            />
                            <InputError message={errors.email} />
                        </div>

                        {userType === 'customer' && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="customer_name">Customer name</Label>
                                    <Input
                                        id="customer_name"
                                        name="customer_name"
                                        defaultValue={currentProfileData.customer_name ?? currentProfileData.name ?? ''}
                                        placeholder="Customer name"
                                    />
                                    <InputError message={errors.customer_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={currentProfileData.phone ?? ''}
                                        placeholder="Phone number"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        defaultValue={currentProfileData.address ?? ''}
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        placeholder="Address"
                                    />
                                    <InputError message={errors.address} />
                                </div>
                            </>
                        )}

                        {userType === 'seller' && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="owner_name">Owner name</Label>
                                    <Input
                                        id="owner_name"
                                        name="owner_name"
                                        defaultValue={currentProfileData.owner_name ?? currentProfileData.name ?? ''}
                                        placeholder="Owner name"
                                    />
                                    <InputError message={errors.owner_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="business_name">Business name</Label>
                                    <Input
                                        id="business_name"
                                        name="business_name"
                                        defaultValue={currentProfileData.business_name ?? ''}
                                        placeholder="Business name"
                                    />
                                    <InputError message={errors.business_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={currentProfileData.phone ?? ''}
                                        placeholder="Phone number"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        defaultValue={currentProfileData.address ?? ''}
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        placeholder="Business address"
                                    />
                                    <InputError message={errors.address} />
                                </div>
                            </>
                        )}

                        {userType === 'super_admin' && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={currentProfileData.name ?? ''}
                                        placeholder="Name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={currentProfileData.phone ?? ''}
                                        placeholder="Phone number"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="rounded-2xl border border-amber-400/80 bg-amber-100/10 px-4 py-4">
                                    <p className="text-sm font-semibold text-amber-300">
                                        Registration Passkey
                                    </p>
                                    <label className="mt-3 grid gap-2 text-xs font-medium text-slate-200">
                                        Passkey (Required)
                                        <div className="relative">
                                            <Input
                                                id="registration_passkey"
                                                name="registration_passkey"
                                                type={showPasskey ? 'text' : 'password'}
                                                autoComplete="off"
                                                maxLength={24}
                                                value={registrationPasskey}
                                                onChange={(event) =>
                                                    setRegistrationPasskey(event.target.value.toUpperCase())
                                                }
                                                placeholder="Enter passkey from existing user"
                                                className="h-11 border-amber-400/40 bg-slate-900/40 pr-32 text-sm text-slate-100 placeholder:text-slate-400 focus-visible:border-amber-300 focus-visible:ring-amber-300/40"
                                            />
                                            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setRegistrationPasskey(generateRegistrationPasskey())}
                                                    className="rounded-md border border-amber-400/40 px-2 py-1 text-slate-300 hover:border-amber-300 hover:text-white"
                                                    aria-label="Regenerate passkey"
                                                >
                                                    <CycleIcon />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasskey((prev) => !prev)}
                                                    className="text-slate-300 hover:text-white"
                                                    aria-label={showPasskey ? 'Hide passkey' : 'Show passkey'}
                                                >
                                                    <span className="sr-only">{showPasskey ? 'Hide passkey' : 'Show passkey'}</span>
                                                    {showPasskey ? <EyeOffIcon /> : <EyeIcon />}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-normal text-slate-400">
                                            This passkey is used for admin registration and admin password recovery.
                                        </p>
                                        <InputError message={errors.registration_passkey} />
                                    </label>
                                </div>
                            </>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save changes</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-emerald-400">Saved</p>
                            </Transition>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}