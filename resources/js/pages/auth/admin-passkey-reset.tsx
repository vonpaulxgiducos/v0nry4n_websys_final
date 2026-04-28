import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';

export default function AdminPasskeyReset({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Admin password reset"
            description="Use your admin account and passkey to set a new password"
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
                                <Label htmlFor="passkey">Passkey (Required)</Label>
                                <Input
                                    id="passkey"
                                    type="text"
                                    name="passkey"
                                    autoComplete="off"
                                    maxLength={24}
                                    placeholder="Enter passkey from existing admin user"
                                />
                                <InputError message={errors.passkey} />
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
