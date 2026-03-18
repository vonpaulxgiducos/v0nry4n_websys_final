import { Head, router, usePage } from '@inertiajs/react';
import { type ReactNode, useMemo, useState } from 'react';
import { type SharedData } from '@/types';

type SectionId =
    | 'dashboard'
    | 'approvals'
    | 'payments'
    | 'tickets';

type ApprovalItem = {
    id: string;
    name: string;
    description: string;
    seller: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    status: 'pending' | 'approved';
};

type PaymentItem = {
    paymentId?: number;
    id: string;
    method: string;
    amount: number;
    customer: string;
    dateLabel: string;
    reference: string;
    notes: string;
    status: 'pending' | 'verified';
    verifiedOn?: string;
    verificationNotes?: string;
};

type TicketItem = {
    ticketId?: number;
    id: string;
    subject: string;
    preview: string;
    message: string;
    customer: string;
    date: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in_progress' | 'resolved';
    relatedOrder?: string;
};

type AdminDashboardPageProps = {
    initialApprovals?: ApprovalItem[];
    initialApprovedProducts?: ApprovalItem[];
    initialPendingPayments?: PaymentItem[];
    initialVerifiedPayments?: PaymentItem[];
    initialTickets?: TicketItem[];
    stats?: { label: string; value: string }[];
    platformRevenue?: number;
    activeProducts?: number;
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
        id: 'approvals',
        label: 'Product Approvals',
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
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M7 8h10" />
                <path d="M7 12h6" />
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
        id: 'tickets',
        label: 'Support Tickets',
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
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
            </svg>
        ),
    },
];

const defaultInitialApprovals: ApprovalItem[] = [
    {
        id: 'APP-007',
        name: 'Ibanez RG Series Electric Guitar',
        description: 'Modern electric guitar with HSH pickup configuration. Fast neck and versatile sound.',
        seller: 'Guitar World Manila',
        category: 'Guitars',
        price: 38000,
        stock: 6,
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80',
        status: 'pending',
    },
];

const defaultInitialApprovedProducts: ApprovalItem[] = [
    {
        id: 'APP-001',
        name: 'Yamaha F310 Acoustic Guitar',
        description: 'Perfect for beginners. Full-size dreadnought body with a natural bright tone.',
        seller: 'Music Hub Philippines',
        category: 'Guitars',
        price: 8500,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
        status: 'approved',
    },
    {
        id: 'APP-002',
        name: 'Fender Stratocaster Electric Guitar',
        description: 'Classic electric guitar with three single-coil pickups. Versatile tone for stage and studio.',
        seller: 'Guitar World Manila',
        category: 'Guitars',
        price: 45000,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80',
        status: 'approved',
    },
    {
        id: 'APP-003',
        name: 'Casio CT-S300 Keyboard',
        description: '61-key portable keyboard with 400 tones and 77 rhythms. Perfect for home practice.',
        seller: 'Music Hub Philippines',
        category: 'Keyboards',
        price: 12500,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=900&q=80',
        status: 'approved',
    },
    {
        id: 'APP-004',
        name: 'Pearl Export Series Drum Set',
        description: '5-piece drum set including hardware. Great for intermediate players and live sessions.',
        seller: 'Music Hub Philippines',
        category: 'Drums',
        price: 42000,
        stock: 4,
        image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=900&q=80',
        status: 'approved',
    },
    {
        id: 'APP-005',
        name: "Guitar Strings Set - D'Addario",
        description: 'Premium phosphor bronze acoustic guitar strings. Warm and balanced tone.',
        seller: 'Guitar World Manila',
        category: 'Accessories',
        price: 650,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=900&q=80',
        status: 'approved',
    },
    {
        id: 'APP-006',
        name: 'Piano Sheet Music Collection - Beethoven',
        description: 'Complete collection of classical piano pieces. Includes works by Beethoven and Mozart.',
        seller: 'Music Hub Philippines',
        category: 'Music Sheets',
        price: 1800,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
        status: 'approved',
    },
    {
        id: 'APP-008',
        name: 'Roland TD-07 Drum Kit',
        description: 'Quiet electronic drum kit with mesh heads and realistic feel for practice and recording.',
        seller: 'Beat Box Cebu',
        category: 'Drums',
        price: 38900,
        stock: 2,
        image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=900&q=80',
        status: 'approved',
    },
];

const defaultInitialPendingPayments: PaymentItem[] = [
    {
        id: 'ORD-2024-00003',
        method: 'GCash',
        amount: 12800,
        customer: 'John Doe',
        dateLabel: 'February 14, 2024 at 07:00 PM',
        reference: 'GCASH-20240214-345678',
        notes: 'Paid via GCash',
        status: 'pending',
    },
];

const defaultInitialVerifiedPayments: PaymentItem[] = [
    {
        id: 'ORD-2024-00001',
        method: 'GCash',
        amount: 8750,
        customer: 'John Doe',
        dateLabel: 'February 7, 2024 at 07:00 PM',
        reference: 'GCASH-20240207-123456',
        notes: 'Paid via GCash',
        status: 'verified',
        verifiedOn: 'Verified on 2/8/2024',
        verificationNotes: 'Payment confirmed',
    },
    {
        id: 'ORD-2024-00002',
        method: 'Bank Transfer',
        amount: 45500,
        customer: 'John Doe',
        dateLabel: 'February 9, 2024 at 07:00 PM',
        reference: 'BPI-20240209-789012',
        notes: 'Bank transfer from BPI',
        status: 'verified',
        verifiedOn: 'Verified on 2/10/2024',
        verificationNotes: 'Transfer validated',
    },
];

const defaultInitialTickets: TicketItem[] = [
    {
        id: 'TICK-2024-00002',
        subject: 'General inquiry about...',
        preview: 'Do you ship to provinces outside Metro Manila?',
        message: 'Do you ship to provinces outside Metro Manila?',
        customer: 'John Doe',
        date: '2/14/2024',
        priority: 'medium',
        status: 'open',
    },
    {
        id: 'TICK-2024-00001',
        subject: 'Question about guitar...',
        preview: 'Hi, I recently received my Yamaha F310. What is the recommended way to...',
        message: 'Hi, I recently received my Yamaha F310. What is the recommended way to maintain string tension?',
        customer: 'John Doe',
        date: '2/11/2024',
        priority: 'low',
        status: 'resolved',
        relatedOrder: 'ORD-2024-00001',
    },
];

const formatCurrency = (value: number) =>
    `P${value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const ticketStyles: Record<TicketItem['status'], string> = {
    open: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-emerald-100 text-emerald-700',
};

const priorityStyles: Record<TicketItem['priority'], string> = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
};

const methodBadgeStyles: Record<string, string> = {
    gcash: 'bg-slate-950 text-white',
    'bank transfer': 'bg-slate-950 text-white',
};

export default function AdminDashboard({
    initialApprovals = [],
    initialApprovedProducts = [],
    initialPendingPayments = [],
    initialVerifiedPayments = [],
    initialTickets = [],
    stats: statsFromServer,
    platformRevenue = 0,
    activeProducts = 0,
}: AdminDashboardPageProps) {
    const { auth } = usePage<SharedData>().props;
    const [activeSection, setActiveSection] = useState<SectionId>('dashboard');
    const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);
    const [approvedProducts, setApprovedProducts] =
        useState<ApprovalItem[]>(initialApprovedProducts);
    const [approvingProductId, setApprovingProductId] = useState<string | null>(null);
    const [rejectedProductsCount, setRejectedProductsCount] = useState(0);
    const [pendingPayments, setPendingPayments] =
        useState<PaymentItem[]>(initialPendingPayments);
    const [verifiedPayments, setVerifiedPayments] =
        useState<PaymentItem[]>(initialVerifiedPayments);
    const [rejectedPaymentsCount, setRejectedPaymentsCount] = useState(0);
    const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);

    const stats = useMemo(() => {
        const totalOrdersFromServer = statsFromServer?.find((item) => item.label === 'Total Orders')?.value;

        return [
            { label: 'Pending Products', value: approvals.length.toString() },
            { label: 'Pending Payments', value: pendingPayments.length.toString() },
            {
                label: 'Open Tickets',
                value: tickets.filter((ticket) => ticket.status !== 'resolved')
                    .length
                    .toString(),
            },
            {
                label: 'Total Orders',
                value: totalOrdersFromServer ?? (pendingPayments.length + verifiedPayments.length).toString(),
            },
        ];
    }, [approvals.length, pendingPayments.length, tickets, verifiedPayments.length, statsFromServer]);

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleApprove = (id: string) => {
        const productId = id.replace('APP-', '');

        if (!productId || approvingProductId === id) {
            return;
        }

        setApprovingProductId(id);

        router.post(
            `/admin/products/${productId}/approve`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setApprovals((prev) => {
                        const item = prev.find((entry) => entry.id === id);

                        if (item) {
                            setApprovedProducts((approved) => {
                                const nextItem: ApprovalItem = {
                                    ...item,
                                    status: 'approved',
                                };

                                return [
                                    nextItem,
                                    ...approved.filter((entry) => entry.id !== nextItem.id),
                                ];
                            });
                        }

                        return prev.filter((entry) => entry.id !== id);
                    });
                },
                onFinish: () => {
                    setApprovingProductId((current) => (current === id ? null : current));
                },
            },
        );
    };

    const handleReject = (id: string) => {
        const productId = id.replace('APP-', '');

        if (!productId) {
            return;
        }

        router.post(
            `/admin/products/${productId}/reject`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setRejectedProductsCount((prev) => prev + 1);
                },
            },
        );
    };

    const handleVerifyPayment = (paymentId?: number) => {
        if (!paymentId) {
            return;
        }

        router.post(
            `/admin/payments/${paymentId}/verify`,
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
            `/admin/payments/${paymentId}/reject`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setRejectedPaymentsCount((prev) => prev + 1);
                },
            },
        );
    };

    const handleResolveTicket = (ticketId?: number) => {
        if (!ticketId) {
            return;
        }

        router.post(
            `/admin/tickets/${ticketId}/resolve`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    return (
        <>
            <Head title="Admin Dashboard" />
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
                                <p className="text-xs text-slate-500">Admin Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-slate-500">Super Admin</p>
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
                                        Admin Dashboard
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Manage products, payments, and support
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {stats.map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                        >
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <circle cx="12" cy="12" r="9" />
                                                </svg>
                                                {stat.label}
                                            </div>
                                            <p
                                                className={`mt-2 text-2xl font-semibold ${
                                                    stat.label === 'Pending Products'
                                                        ? 'text-amber-600'
                                                        : stat.label === 'Pending Payments'
                                                          ? 'text-orange-600'
                                                          : stat.label === 'Open Tickets'
                                                            ? 'text-indigo-600'
                                                            : 'text-slate-900'
                                                }`}
                                            >
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
                                            Platform Revenue
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Total transaction value
                                        </p>
                                        <p className="mt-4 text-2xl font-semibold text-emerald-600">
                                            {formatCurrency(platformRevenue)}
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
                                                <circle cx="12" cy="8" r="4" />
                                                <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                                            </svg>
                                            Active Products
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Approved and available products
                                        </p>
                                        <p className="mt-4 text-2xl font-semibold text-indigo-600">
                                            {activeProducts}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div>
                                            <h2 className="text-base font-semibold text-slate-900">
                                                Products Awaiting Approval
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Recent product submissions
                                            </p>
                                        </div>
                                        <div className="mt-4 grid gap-3">
                                            {approvals.slice(0, 1).map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="rounded-xl border border-slate-200 p-4"
                                                >
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        by {item.seller}
                                                    </p>
                                                    <p className="mt-1 text-sm text-indigo-600">
                                                        {formatCurrency(item.price)}
                                                    </p>
                                                </div>
                                            ))}
                                            {approvals.length === 0 && (
                                                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                                    All products approved.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div>
                                            <h2 className="text-base font-semibold text-slate-900">
                                                Payments to Verify
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Recent payment submissions
                                            </p>
                                        </div>
                                        <div className="mt-4 grid gap-3">
                                            {pendingPayments.slice(0, 1).map((payment) => (
                                                <div
                                                    key={payment.id}
                                                    className="rounded-xl border border-slate-200 p-4"
                                                >
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {payment.id}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {payment.method}
                                                    </p>
                                                    <p className="mt-1 text-sm text-indigo-600">
                                                        {formatCurrency(payment.amount)}
                                                    </p>
                                                </div>
                                            ))}
                                            {pendingPayments.length === 0 && (
                                                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                                    No payments awaiting verification.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === 'approvals' && (
                            <>
                                <div className="max-w-[860px] space-y-6">
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900">
                                            Product Approvals
                                        </h1>
                                        <p className="text-sm text-slate-500">
                                            Review and approve seller product submissions
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-sm text-slate-500">Pending Review</p>
                                            <p className="mt-2 text-2xl font-semibold text-amber-600">
                                                {approvals.length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-sm text-slate-500">Approved</p>
                                            <p className="mt-2 text-2xl font-semibold text-emerald-600">
                                                {approvedProducts.length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-sm text-slate-500">Rejected</p>
                                            <p className="mt-2 text-2xl font-semibold text-red-600">
                                                {rejectedProductsCount}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">
                                            Pending Approval
                                        </h2>
                                    </div>

                                    {approvals.length > 0 ? (
                                        <div className="max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                            <img
                                                src={approvals[0].image}
                                                alt={approvals[0].name}
                                                className="h-32 w-full object-cover"
                                            />
                                            <div className="space-y-2 p-4">
                                                <h3 className="text-base font-semibold text-slate-900">
                                                    {approvals[0].name}
                                                </h3>
                                                <p className="line-clamp-2 text-sm text-slate-500">
                                                    {approvals[0].description}
                                                </p>
                                                <div className="mt-4 grid gap-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Seller</span>
                                                        <span className="font-semibold text-slate-900">
                                                            {approvals[0].seller}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Category</span>
                                                        <span className="font-semibold text-slate-900">
                                                            {approvals[0].category}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Price</span>
                                                        <span className="font-semibold text-indigo-600">
                                                            {formatCurrency(approvals[0].price)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Stock</span>
                                                        <span className="font-semibold text-slate-900">
                                                            {approvals[0].stock}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApprove(approvals[0].id)}
                                                        disabled={approvingProductId === approvals[0].id}
                                                        className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {approvingProductId === approvals[0].id ? 'Approving...' : 'Approve'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReject(approvals[0].id)}
                                                        className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                            No products awaiting approval.
                                        </div>
                                    )}

                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">
                                            Approved Products
                                        </h2>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {approvedProducts.map((item) => (
                                            <div
                                                key={item.id}
                                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-40 w-full object-cover"
                                                />
                                                <div className="space-y-2 p-4">
                                                    <h3 className="text-base font-semibold text-slate-900">
                                                        {item.name}
                                                    </h3>
                                                    <p className="line-clamp-2 text-sm text-slate-500">
                                                        {item.description}
                                                    </p>
                                                    <div className="mt-3 grid gap-1 text-sm">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-500">Seller</span>
                                                            <span className="font-semibold text-slate-900">
                                                                {item.seller}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-500">Category</span>
                                                            <span className="font-semibold text-slate-900">
                                                                {item.category}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-500">Price</span>
                                                            <span className="font-semibold text-indigo-600">
                                                                {formatCurrency(item.price)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-500">Stock</span>
                                                            <span className="font-semibold text-slate-900">
                                                                {item.stock}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === 'payments' && (
                            <>
                                <div className="max-w-[860px] space-y-6">
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900">
                                            Payment Verification
                                        </h1>
                                        <p className="text-sm text-slate-500">
                                            Review and verify customer payments
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-sm text-slate-500">Pending Verification</p>
                                            <p className="mt-2 text-2xl font-semibold text-amber-600">
                                                {pendingPayments.length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-sm text-slate-500">Verified</p>
                                            <p className="mt-2 text-2xl font-semibold text-emerald-600">
                                                {verifiedPayments.length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-sm text-slate-500">Rejected</p>
                                            <p className="mt-2 text-2xl font-semibold text-red-600">
                                                {rejectedPaymentsCount}
                                            </p>
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
                                                <h3 className="text-base font-semibold text-slate-900">
                                                    {pendingPayments[0].id}
                                                </h3>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        methodBadgeStyles[
                                                            pendingPayments[0].method.toLowerCase()
                                                        ] ?? 'bg-slate-950 text-white'
                                                    }`}
                                                >
                                                    {pendingPayments[0].method.toUpperCase()}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-sm text-slate-500">
                                                {pendingPayments[0].dateLabel}
                                            </p>

                                            <div className="mt-5 grid gap-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">Customer</span>
                                                    <span className="font-semibold text-slate-900">
                                                        {pendingPayments[0].customer}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">Amount</span>
                                                        <span className="text-xl font-semibold text-indigo-600">
                                                        {formatCurrency(pendingPayments[0].amount)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">Reference</span>
                                                    <span className="font-semibold text-slate-900">
                                                        {pendingPayments[0].reference}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-xl bg-slate-100 p-3">
                                                <p className="text-xs text-slate-500">Payment Notes</p>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {pendingPayments[0].notes}
                                                </p>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleVerifyPayment(pendingPayments[0].paymentId)
                                                    }
                                                    className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRejectPayment(pendingPayments[0].paymentId)
                                                    }
                                                    className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                            No payments pending verification.
                                        </div>
                                    )}

                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">
                                            Recently Verified
                                        </h2>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {verifiedPayments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-base font-semibold text-slate-900">
                                                        {payment.id}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            methodBadgeStyles[
                                                                payment.method.toLowerCase()
                                                            ] ?? 'bg-slate-950 text-white'
                                                        }`}
                                                    >
                                                        {payment.method.toUpperCase()}
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-sm text-slate-500">
                                                    {payment.dateLabel}
                                                </p>

                                                <div className="mt-5 grid gap-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Customer</span>
                                                        <span className="font-semibold text-slate-900">
                                                            {payment.customer}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Amount</span>
                                                        <span className="text-xl font-semibold text-indigo-600">
                                                            {formatCurrency(payment.amount)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Reference</span>
                                                        <span className="font-semibold text-slate-900">
                                                            {payment.reference}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 rounded-xl bg-slate-100 p-3">
                                                    <p className="text-xs text-slate-500">Payment Notes</p>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {payment.notes}
                                                    </p>
                                                </div>

                                                {payment.verifiedOn && (
                                                    <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                                                        {payment.verifiedOn}
                                                    </div>
                                                )}

                                                {payment.verificationNotes && (
                                                    <div className="mt-3 rounded-xl bg-slate-100 p-3">
                                                        <p className="text-xs text-slate-500">
                                                            Verification Notes
                                                        </p>
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {payment.verificationNotes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === 'tickets' && (
                            <>
                                <div className="max-w-[860px] space-y-6">
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900">
                                            Support Tickets
                                        </h1>
                                        <p className="text-sm text-slate-500">
                                            Manage customer support requests
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-sm text-slate-500">Open Tickets</p>
                                            <p className="mt-2 text-2xl font-semibold text-amber-600">
                                                {
                                                    tickets.filter((ticket) => ticket.status === 'open')
                                                        .length
                                                }
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-sm text-slate-500">In Progress</p>
                                            <p className="mt-2 text-2xl font-semibold text-indigo-600">
                                                {
                                                    tickets.filter(
                                                        (ticket) =>
                                                            ticket.status === 'in_progress',
                                                    ).length
                                                }
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-sm text-slate-500">Resolved</p>
                                            <p className="mt-2 text-2xl font-semibold text-emerald-600">
                                                {
                                                    tickets.filter(
                                                        (ticket) => ticket.status === 'resolved',
                                                    ).length
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">
                                            Open Tickets
                                        </h2>
                                    </div>

                                    {tickets
                                        .filter((ticket) => ticket.status === 'open')
                                        .map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-semibold text-slate-900">
                                                        {ticket.id}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[ticket.priority]}`}
                                                    >
                                                        {ticket.priority}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${ticketStyles[ticket.status]}`}
                                                    >
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {ticket.subject}
                                                </p>
                                                <p className="mt-4 text-sm text-slate-700">
                                                    {ticket.message}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                                                    <span>by {ticket.customer}</span>
                                                    <span>{ticket.date}</span>
                                                </div>
                                                <div className="mt-3 border-t border-slate-100 pt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResolveTicket(ticket.ticketId)}
                                                        className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white"
                                                    >
                                                        Mark as Resolved
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">
                                            Recently Resolved
                                        </h2>
                                    </div>

                                    {tickets
                                        .filter((ticket) => ticket.status === 'resolved')
                                        .map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-semibold text-slate-900">
                                                        {ticket.id}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[ticket.priority]}`}
                                                    >
                                                        {ticket.priority}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${ticketStyles[ticket.status]}`}
                                                    >
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {ticket.subject}
                                                </p>
                                                <p className="mt-4 text-sm text-slate-700">
                                                    {ticket.preview}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                                                    <span>by {ticket.customer}</span>
                                                    <span>{ticket.date}</span>
                                                </div>
                                                {ticket.relatedOrder && (
                                                    <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500">
                                                        Related Order:{' '}
                                                        <span className="font-semibold text-slate-900">
                                                            {ticket.relatedOrder}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
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
