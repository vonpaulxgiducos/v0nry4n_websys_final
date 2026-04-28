import { Head, router, usePage } from '@inertiajs/react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import ProfileInformationForm from '@/components/profile-information-form';
import ThemeSwitch from '@/components/theme-switch';
import UpdatePasswordForm from '@/components/update-password-form';
import { type SharedData } from '@/types';

type SectionId =
    | 'dashboard'
    | 'approvals'
    | 'payments'
    | 'revenue_history'
    | 'tickets'
    | 'settings';

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
    customerPhone?: string;
    dateLabel: string;
    reference: string;
    notes: string;
    status: 'pending' | 'verified' | 'rejected';
    verifiedOn?: string;
    verificationNotes?: string;
    isArchived?: boolean;
};

type TicketItem = {
    ticketId?: number;
    id: string;
    subject: string;
    preview: string;
    message: string;
    customer: string;
    date: string;
    priority: 'low' | 'high';
    status: 'open' | 'in_progress' | 'resolved';
    relatedOrder?: string;
};

type AdminDashboardPageProps = {
    initialApprovals?: ApprovalItem[];
    initialApprovedProducts?: ApprovalItem[];
    initialPendingPayments?: PaymentItem[];
    initialVerifiedPayments?: PaymentItem[];
    initialRejectedPayments?: PaymentItem[];
    initialRevenueHistory?: PaymentItem[];
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
        label: 'Total Verification',
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
        priority: 'high',
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
    open: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-100',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-100',
    resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
};

const priorityStyles: Record<TicketItem['priority'], string> = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-100',
    high: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-100',
};

const methodBadgeStyles: Record<string, string> = {
    gcash: 'bg-slate-950 text-white',
    'bank transfer': 'bg-slate-950 text-white',
};

const getInitialSectionFromUrl = (url: string): SectionId => {
    const query = url.split('?')[1] ?? '';
    const sectionParam = new URLSearchParams(query).get('section');

    if (
        sectionParam === 'dashboard'
        || sectionParam === 'approvals'
        || sectionParam === 'payments'
        || sectionParam === 'revenue_history'
        || sectionParam === 'tickets'
        || sectionParam === 'settings'
    ) {
        return sectionParam;
    }

    return 'dashboard';
};

export default function AdminDashboard({
    initialApprovals = [],
    initialApprovedProducts = [],
    initialPendingPayments = [],
    initialVerifiedPayments = [],
    initialRejectedPayments = [],
    initialRevenueHistory = [],
    initialTickets = [],
    stats: statsFromServer,
    platformRevenue = 0,
    activeProducts = 0,
}: AdminDashboardPageProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const profileData = page.props.profileData;
    const userType = page.props.userType;
    const accountName = String(auth.user.name || auth.user.username || 'Admin');
    const firstName = accountName.trim().split(/\s+/)[0] || 'Admin';
    const [activeSection, setActiveSection] = useState<SectionId>(getInitialSectionFromUrl(page.url));
    const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);
    const [approvedProducts, setApprovedProducts] =
        useState<ApprovalItem[]>(initialApprovedProducts);
    const [approvingProductId, setApprovingProductId] = useState<string | null>(null);
    const [withdrawingProductId, setWithdrawingProductId] = useState<string | null>(null);
    const [rejectedProductsCount, setRejectedProductsCount] = useState(0);
    const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'none'>('name-asc');
    const [pendingPayments, setPendingPayments] =
        useState<PaymentItem[]>(initialPendingPayments);
    const [verifiedPayments, setVerifiedPayments] =
        useState<PaymentItem[]>(initialVerifiedPayments);
    const [rejectedPayments, setRejectedPayments] =
        useState<PaymentItem[]>(initialRejectedPayments);
    const [revenueHistory, setRevenueHistory] =
        useState<PaymentItem[]>(initialRevenueHistory);
    const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);
    const [isDateDescending, setIsDateDescending] = useState(false);
    const [category, setCategory] = useState('All Categories');
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

    const handleWithdraw = (id: string) => {
        const productId = id.replace('APP-', '');

        if (!productId) {
            return;
        }

        setWithdrawingProductId(id);
        router.post(
            `/admin/products/${productId}/withdraw`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setApprovedProducts((approved) => {
                        return approved.filter((p) => p.id !== id);
                    });
                    setWithdrawingProductId(null);
                },
                onError: () => {
                    setWithdrawingProductId(null);
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
            },
        );
    };

    const handleArchiveRevenuePayment = (paymentId?: number) => {
        if (!paymentId) {
            return;
        }

        router.patch(
            `/admin/payments/${paymentId}/archive`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const handleUnarchiveRevenuePayment = (paymentId?: number) => {
        if (!paymentId) {
            return;
        }

        router.patch(
            `/admin/payments/${paymentId}/unarchive`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const handleDeleteRevenuePayment = (paymentId?: number) => {
        if (!paymentId) {
            return;
        }

        if (!window.confirm('Delete this revenue record from admin view?')) {
            return;
        }

        router.delete(`/admin/payments/${paymentId}`, {
            preserveScroll: true,
            preserveState: false,
        });
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

    const handleDeleteTicket = (ticketId?: number) => {
        if (!ticketId) {
            return;
        }

        if (!window.confirm('Delete this support ticket from admin view?')) {
            return;
        }

        router.delete(`/admin/tickets/${ticketId}`, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
                <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white shadow-sm">
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
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Admin Control Center</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <ThemeSwitch />
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                    {firstName}
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div
                    className={`mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-8 py-12 transition-[grid-template-columns] duration-200 ${
                        isSidebarCollapsed ? 'md:grid-cols-[100px_1fr]' : 'md:grid-cols-[320px_1fr]'
                    }`}
                >
                    <aside className="self-start rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 md:sticky md:top-24">
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
                                const isApprovals = item.id === 'approvals';
                                const isPayments = item.id === 'payments';
                                const isRevenueHistory = item.id === 'revenue_history';
                                const isTickets = item.id === 'tickets';

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveSection(item.id)}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <span
                                            className={`grid h-5 w-5 place-items-center rounded ${
                                                isActive
                                                    ? 'text-purple-600 dark:text-purple-300'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}
                                        >
                                            {item.icon}
                                        </span>
                                        {!isSidebarCollapsed && (
                                            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                                <span className="truncate">{item.label}</span>
                                                {(isApprovals || isPayments || isRevenueHistory || isTickets) && (
                                                    <span className="flex items-center gap-1">
                                                        {isApprovals && approvals.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-slate-500 px-2 py-0.5 text-xs font-bold text-white">
                                                                {approvals.length}
                                                            </span>
                                                        )}
                                                        {isPayments && pendingPayments.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                                                                {pendingPayments.length}
                                                            </span>
                                                        )}
                                                        {isRevenueHistory && revenueHistory.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-slate-500 px-2 py-0.5 text-xs font-bold text-white">
                                                                {revenueHistory.length}
                                                            </span>
                                                        )}
                                                        {isTickets && tickets.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-slate-500 px-2 py-0.5 text-xs font-bold text-white">
                                                                {tickets.length}
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
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                            activeSection === 'settings'
                                                ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                                        } ${
                                            isSidebarCollapsed ? 'justify-center' : ''
                                        }`}
                                    >
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                        {!isSidebarCollapsed && 'Settings'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className={`flex items-center gap-3 rounded-xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-200 hover:text-rose-900 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-slate-700 dark:hover:text-rose-300 ${
                                            isSidebarCollapsed ? 'justify-center' : ''
                                        }`}
                                    >
                                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

                    <section className="min-w-0 space-y-6 dark:[&_.bg-white]:bg-slate-900 dark:[&_.border-slate-200]:border-slate-700 dark:[&_.text-slate-900]:text-slate-100 dark:[&_.text-slate-600]:text-slate-300 dark:[&_.text-slate-500]:text-slate-400 dark:[&_.bg-slate-100]:bg-slate-800 dark:shadow-lg">
                        {activeSection === 'dashboard' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Welcome, {firstName}!
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Manage products, payments, and support
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {stats.map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700"
                                        >
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
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
                                            <p className={`mt-2 text-2xl font-semibold ${stat.label === 'Total Orders' ? 'text-green-400' : 'text-slate-900 dark:text-white'}`}>
                                                {stat.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            <span className="text-emerald-500">$
                                            </span>
                                            Platform Revenue
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            Total transaction value
                                        </p>
                                        <p className="mt-4 text-2xl font-semibold text-emerald-400 dark:text-emerald-300">
                                            {formatCurrency(platformRevenue)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
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
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            Approved and available products
                                        </p>
                                        <p className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
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
                                                    <p className="mt-1 text-sm text-violet-400 dark:text-violet-300">
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
                                                    <p className="mt-1 text-sm text-violet-400 dark:text-violet-300">
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
                                <div className="max-w-215 space-y-6">
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900">
                                            Product Approvals
                                        </h1>
                                        <p className="text-sm text-slate-500">
                                            Review and approve seller product submissions
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Pending Review</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                                {approvals.length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
                                            <p className="mt-2 text-2xl font-semibold text-emerald-400 dark:text-emerald-300">
                                                {approvedProducts.length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Rejected</p>
                                            <p className="mt-2 text-2xl font-semibold text-red-400 dark:text-red-300">
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
                                                        <span className="font-semibold text-violet-400 dark:text-violet-300">
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

                                    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                                        <div className="flex flex-wrap gap-1.5">
                                            {(['All Categories', 'Guitars', 'Keyboards', 'Drums', 'Accessories', 'Music Sheets', 'Music Books'] as const).map((option) => {
                                                const isActive = category === option;

                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => setCategory(option)}
                                                        className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                                                            isActive
                                                                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {([
                                            { key: 'name-asc', label: 'A-Z' },
                                            { key: 'name-desc', label: 'Z-A' },
                                            { key: 'price-asc', label: 'Price: Low to High' },
                                            { key: 'price-desc', label: 'Price: High to Low' },
                                        ] as const).map((option) => (
                                            <button
                                                key={option.key}
                                                type="button"
                                                onClick={() => setSortBy(option.key)}
                                                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                                                    sortBy === option.key
                                                        ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsDateDescending(false)}
                                            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                                                !isDateDescending
                                                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            Latest
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsDateDescending(true)}
                                            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                                                isDateDescending
                                                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            Oldest
                                        </button>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {approvedProducts.filter(p => category === 'All Categories' || p.category === category).map((p, i) => ({ product: p, index: i })).sort((a, b) => {
                                            const defaultSort = (() => {
                                                if (sortBy === 'name-asc') return a.product.name.localeCompare(b.product.name);
                                                if (sortBy === 'name-desc') return b.product.name.localeCompare(a.product.name);
                                                if (sortBy === 'price-asc') return a.product.price - b.product.price;
                                                if (sortBy === 'price-desc') return b.product.price - a.product.price;
                                                return 0;
                                            })();
                                            if (defaultSort !== 0) return defaultSort;
                                            return isDateDescending ? b.index - a.index : a.index - b.index;
                                        }).map(({ product: item }) => (
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
                                                            <span className="font-semibold text-violet-400 dark:text-violet-300">
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
                                                    <button
                                                        type="button"
                                                        onClick={() => handleWithdraw(item.id)}
                                                        disabled={withdrawingProductId === item.id}
                                                        className="mt-3 w-full rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-orange-600"
                                                    >
                                                        {withdrawingProductId === item.id ? 'Withdrawing...' : 'Withdraw Approval'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === 'payments' && (
                            <>
                                <div className="max-w-215 space-y-6">
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900">
                                            Total Verification
                                        </h1>
                                        <p className="text-sm text-slate-500">
                                            Review and verify customer payments
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Pending Verification</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                                {pendingPayments.length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Verified</p>
                                            <p className="mt-2 text-2xl font-semibold text-emerald-400 dark:text-emerald-300">
                                                {verifiedPayments.length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Rejected</p>
                                            <p className="mt-2 text-2xl font-semibold text-red-400 dark:text-red-300">
                                                {rejectedPayments.length}
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
                                                    <span className="text-slate-500">Customer Phone</span>
                                                    <span className="font-semibold text-slate-900">
                                                        {pendingPayments[0].customerPhone ?? '—'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">Amount</span>
                                                        <span className="text-xl font-semibold text-slate-900 dark:text-white">
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
                                                        <span className="text-slate-500">Customer Phone</span>
                                                        <span className="font-semibold text-slate-900">
                                                            {payment.customerPhone ?? '—'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Amount</span>
                                                        <span className="text-xl font-semibold text-slate-900 dark:text-white">
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

                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900">
                                            Recently Rejected
                                        </h2>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {rejectedPayments.map((payment) => (
                                            <div
                                                key={`rejected-${payment.id}-${payment.paymentId}`}
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
                                                        <span className="text-slate-500">Customer Phone</span>
                                                        <span className="font-semibold text-slate-900">
                                                            {payment.customerPhone ?? '—'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Amount</span>
                                                        <span className="text-xl font-semibold text-slate-900 dark:text-white">
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

                                                <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
                                                    Rejected
                                                </div>

                                                {payment.verificationNotes && (
                                                    <div className="mt-3 rounded-xl bg-slate-100 p-3">
                                                        <p className="text-xs text-slate-500">
                                                            Rejection Notes
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

                        {activeSection === 'revenue_history' && (
                            <>
                                <div className="max-w-215 space-y-6">
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900">
                                            Revenue History
                                        </h1>
                                        <p className="text-sm text-slate-500">
                                            Track all verified revenue records
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Records</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                                {revenueHistory.length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Archived</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                                {revenueHistory.filter((item) => item.isArchived).length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Visible</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                                {revenueHistory.filter((item) => !item.isArchived).length}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {revenueHistory
                                            .filter((payment) => !payment.isArchived)
                                            .map((payment) => (
                                                <div
                                                    key={`revenue-${payment.id}-${payment.paymentId}`}
                                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
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
                                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{payment.dateLabel}</p>
                                                    <div className="mt-4 grid gap-1 text-sm">
                                                        <p>Customer: <span className="font-semibold text-slate-900 dark:text-slate-100">{payment.customer}</span></p>
                                                        <p>Amount: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</span></p>
                                                        <p>Reference: <span className="font-semibold text-slate-900 dark:text-slate-100">{payment.reference}</span></p>
                                                        <p>Status: <span className="font-semibold text-emerald-700 dark:text-emerald-400">Verified</span></p>
                                                        <p>Archive: <span className="font-semibold text-slate-900 dark:text-slate-100">Visible</span></p>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleArchiveRevenuePayment(payment.paymentId)}
                                                            className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900"
                                                        >
                                                            Archive
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteRevenuePayment(payment.paymentId)}
                                                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400 dark:hover:bg-rose-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                        {revenueHistory.some((item) => item.isArchived) && (
                                            <div className="col-span-full flex items-center gap-4">
                                                <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
                                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Archived Records</p>
                                                <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
                                            </div>
                                        )}

                                        {revenueHistory
                                            .filter((payment) => payment.isArchived)
                                            .map((payment) => (
                                                <div
                                                    key={`revenue-${payment.id}-${payment.paymentId}`}
                                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm opacity-75 dark:border-slate-700 dark:bg-slate-800"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
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
                                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{payment.dateLabel}</p>
                                                    <div className="mt-4 grid gap-1 text-sm">
                                                        <p>Customer: <span className="font-semibold text-slate-900 dark:text-slate-100">{payment.customer}</span></p>
                                                        <p>Amount: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</span></p>
                                                        <p>Reference: <span className="font-semibold text-slate-900 dark:text-slate-100">{payment.reference}</span></p>
                                                        <p>Status: <span className="font-semibold text-emerald-700 dark:text-emerald-400">Verified</span></p>
                                                        <p>Archive: <span className="font-semibold text-slate-900 dark:text-slate-100">Archived</span></p>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUnarchiveRevenuePayment(payment.paymentId)}
                                                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                                        >
                                                            Unarchive
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteRevenuePayment(payment.paymentId)}
                                                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400 dark:hover:bg-rose-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>

                                    {revenueHistory.length === 0 && (
                                        <div className="max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                            No revenue history records yet.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeSection === 'tickets' && (
                            <>
                                <div className="max-w-215 space-y-6">
                                    <div>
                                        <h1 className="text-2xl font-semibold text-slate-900">
                                            Support Tickets
                                        </h1>
                                        <p className="text-sm text-slate-500">
                                            Manage customer support requests
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Open Tickets</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                                {
                                                    tickets.filter((ticket) => ticket.status === 'open')
                                                        .length
                                                }
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
                                            <p className="mt-2 text-2xl font-semibold text-yellow-400">
                                                {
                                                    tickets.filter(
                                                        (ticket) =>
                                                            ticket.status === 'in_progress',
                                                    ).length
                                                }
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Resolved</p>
                                            <p className="mt-2 text-2xl font-semibold text-green-400">
                                                {
                                                    tickets.filter(
                                                        (ticket) => ticket.status === 'resolved',
                                                    ).length
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                            Open Tickets
                                        </h2>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsDateDescending(false)}
                                            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                                                !isDateDescending
                                                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            Latest
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsDateDescending(true)}
                                            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                                                isDateDescending
                                                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            Oldest
                                        </button>
                                    </div>

                                    {tickets
                                        .filter((ticket) => ticket.status === 'open')
                                        .sort((a, b) => {
                                            const dateA = new Date(a.date).getTime();
                                            const dateB = new Date(b.date).getTime();
                                            return isDateDescending ? dateB - dateA : dateA - dateB;
                                        })
                                        .map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                                        {ticket.id}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${ticketStyles[ticket.status]}`}
                                                    >
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                    {ticket.subject}
                                                </p>
                                                <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
                                                    {ticket.message}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                                                    <span>by {ticket.customer}</span>
                                                    <span>{ticket.date}</span>
                                                </div>
                                                <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResolveTicket(ticket.ticketId)}
                                                        className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white dark:bg-emerald-700 dark:hover:bg-emerald-600"
                                                    >
                                                        Mark as Resolved
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                            Recently Resolved
                                        </h2>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {tickets
                                            .filter((ticket) => ticket.status === 'resolved')
                                            .map((ticket) => (
                                                <div
                                                    key={ticket.id}
                                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                                                >
                                                    <div>
                                                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                                            {ticket.id}
                                                        </h3>
                                                    </div>
                                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{ticket.date}</p>
                                                    <div className="mt-4 grid gap-1 text-sm">
                                                        <p>Subject: <span className="font-semibold text-slate-900 dark:text-slate-100">{ticket.subject}</span></p>
                                                        <p>Customer: <span className="font-semibold text-slate-900 dark:text-slate-100">{ticket.customer}</span></p>
                                                        <p>Status: <span className="font-semibold text-emerald-700 dark:text-emerald-400">Resolved</span></p>
                                                        {ticket.relatedOrder && (
                                                            <p>Related Order: <span className="font-semibold text-slate-900 dark:text-slate-100">{ticket.relatedOrder}</span></p>
                                                        )}
                                                    </div>
                                                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                                                        {ticket.preview}
                                                    </p>
                                                    <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteTicket(ticket.ticketId)}
                                                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400 dark:hover:bg-rose-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
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
