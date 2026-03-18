import { Head, router, usePage } from '@inertiajs/react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { type SharedData } from '@/types';

type SectionId = 'dashboard' | 'products' | 'orders';

type SellerProduct = {
    id: string;
    name: string;
    category: string;
    image: string;
    description: string;
    stock: number;
    price: number;
    status: 'approved' | 'pending';
};

type SellerOrder = {
    orderId: number;
    id: string;
    dateLabel: string;
    paymentStatus: 'verified' | 'pending';
    itemName: string;
    quantity: number;
    itemAmount: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    courier: string;
    trackingNumber: string;
    shippingFee: number;
    subtotal: number;
    total: number;
    status: 'delivered' | 'shipped' | 'pending';
};

type SellerDashboardPageProps = {
    products?: SellerProduct[];
    orders?: SellerOrder[];
};

const orderStatusStyles: Record<SellerOrder['status'], string> = {
    delivered: 'bg-emerald-100 text-emerald-700',
    shipped: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
};

const productStatusStyles: Record<SellerProduct['status'], string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
};

const paymentStatusStyles: Record<SellerOrder['paymentStatus'], string> = {
    verified: 'bg-slate-100 text-slate-700',
    pending: 'bg-amber-100 text-amber-700',
};

const navItems: { id: SectionId; label: string; icon: ReactNode }[] = [
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

const defaultProducts: SellerProduct[] = [
    {
        id: 'prod-01',
        name: 'Yamaha F310 Acoustic Guitar',
        category: 'Guitars',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
        description: 'Perfect for beginners with bright, balanced tone.',
        stock: 8,
        price: 8750,
        status: 'approved',
    },
    {
        id: 'prod-02',
        name: 'Fender Stratocaster Electric Guitar',
        category: 'Guitars',
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80',
        description: 'Classic single-coil sound ideal for stage and studio.',
        stock: 3,
        price: 45500,
        status: 'approved',
    },
    {
        id: 'prod-03',
        name: 'Casio CT-S300 Keyboard',
        category: 'Keyboards',
        image: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=900&q=80',
        description: 'Portable 61-key keyboard for practice and learning.',
        stock: 6,
        price: 12800,
        status: 'approved',
    },
    {
        id: 'prod-04',
        name: 'Roland TD-07 Drum Kit',
        category: 'Drums',
        image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=900&q=80',
        description: 'Quiet electronic drums with natural mesh head feel.',
        stock: 2,
        price: 38900,
        status: 'pending',
    },
];

const defaultOrders: SellerOrder[] = [
    {
        orderId: 1,
        id: 'ORD-2024-00001',
        dateLabel: 'February 7, 2024',
        paymentStatus: 'verified',
        itemName: 'Yamaha F310 Acoustic Guitar',
        quantity: 1,
        itemAmount: 8500,
        customerName: 'John Doe',
        customerPhone: '+63 912 345 6789',
        customerAddress: '123 Main St, Brgy. Central, Manila, Metro Manila 1000',
        courier: 'JRS Express',
        trackingNumber: 'JRS-2024-001234',
        shippingFee: 250,
        subtotal: 8500,
        total: 8750,
        status: 'delivered',
    },
    {
        orderId: 2,
        id: 'ORD-2024-00003',
        dateLabel: 'February 14, 2024',
        paymentStatus: 'pending',
        itemName: 'Casio CT-S300 Keyboard',
        quantity: 1,
        itemAmount: 12800,
        customerName: 'Mia Santos',
        customerPhone: '+63 917 222 1188',
        customerAddress: '89 Rizal Ave, Cebu City, Cebu 6000',
        courier: 'LBC Express',
        trackingNumber: 'LBC-2024-443210',
        shippingFee: 300,
        subtotal: 12800,
        total: 13100,
        status: 'pending',
    },
    {
        orderId: 3,
        id: 'ORD-2024-00007',
        dateLabel: 'February 17, 2024',
        paymentStatus: 'verified',
        itemName: 'Fender Stratocaster Electric Guitar',
        quantity: 1,
        itemAmount: 45200,
        customerName: 'Ryan Guzman',
        customerPhone: '+63 905 111 9087',
        customerAddress: '22 P. Del Rosario St, Davao City, Davao del Sur 8000',
        courier: 'Ninja Van',
        trackingNumber: 'NINJA-2024-989001',
        shippingFee: 300,
        subtotal: 45200,
        total: 45500,
        status: 'shipped',
    },
];

const formatCurrency = (value: number) =>
    `P${value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const getInitialSectionFromUrl = (url: string): SectionId => {
    const query = url.split('?')[1] ?? '';
    const sectionParam = new URLSearchParams(query).get('section');

    if (sectionParam === 'dashboard' || sectionParam === 'products' || sectionParam === 'orders') {
        return sectionParam;
    }

    return 'dashboard';
};

export default function SellerDashboard({
    products = [],
    orders = [],
}: SellerDashboardPageProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [activeSection, setActiveSection] = useState<SectionId>(getInitialSectionFromUrl(page.url));
    const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>(orders);

    useEffect(() => {
        setSellerOrders(orders);
    }, [orders]);

    const stats = useMemo(() => {
        const totalProducts = products.length;
        const approvedProducts = products.filter((item) => item.status === 'approved').length;
        const pendingApproval = totalProducts - approvedProducts;
        const totalOrders = sellerOrders.length;

        return [
            { label: 'Total Products', value: totalProducts.toString() },
            { label: 'Approved Products', value: approvedProducts.toString() },
            { label: 'Pending Approval', value: pendingApproval.toString() },
            { label: 'Total Orders', value: totalOrders.toString() },
        ];
    }, [sellerOrders]);

    const totalRevenue = useMemo(
        () => sellerOrders.reduce((sum, order) => sum + order.total, 0),
        [sellerOrders],
    );

    const pendingOrders = sellerOrders.filter((order) => order.status === 'pending').length;
    const pendingApprovalOrders = sellerOrders.filter((order) => order.status === 'pending');
    const approvedProductsCount = products.filter((product) => product.status === 'approved').length;

    const updateOrderStatus = (orderId: string, nextStatus: SellerOrder['status']) => {
        const order = sellerOrders.find((entry) => entry.id === orderId);

        if (!order) {
            return;
        }

        const statusToPersist = nextStatus === 'delivered' ? 'delivered' : 'shipped';

        router.put(
            `/seller/orders/${order.orderId}/status`,
            {
                order_status: statusToPersist,
            },
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const getProductId = (productId: string) => productId.replace('prod-', '');

    const handleEditProduct = (productId: string) => {
        const id = getProductId(productId);
        router.get(`/seller/products/${id}/edit`);
    };

    const handleDeleteProduct = (productId: string) => {
        const id = getProductId(productId);

        if (!window.confirm('Delete this product? This action cannot be undone.')) {
            return;
        }

        router.delete(`/seller/products/${id}`, {
            preserveScroll: true,
            preserveState: true,
        });
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

                                <div className="grid gap-4 xl:grid-cols-3">
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
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-4 w-4 text-emerald-500"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                            Approved Listings
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Listings currently active
                                        </p>
                                        <p className="mt-4 text-2xl font-semibold text-emerald-600">
                                            {approvedProductsCount}
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
                                        {sellerOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="rounded-2xl border border-slate-200 bg-white p-4"
                                            >
                                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {order.id}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {order.customerName}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {order.dateLabel}
                                                        </p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {formatCurrency(order.total)}
                                                        </p>
                                                        <span
                                                            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                                orderStatusStyles[order.status]
                                                            }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            paymentStatusStyles[order.paymentStatus]
                                                        }`}
                                                    >
                                                        Payment: {order.paymentStatus}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === 'products' && (
                            <>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900">
                                            My Products
                                        </h1>
                                        <p className="text-sm text-slate-500">
                                            Track your listings, price, and stock levels
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => router.get('/seller/products/create')}
                                        className="inline-flex items-center gap-2 self-start rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
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
                                            <path d="M12 5v14" />
                                            <path d="M5 12h14" />
                                        </svg>
                                        Add Product
                                    </button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {products.map((product) => (
                                        <article
                                            key={product.id}
                                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                        >
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-40 w-full object-cover"
                                            />
                                            <div className="space-y-3 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            {product.category}
                                                        </p>
                                                        <h2 className="text-sm font-semibold text-slate-900">
                                                            {product.name}
                                                        </h2>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            productStatusStyles[product.status]
                                                        }`}
                                                    >
                                                        {product.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {product.description}
                                                </p>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-semibold text-slate-900">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {product.stock} in stock
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditProduct(product.id)}
                                                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        Edit Product
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-3 py-2 text-rose-600 transition hover:bg-rose-50"
                                                        aria-label="Delete product"
                                                        title="Delete product"
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
                                                            <path d="M3 6h18" />
                                                            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                                                            <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                                                            <path d="M10 11v6" />
                                                            <path d="M14 11v6" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
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
                                        Manage customer orders and shipments
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    {pendingApprovalOrders.length > 0 && (
                                        <article className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
                                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                                <div>
                                                    <h2 className="text-base font-semibold text-slate-900">
                                                        Pending Order Approvals
                                                    </h2>
                                                    <p className="text-sm text-slate-600">
                                                        Approve pending orders to start fulfillment.
                                                    </p>
                                                </div>
                                                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                    {pendingApprovalOrders.length} pending
                                                </span>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                {pendingApprovalOrders.map((order) => (
                                                    <div
                                                        key={`approval-${order.id}`}
                                                        className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {order.id}
                                                            </p>
                                                            <p className="text-xs text-slate-600">
                                                                {order.customerName} • {order.itemName}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                                                            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                                        >
                                                            Approve Order
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </article>
                                    )}

                                    {sellerOrders.map((order) => (
                                        <article
                                            key={order.id}
                                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                        >
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                                <div>
                                                    <p className="text-base font-semibold text-slate-900">
                                                        {order.id}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {order.dateLabel}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            orderStatusStyles[order.status]
                                                        }`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            paymentStatusStyles[order.paymentStatus]
                                                        }`}
                                                    >
                                                        Payment: {order.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-5 border-t border-slate-200 pt-5">
                                                <h2 className="text-xl font-semibold text-slate-900">
                                                    Order Items
                                                </h2>
                                                <div className="mt-3 rounded-xl bg-slate-50 p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">
                                                                {order.itemName}
                                                            </p>
                                                            <p className="text-sm text-slate-500">
                                                                Quantity: {order.quantity}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            ₱{order.itemAmount.toLocaleString('en-PH')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 space-y-5 border-t border-slate-200 pt-5 text-sm text-slate-600">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">
                                                        Customer Information
                                                    </h3>
                                                    <p className="mt-2">{order.customerName}</p>
                                                    <p>{order.customerPhone}</p>
                                                    <p>{order.customerAddress}</p>
                                                </div>

                                                <div className="border-t border-slate-200 pt-5">
                                                    <h3 className="font-semibold text-slate-900">
                                                        Shipment Information
                                                    </h3>
                                                    <p className="mt-2">
                                                        Courier:{' '}
                                                        <span className="font-medium text-slate-700">
                                                            {order.courier}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Tracking:{' '}
                                                        <span className="font-medium text-slate-700">
                                                            {order.trackingNumber}
                                                        </span>
                                                    </p>
                                                    <p className="mt-1 flex items-center gap-2">
                                                        Status:
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                orderStatusStyles[order.status]
                                                            }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="border-t border-slate-200 pt-5">
                                                    <div className="flex items-center justify-between">
                                                        <p>Subtotal</p>
                                                        <p>₱{order.subtotal.toLocaleString('en-PH')}</p>
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-between">
                                                        <p>Shipping Fee</p>
                                                        <p>₱{order.shippingFee.toLocaleString('en-PH')}</p>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                                                        <p className="text-xl font-semibold text-slate-900">
                                                            Total
                                                        </p>
                                                        <p className="text-xl font-semibold text-indigo-600">
                                                            ₱{order.total.toLocaleString('en-PH')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-4">
                                                {order.status === 'pending' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                                                        className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                                    >
                                                        Approve Order
                                                    </button>
                                                )}

                                                {order.status === 'shipped' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                    >
                                                        Mark as Delivered
                                                    </button>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
