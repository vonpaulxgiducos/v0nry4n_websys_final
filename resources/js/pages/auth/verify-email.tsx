// Components
import { Form, Head, router, usePage } from '@inertiajs/react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { send } from '@/routes/verification';
import { type SharedData } from '@/types';

export default function VerifyEmail({ status }: { status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const handleLogout = () => {
        router.post(
            '/logout',
            { user_type: auth.user.user_type },
            {
                onSuccess: () => {
                    router.visit('/login');
                },
            },
        );
    };

    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            Resend verification email
                        </Button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mx-auto block text-sm text-slate-700 underline-offset-4 hover:underline"
                        >
                            Log out
                        </button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
