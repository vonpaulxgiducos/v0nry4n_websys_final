import { Transition } from '@headlessui/react';
import { Form } from '@inertiajs/react';

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

export default function ProfileInformationForm({
    profileData,
    userType,
}: ProfileInformationFormProps) {
    const currentProfileData = profileData ?? {};

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
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}