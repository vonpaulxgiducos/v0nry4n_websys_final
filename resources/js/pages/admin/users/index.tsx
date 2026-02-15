import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

type UserRow = {
    id: number;
    username: string;
    name: string;
    email: string;
    user_type: 'customer' | 'seller' | 'super_admin';
    is_active: boolean;
    created_at: string;
};

export default function AdminUsers({ users }: { users: UserRow[] }) {
    return (
        <AppLayout>
            <Head title="Users" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Users
                    </h1>
                    <p className="text-sm text-slate-500">
                        All registered accounts from the database.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Username</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="text-slate-700">
                                        <td className="px-4 py-3 font-semibold text-slate-900">
                                            {user.username}
                                        </td>
                                        <td className="px-4 py-3">{user.name}</td>
                                        <td className="px-4 py-3">{user.email}</td>
                                        <td className="px-4 py-3 capitalize">
                                            {user.user_type.replace('_', ' ')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    user.is_active
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-200 text-slate-600'
                                                }`}
                                            >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td
                                            className="px-4 py-6 text-center text-sm text-slate-500"
                                            colSpan={6}
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
