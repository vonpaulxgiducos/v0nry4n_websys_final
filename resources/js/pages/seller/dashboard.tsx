import { Head, router, usePage } from '@inertiajs/react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import DeleteUser from '@/components/delete-user';
import ProfileInformationForm from '@/components/profile-information-form';
import ThemeSwitch from '@/components/theme-switch';
import UpdatePasswordForm from '@/components/update-password-form';
import { type SharedData } from '@/types';

type SectionId = 'dashboard' | 'products' | 'orders' | 'payments' | 'archive' | 'revenue_history' | 'settings';

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
    paymentMethod: string;
    items: {
        name: string;
        quantity: number;
        amount: number;
    }[];
    quantity: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    courier: string;
    trackingNumber: string;
    shippingFee: number;
    subtotal: number;
    total: number;
    status:
        | 'delivered'
        | 'shipped'
        | 'confirmed'
        | 'shipped_dispatched'
        | 'en_route'
        | 'in_transit'
        | 'out_for_delivery'
        | 'pending'
        | 'cancelled';
};

type PaymentItem = {
    paymentId?: number;
    id: string;
    method: string;
    amount: number;
    customer: string;
    customerPhone?: string;
    dateLabel: string;
    reference: string;
    notes: string;
    status: 'pending' | 'verified' | 'rejected';
    verifiedOn?: string;
    verificationNotes?: string;
};

type SellerDashboardPageProps = {
    products?: SellerProduct[];
    activeOrders?: SellerOrder[];
    archivedOrders?: SellerOrder[];
    initialPendingPayments?: PaymentItem[];
    initialVerifiedPayments?: PaymentItem[];
    initialRejectedPayments?: PaymentItem[];
};

const orderStatusStyles: Record<SellerOrder['status'], string> = {
    delivered: 'bg-emerald-100 text-emerald-700',
    shipped: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    shipped_dispatched: 'bg-blue-100 text-blue-700',
    en_route: 'bg-indigo-100 text-indigo-700',
    in_transit: 'bg-sky-100 text-sky-700',
    out_for_delivery: 'bg-violet-100 text-violet-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-rose-100 text-rose-700',
};

const orderStatusLabels: Record<SellerOrder['status'], string> = {
    delivered: 'Delivered',
    shipped: 'Shipped',
    confirmed: 'Confirmed',
    shipped_dispatched: 'Shipped / Dispatched',
    en_route: 'En Route',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    pending: 'Pending',
    cancelled: 'Cancelled',
};

const productStatusStyles: Record<SellerProduct['status'], string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
};

const paymentStatusStyles: Record<SellerOrder['paymentStatus'], string> = {
    verified: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
};

const methodBadgeStyles: Record<string, string> = {
    gcash: 'bg-slate-950 text-white',
    'bank transfer': 'bg-slate-950 text-white',
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
    {
        id: 'payments',
        label: 'Payment Verification',
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
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18" />
            </svg>
        ),
    },
    {
        id: 'archive',
        label: 'Archive',
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
                <rect x="3" y="5" width="18" height="4" rx="1" />
                <path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
                <path d="M10 13h4" />
            </svg>
        ),
    },
    {
        id: 'revenue_history',
        label: 'Revenue History',
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
                <path d="M3 3v18h18" />
                <path d="M7 13l4-4 3 3 5-6" />
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
        paymentMethod: 'Cash on Delivery',
        items: [
            {
                name: 'Yamaha F310 Acoustic Guitar',
                quantity: 1,
                amount: 8500,
            },
        ],
        quantity: 1,
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
        paymentMethod: 'GCash',
        items: [
            {
                name: 'Casio CT-S300 Keyboard',
                quantity: 1,
                amount: 12800,
            },
        ],
        quantity: 1,
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
        paymentMethod: 'Cash on Delivery',
        items: [
            {
                name: 'Fender Stratocaster Electric Guitar',
                quantity: 1,
                amount: 45200,
            },
        ],
        quantity: 1,
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

    if (sectionParam === 'dashboard' || sectionParam === 'products' || sectionParam === 'orders' || sectionParam === 'payments' || sectionParam === 'archive' || sectionParam === 'revenue_history' || sectionParam === 'settings') {
        return sectionParam;
    }

    return 'dashboard';
};

export default function SellerDashboard({
    products = [],
    activeOrders = [],
    archivedOrders = [],
    initialPendingPayments = [],
    initialVerifiedPayments = [],
    initialRejectedPayments = [],
}: SellerDashboardPageProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const profileData = page.props.profileData;
    const userType = page.props.userType;
    const [activeSection, setActiveSection] = useState<SectionId>(getInitialSectionFromUrl(page.url));
    const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>(activeOrders);
    const [sellerArchivedOrders, setSellerArchivedOrders] = useState<SellerOrder[]>(archivedOrders);
    const [pendingPayments, setPendingPayments] = useState<PaymentItem[]>(initialPendingPayments);
    const [verifiedPayments, setVerifiedPayments] = useState<PaymentItem[]>(initialVerifiedPayments);
    const [rejectedPayments, setRejectedPayments] = useState<PaymentItem[]>(initialRejectedPayments);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const url = new URL(window.location.href);

        if (url.searchParams.get('section') === activeSection) {
            return;
        }

        url.searchParams.set('section', activeSection);
        window.history.replaceState(
            window.history.state,
            '',
            `${url.pathname}${url.search}${url.hash}`,
        );
    }, [activeSection]);

    useEffect(() => {
        setSellerOrders(activeOrders);
        setSellerArchivedOrders(archivedOrders);
        setPendingPayments(initialPendingPayments);
        setVerifiedPayments(initialVerifiedPayments);
        setRejectedPayments(initialRejectedPayments);
    }, [activeOrders, archivedOrders, initialPendingPayments, initialRejectedPayments, initialVerifiedPayments]);

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
        () =>
            [...sellerOrders, ...sellerArchivedOrders]
                .filter((order) => order.paymentStatus === 'verified' && order.status === 'delivered')
                .reduce((sum, order) => sum + order.total, 0),
        [sellerArchivedOrders, sellerOrders],
    );

    const pendingOrders = sellerOrders.filter((order) => order.status === 'pending').length;
    const pendingApprovalOrders = sellerOrders.filter((order) => order.status === 'pending');
    const approvedProductsCount = products.filter((product) => product.status === 'approved').length;
    const revenueHistoryOrders = [...sellerOrders, ...sellerArchivedOrders].filter(
        (order) => order.paymentStatus === 'verified' && order.status === 'delivered',
    );

    const updateOrderStatus = (orderId: string, nextStatus: SellerOrder['status']) => {
        const order = sellerOrders.find((entry) => entry.id === orderId);

        if (!order) {
            return;
        }

        router.put(
            `/seller/orders/${order.orderId}/status`,
            {
                order_status: nextStatus,
            },
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const handleLogout = () => {
        router.post(
            '/logout',
            { user_type: String(auth.user.user_type ?? '') },
            {
                onSuccess: () => {
                    router.visit('/login');
                },
            },
        );
    };

    const handleOpenSettings = () => {
        setActiveSection('settings');
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

    const handleArchiveOrder = (order: SellerOrder) => {
        if (!window.confirm('Archive this order?')) {
            return;
        }

        router.patch(
            `/seller/orders/${order.orderId}/archive`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const handleUnarchiveOrder = (order: SellerOrder) => {
        router.patch(
            `/seller/orders/${order.orderId}/unarchive`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const handleDeleteOrder = (order: SellerOrder) => {
        if (!window.confirm('Delete this order from your seller list?')) {
            return;
        }

        router.delete(`/seller/orders/${order.orderId}`, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    const handleVerifyPayment = (paymentId?: number) => {
        if (!paymentId) {
            return;
        }

        router.post(
            `/seller/payments/${paymentId}/verify`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const handleRejectPayment = (paymentId?: number) => {
        if (!paymentId) {
            return;
        }

        router.post(
            `/seller/payments/${paymentId}/reject`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const summarizeOrderItems = (order: SellerOrder) => {
        if (order.items.length === 0) {
            return 'No items';
        }

        if (order.items.length === 1) {
            return order.items[0].name;
        }

        return `${order.items[0].name} +${order.items.length - 1} more`;
    };

    const accountName = String(auth.user.name || auth.user.username || 'Seller');
    const firstName = accountName.trim().split(/\s+/)[0] || 'Seller';

    return (
        <>
            <Head title="Seller Dashboard" />
            <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
                <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 18V5l10-2v13" />
                                    <circle cx="6" cy="18" r="3" />
                                    <circle cx="16" cy="16" r="3" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg font-bold font-['Geist','-apple-system','BlinkMacSystemFont','Segoe UI',sans-serif] dark:text-slate-50">
                                    Tunely
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Seller Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <ThemeSwitch />
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                    {firstName}
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Seller</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div
                    className={`mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-8 py-12 transition-[grid-template-columns] duration-200 ${
                        isSidebarCollapsed ? 'md:grid-cols-[100px_1fr]' : 'md:grid-cols-[320px_1fr]'
                    }`}
                >
                    <aside className="self-start rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 md:sticky md:top-8">
                        <div className="flex h-full flex-col gap-6">
                            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                                {!isSidebarCollapsed && <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Menu</p>}
                                <button
                                    type="button"
                                    onClick={() => setIsSidebarCollapsed((value) => !value)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                                    aria-label={isSidebarCollapsed ? 'Show sidebar labels' : 'Hide sidebar labels'}
                                >
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {isSidebarCollapsed ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
                                    </svg>
                                </button>
                            </div>

                            <nav className="grid gap-1">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.id;
                                const isProducts = item.id === 'products';
                                const isOrders = item.id === 'orders';
                                const isPayments = item.id === 'payments';
                                const isArchive = item.id === 'archive';
                                const isRevenueHistory = item.id === 'revenue_history';

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveSection(item.id)}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <span
                                            className={`grid h-5 w-5 place-items-center rounded ${
                                                isActive
                                                    ? 'text-emerald-600 dark:text-emerald-300'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}
                                        >
                                            {item.icon}
                                        </span>
                                        {!isSidebarCollapsed && (
                                            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                                <span className="truncate">{item.label}</span>
                                                {(isProducts || isOrders || isPayments || isArchive || isRevenueHistory) && (
                                                    <span className="flex items-center gap-1">
                                                        {isProducts && products.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-slate-500 px-2 py-0.5 text-xs font-bold text-white">
                                                                {products.length}
                                                            </span>
                                                        )}
                                                        {isPayments && pendingPayments.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                                                                {pendingPayments.length}
                                                            </span>
                                                        )}
                                                        {isOrders && (
                                                            <>
                                                                {sellerOrders.filter(o => o.status !== 'delivered').length > 0 && (
                                                                    <span className="inline-flex min-w-6 justify-center rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                                                                        {sellerOrders.filter(o => o.status !== 'delivered').length}
                                                                    </span>
                                                                )}
                                                                {sellerOrders.filter(o => o.status === 'delivered').length > 0 && (
                                                                    <span className="inline-flex min-w-6 justify-center rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                                                                        {sellerOrders.filter(o => o.status === 'delivered').length}
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                        {isArchive && sellerArchivedOrders.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-slate-500 px-2 py-0.5 text-xs font-bold text-white">
                                                                {sellerArchivedOrders.length}
                                                            </span>
                                                        )}
                                                        {isRevenueHistory && revenueHistoryOrders.filter((o) => !sellerArchivedOrders.some((entry) => entry.orderId === o.orderId)).length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-slate-500 px-2 py-0.5 text-xs font-bold text-white">
                                                                {revenueHistoryOrders.length}
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                            </nav>

                            <div className="pt-6">
                                <div className="mb-4 border-t border-slate-200 dark:border-slate-800" />
                                <div className="grid gap-2">
                                    <button
                                        type="button"
                                        onClick={handleOpenSettings}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            activeSection === 'settings'
                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                        } ${
                                            isSidebarCollapsed ? 'justify-center' : ''
                                        }`}
                                    >
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                        {!isSidebarCollapsed && 'Settings'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950 ${
                                            isSidebarCollapsed ? 'justify-center' : ''
                                        }`}
                                    >
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        {!isSidebarCollapsed && 'Logout'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="min-w-0 space-y-6 dark:[&_.bg-white]:bg-slate-900 dark:[&_.border-slate-200]:border-slate-700 dark:[&_.text-slate-900]:text-slate-100 dark:[&_.text-slate-600]:text-slate-300 dark:[&_.text-slate-500]:text-slate-400 dark:[&_.bg-slate-100]:bg-slate-800">
                        {activeSection === 'dashboard' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Welcome, {firstName}!
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
                                                            {orderStatusLabels[order.status]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 border-t border-slate-200 pt-3">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            paymentStatusStyles[order.paymentStatus]
                                                        }`}
                                                    >
                                                        Payment: {order.paymentStatus}
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
                                        className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-emerald-400 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
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
                                                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
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
                                                                {order.customerName} • {summarizeOrderItems(order)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
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

                                            <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700">
                                                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                                    Order Items
                                                </h2>
                                                <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                                    {order.items.map((item, index) => (
                                                        <div key={`${order.id}-item-${index}`} className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                    Quantity: {item.quantity}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                                ₱{item.amount.toLocaleString('en-PH')}
                                                            </p>
                                                        </div>
                                                    ))}

                                                    <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100">
                                                        <span>Total Quantity</span>
                                                        <span>{order.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 space-y-5 border-t border-slate-200 pt-5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                                        Customer Information
                                                    </h3>
                                                    <p className="mt-2 dark:text-slate-300">{order.customerName}</p>
                                                    <p className="dark:text-slate-300">{order.customerPhone}</p>
                                                    <p className="dark:text-slate-300">{order.customerAddress}</p>
                                                </div>

                                                <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
                                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                                        Shipment Information
                                                    </h3>
                                                    <p className="mt-2">
                                                        Courier:{' '}
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                                            {order.courier}
                                                        </span>
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                        Payment Method:{' '}
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                            {order.paymentMethod}
                                                        </span>
                                                    </p>
                                                    <p className="dark:text-slate-300">
                                                        Tracking:{' '}
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">
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
                                                            {orderStatusLabels[order.status]}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
                                                    <div className="flex items-center justify-between">
                                                        <p>Subtotal</p>
                                                        <p>₱{order.subtotal.toLocaleString('en-PH')}</p>
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-between">
                                                        <p>Shipping Fee</p>
                                                        <p>₱{order.shippingFee.toLocaleString('en-PH')}</p>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                                                        <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                                            Total
                                                        </p>
                                                        <p className="text-xl font-semibold text-indigo-600 dark:text-violet-200">
                                                            ₱{order.total.toLocaleString('en-PH')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-4">
                                                {order.status === 'pending' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                                        className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                                    >
                                                        Approve Order
                                                    </button>
                                                )}

                                                {order.status !== 'pending' && order.status !== 'delivered' && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                                                            {[
                                                                { key: 'shipped_dispatched', label: 'Shipped / Dispatched' },
                                                                { key: 'en_route', label: 'En Route' },
                                                                { key: 'in_transit', label: 'In Transit' },
                                                                { key: 'out_for_delivery', label: 'Out for Delivery' },
                                                            ].map((statusOption) => (
                                                                <button
                                                                    key={statusOption.key}
                                                                    type="button"
                                                                    onClick={() => updateOrderStatus(order.id, statusOption.key)}
                                                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                                                        order.status === statusOption.key
                                                                            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                                                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                                                    }`}
                                                                >
                                                                    {statusOption.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleArchiveOrder(order)}
                                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
                                                >
                                                    Archive
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteOrder(order)}
                                                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                                >
                                                    Delete Order
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeSection === 'payments' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Payment Verification
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Verify payments for your shop orders only
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm text-slate-500">Pending Verification</p>
                                        <p className="mt-2 text-2xl font-semibold text-amber-600">{pendingPayments.length}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm text-slate-500">Verified</p>
                                        <p className="mt-2 text-2xl font-semibold text-emerald-600">{verifiedPayments.length}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm text-slate-500">Rejected</p>
                                        <p className="mt-2 text-2xl font-semibold text-rose-600">{rejectedPayments.length}</p>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        Pending Verification
                                    </h2>
                                </div>

                                {pendingPayments.length > 0 ? (
                                    <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold text-slate-900">{pendingPayments[0].id}</h3>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    methodBadgeStyles[pendingPayments[0].method.toLowerCase()] ?? 'bg-slate-950 text-white'
                                                }`}
                                            >
                                                {pendingPayments[0].method.toUpperCase()}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-slate-500">{pendingPayments[0].dateLabel}</p>

                                        <div className="mt-5 grid gap-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Customer</span>
                                                <span className="font-semibold text-slate-900">{pendingPayments[0].customer}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Customer Phone</span>
                                                <span className="font-semibold text-slate-900">{pendingPayments[0].customerPhone ?? '—'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Amount</span>
                                                <span className="text-xl font-semibold text-indigo-600 dark:text-violet-200">
                                                    {formatCurrency(pendingPayments[0].amount)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Reference</span>
                                                <span className="font-semibold text-slate-900">{pendingPayments[0].reference}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-xl bg-slate-100 p-3">
                                            <p className="text-xs text-slate-500">Payment Notes</p>
                                            <p className="text-sm font-medium text-slate-900">{pendingPayments[0].notes}</p>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleVerifyPayment(pendingPayments[0].paymentId)}
                                                className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white"
                                            >
                                                Verify
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRejectPayment(pendingPayments[0].paymentId)}
                                                className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                        No payments pending verification for your shop.
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        Recently Verified
                                    </h2>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {verifiedPayments.map((payment) => (
                                        <div key={`verified-${payment.id}-${payment.paymentId}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-semibold text-slate-900">{payment.id}</h3>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        methodBadgeStyles[payment.method.toLowerCase()] ?? 'bg-slate-950 text-white'
                                                    }`}
                                                >
                                                    {payment.method.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">{payment.dateLabel}</p>
                                            <div className="mt-4 grid gap-1 text-sm text-slate-600">
                                                <p>Customer: <span className="font-semibold text-slate-900">{payment.customer}</span></p>
                                                <p>Customer Phone: <span className="font-semibold text-slate-900">{payment.customerPhone ?? '—'}</span></p>
                                                <p>Amount: <span className="font-semibold text-indigo-600 dark:text-violet-200">{formatCurrency(payment.amount)}</span></p>
                                                <p>Reference: <span className="font-semibold text-slate-900">{payment.reference}</span></p>
                                            </div>
                                            {payment.verifiedOn && (
                                                <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                                                    {payment.verifiedOn}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        Recently Rejected
                                    </h2>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {rejectedPayments.map((payment) => (
                                        <div key={`rejected-${payment.id}-${payment.paymentId}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-semibold text-slate-900">{payment.id}</h3>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        methodBadgeStyles[payment.method.toLowerCase()] ?? 'bg-slate-950 text-white'
                                                    }`}
                                                >
                                                    {payment.method.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">{payment.dateLabel}</p>
                                            <div className="mt-4 grid gap-1 text-sm text-slate-600">
                                                <p>Customer: <span className="font-semibold text-slate-900">{payment.customer}</span></p>
                                                <p>Customer Phone: <span className="font-semibold text-slate-900">{payment.customerPhone ?? '—'}</span></p>
                                                <p>Amount: <span className="font-semibold text-indigo-600 dark:text-violet-200">{formatCurrency(payment.amount)}</span></p>
                                                <p>Reference: <span className="font-semibold text-slate-900">{payment.reference}</span></p>
                                            </div>
                                            <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
                                                Rejected
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeSection === 'archive' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Archive
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Archived seller orders
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    {sellerArchivedOrders.map((order) => (
                                        <article
                                            key={`archived-${order.id}`}
                                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                        >
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                                <div>
                                                    <p className="text-base font-semibold text-slate-900">{order.id}</p>
                                                    <p className="text-xs text-slate-500">{order.dateLabel}</p>
                                                </div>
                                                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusStyles[order.status]}`}>
                                                        {orderStatusLabels[order.status]}
                                                    </span>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusStyles[order.paymentStatus]}`}>
                                                        Payment: {order.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 text-sm text-slate-600">
                                                <p>Customer: <span className="font-semibold text-slate-900">{order.customerName}</span></p>
                                                <p>Courier: <span className="font-semibold text-slate-900">{order.courier}</span></p>
                                                <p>Total: <span className="font-semibold text-indigo-600 dark:text-violet-200">₱{order.total.toLocaleString('en-PH')}</span></p>
                                            </div>

                                            <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnarchiveOrder(order)}
                                                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
                                                >
                                                    Unarchive
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteOrder(order)}
                                                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                                >
                                                    Delete Order
                                                </button>
                                            </div>
                                        </article>
                                    ))}

                                    {sellerArchivedOrders.length === 0 && (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                            No archived orders yet.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeSection === 'revenue_history' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">Revenue History</h1>
                                    <p className="text-sm text-slate-500">Track all verified revenue orders</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm text-slate-500">Verified Orders</p>
                                        <p className="mt-2 text-2xl font-semibold text-emerald-600">{revenueHistoryOrders.length}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm text-slate-500">Archived</p>
                                        <p className="mt-2 text-2xl font-semibold text-indigo-600">{sellerArchivedOrders.filter((order) => order.paymentStatus === 'verified' && order.status === 'delivered').length}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm text-slate-500">Visible</p>
                                        <p className="mt-2 text-2xl font-semibold text-slate-900">{sellerOrders.filter((order) => order.paymentStatus === 'verified' && order.status === 'delivered').length}</p>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {revenueHistoryOrders.map((order) => {
                                        const isArchived = sellerArchivedOrders.some((entry) => entry.orderId === order.orderId);
                                        return !isArchived ? (
                                            <article
                                                key={`revenue-${order.id}`}
                                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                            >
                                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                                    <div>
                                                        <p className="text-base font-semibold text-slate-900">{order.id}</p>
                                                        <p className="text-xs text-slate-500">{order.dateLabel}</p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm text-slate-500">Revenue</p>
                                                        <p className="text-xl font-semibold text-emerald-600">₱{order.total.toLocaleString('en-PH')}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-1 text-sm text-slate-600">
                                                    <p>Customer: <span className="font-semibold text-slate-900">{order.customerName}</span></p>
                                                    <p>Payment Method: <span className="font-semibold text-slate-900">{order.paymentMethod}</span></p>
                                                    <p>Delivery Status: <span className="font-semibold text-slate-900">{orderStatusLabels[order.status]}</span></p>
                                                    <p>Record: <span className="font-semibold text-slate-900">Visible</span></p>
                                                </div>

                                                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleArchiveOrder(order)}
                                                        className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                                    >
                                                        Archive
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteOrder(order)}
                                                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                                    >
                                                        Delete Order
                                                    </button>
                                                </div>
                                            </article>
                                        ) : null;
                                    })}

                                    {revenueHistoryOrders.filter((o) => !sellerArchivedOrders.some((entry) => entry.orderId === o.orderId)).length === 0 && sellerArchivedOrders.length === 0 && (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                            No verified revenue records yet.
                                        </div>
                                    )}

                                    {revenueHistoryOrders.some((o) => sellerArchivedOrders.some((entry) => entry.orderId === o.orderId)) && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 border-t border-slate-300"></div>
                                            <p className="text-sm font-semibold text-slate-500">Archived Orders</p>
                                            <div className="flex-1 border-t border-slate-300"></div>
                                        </div>
                                    )}

                                    {revenueHistoryOrders.map((order) => {
                                        const isArchived = sellerArchivedOrders.some((entry) => entry.orderId === order.orderId);

                                        return isArchived ? (
                                            <article
                                                key={`revenue-${order.id}`}
                                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm opacity-75"
                                            >
                                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                                    <div>
                                                        <p className="text-base font-semibold text-slate-900">{order.id}</p>
                                                        <p className="text-xs text-slate-500">{order.dateLabel}</p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm text-slate-500">Revenue</p>
                                                        <p className="text-xl font-semibold text-emerald-600">₱{order.total.toLocaleString('en-PH')}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-1 text-sm text-slate-600">
                                                    <p>Customer: <span className="font-semibold text-slate-900">{order.customerName}</span></p>
                                                    <p>Payment Method: <span className="font-semibold text-slate-900">{order.paymentMethod}</span></p>
                                                    <p>Delivery Status: <span className="font-semibold text-slate-900">{orderStatusLabels[order.status]}</span></p>
                                                    <p>Record: <span className="font-semibold text-slate-900">Archived</span></p>
                                                </div>

                                                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUnarchiveOrder(order)}
                                                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
                                                    >
                                                        Unarchive
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteOrder(order)}
                                                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                                    >
                                                        Delete Order
                                                    </button>
                                                </div>
                                            </article>
                                        ) : null;
                                    })}
                                </div>
                            </>
                        )}

                        {activeSection === 'settings' && (
                            <div className="max-w-2xl space-y-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <ProfileInformationForm
                                        profileData={profileData}
                                        userType={userType}
                                    />
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <UpdatePasswordForm />
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <DeleteUser />
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
