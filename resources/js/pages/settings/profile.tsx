import { Head, usePage } from '@inertiajs/react';
import DeleteUser from '@/components/delete-user';
import ProfileInformationForm from '@/components/profile-information-form';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile() {
    const page = usePage<SharedData>();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <SettingsLayout>
                <div className="space-y-12">
                    <ProfileInformationForm
                        profileData={page.props.profileData}
                        userType={page.props.userType}
                    />

                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
