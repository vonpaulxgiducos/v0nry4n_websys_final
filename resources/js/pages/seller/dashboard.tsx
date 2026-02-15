import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { type SharedData } from '@/types';

type SectionId = 'dashboard' | 'products' | 'orders';

type SellerProduct = {
    id: string;
    name: string;
    stock: number;
    price: number;
    status: 'approved' | 'pending';
};

type SellerOrder = {
    id: string;
    customer: string;
    total: number;
    status: 'delivered' | 'shipped' | 'pending';
};

const statusStyles: Record<string, string> = {
    delivered: 'bg-emerald-100 text-emerald-700',
    shipped: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
};

const navItems: { id: SectionId; label: string; icon: JSX.Element }[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: (
            <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        id: 'products',
        label: 'My Products',
        icon: (
            <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
            </svg>
        ),
    },
    {
        id: 'orders',
        label: 'Orders',
        icon: (
            <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
            </svg>
        ),
    },
];

const products: SellerProduct[] = [
    {
        id: 'prod-01',
        name: 'Yamaha F310 Acoustic Guitar',
        stock: 8,
        price: 8750,
        status: 'approved',
    },
    {
        id: 'prod-02',
        name: 'Fender Stratocaster Electric Guitar',
        stock: 3,
        price: 45500,
        status: 'approved',
    },
    {
        id: 'prod-03',
        name: 'Casio CT-S300 Keyboard',
        stock: 6,
        price: 12800,
        status: 'approved',
    },
    {
        id: 'prod-04',
        name: 'Roland TD-07 Drum Kit',
        stock: 2,
        price: 38900,
        status: 'pending',
    },
];

const orders: SellerOrder[] = [
    {
        id: 'ORD-2024-00001',
        customer: 'John Doe',
        total: 8750,
        status: 'delivered',
    },
    {
        id: 'ORD-2024-00003',
        customer: 'Mia Santos',
        total: 12800,
        status: 'pending',
    },
    {
        id: 'ORD-2024-00007',
        customer: 'Ryan Guzman',
        total: 45500,
        status: 'shipped',
    },
];

const formatCurrency = (value: number) =>
    `P${value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function SellerDashboard() {
    const { auth } = usePage().props as SharedData;
    const [activeSection, setActiveSection] = useState<SectionId>('dashboard');

    const stats = useMemo(() => {
        const totalProducts = products.length;
        const approvedProducts = products.filter((item) => item.status === 'approved').length;
        const pendingApproval = totalProducts - approvedProducts;
        const totalOrders = orders.length;

        return [
            { label: 'Total Products', value: totalProducts.toString() },
            { label: 'Approved Products', value: approvedProducts.toString() },
            { label: 'Pending Approval', value: pendingApproval.toString() },
            { label: 'Total Orders', value: totalOrders.toString() },
        ];
    }, []);

    const totalRevenue = useMemo(
        () => orders.reduce((sum, order) => sum + order.total, 0),
        [],
    );

    const pendingOrders = orders.filter((order) => order.status === 'pending').length;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <>
            <Head title="Seller Dashboard" />
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5"
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
                            <div>
                                <p className="text-sm font-semibold [font-family:'Space_Grotesk',sans-serif]">
                                    Musical Store
                                </p>
                                <p className="text-xs text-slate-500">Seller Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-slate-500">Seller</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-700"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
                    <aside className="rounded-2xl bg-white p-4 shadow-sm">
                        <nav className="grid gap-2 text-sm font-semibold text-slate-600">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveSection(item.id)}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                                            isActive
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span
                                            className={`grid h-8 w-8 place-items-center rounded-lg ${
                                                isActive
                                                    ? 'bg-white text-indigo-600'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <section className="space-y-6">
                        {activeSection === 'dashboard' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Welcome, Music Hub Philippines!
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Manage your products and orders
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {stats.map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                        >
                                            <p className="text-sm text-slate-500">
                                                {stat.label}
                                            </p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900">
                                                {stat.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <span className="text-emerald-500">$
                                            </span>
                                            Total Revenue
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">All-time earnings</p>
                                        <p className="mt-4 text-2xl font-semibold text-emerald-600">
                                            {formatCurrency(totalRevenue)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-4 w-4 text-indigo-500"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 3v18h18" />
                                                <path d="M7 13l4-4 4 4 5-5" />
                                            </svg>
                                            Pending Orders
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Orders awaiting processing
                                        </p>
                                        <p className="mt-4 text-2xl font-semibold text-indigo-600">
                                            {pendingOrders}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Recent Orders
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Latest customer orders
                                        </p>
                                    </div>
                                    <div className="mt-4 grid gap-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {order.id}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {order.customer}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {formatCurrency(order.total)}
                                                    </p>
                                                    <span
                                                        className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            statusStyles[order.status]
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === 'products' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        My Products
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Track your listings and stock
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="grid gap-4">
                                        {products.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {product.stock} in stock
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-semibold text-slate-900">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            statusStyles[product.status]
                                                        }`}
                                                    >
                                                        {product.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === 'orders' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Orders
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Manage incoming customer orders
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="grid gap-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {order.customer}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {order.id}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-semibold text-slate-900">
                                                        {formatCurrency(order.total)}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            statusStyles[order.status]
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
