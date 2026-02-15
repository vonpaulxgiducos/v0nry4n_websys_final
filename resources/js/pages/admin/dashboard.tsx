import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { type SharedData } from '@/types';

type SectionId =
    | 'dashboard'
    | 'approvals'
    | 'payments'
    | 'tickets';

type ApprovalItem = {
    id: string;
    name: string;
    seller: string;
    price: number;
};

type PaymentItem = {
    id: string;
    method: string;
    amount: number;
    customer: string;
};

type TicketItem = {
    id: string;
    subject: string;
    customer: string;
    status: 'open' | 'in_progress' | 'resolved';
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

const initialApprovals: ApprovalItem[] = [
    {
        id: 'APP-001',
        name: 'Ibanez RG Series Electric Guitar',
        seller: 'Guitar World Manila',
        price: 38000,
    },
    {
        id: 'APP-002',
        name: 'Roland TD-07 Drum Kit',
        seller: 'Beat Box Cebu',
        price: 38900,
    },
];

const initialPayments: PaymentItem[] = [
    {
        id: 'ORD-2024-00003',
        method: 'GCash',
        amount: 12800,
        customer: 'John Doe',
    },
];

const initialTickets: TicketItem[] = [
    {
        id: 'TKT-202402-00012',
        subject: 'Payment confirmation delay',
        customer: 'Mia Santos',
        status: 'open',
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

export default function AdminDashboard() {
    const { auth } = usePage().props as SharedData;
    const [activeSection, setActiveSection] = useState<SectionId>('dashboard');
    const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);
    const [payments, setPayments] = useState<PaymentItem[]>(initialPayments);
    const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);

    const stats = useMemo(() => {
        return [
            { label: 'Pending Products', value: approvals.length.toString() },
            { label: 'Pending Payments', value: payments.length.toString() },
            {
                label: 'Open Tickets',
                value: tickets.filter((ticket) => ticket.status !== 'resolved')
                    .length
                    .toString(),
            },
            { label: 'Total Orders', value: '3' },
        ];
    }, [approvals.length, payments.length, tickets]);

    const platformRevenue = 67050;
    const activeProducts = 7;

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleApprove = (id: string) => {
        setApprovals((prev) => prev.filter((item) => item.id !== id));
    };

    const handleReject = (id: string) => {
        setApprovals((prev) => prev.filter((item) => item.id !== id));
    };

    const handleVerifyPayment = (id: string) => {
        setPayments((prev) => prev.filter((item) => item.id !== id));
    };

    const handleResolveTicket = (id: string) => {
        setTickets((prev) =>
            prev.map((ticket) =>
                ticket.id === id ? { ...ticket, status: 'resolved' } : ticket,
            ),
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
                                            {approvals.map((item) => (
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
                                            {payments.map((payment) => (
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
                                            {payments.length === 0 && (
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
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Product Approvals
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Review seller submissions
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="grid gap-4">
                                        {approvals.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-col gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {item.seller}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-slate-900">
                                                        {formatCurrency(item.price)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApprove(item.id)}
                                                        className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReject(item.id)}
                                                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {approvals.length === 0 && (
                                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                                No products awaiting approval.
                                            </div>
                                        )}
                                    </div>
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
                                        Confirm recent payment submissions
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="grid gap-4">
                                        {payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="flex flex-col gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {payment.id}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {payment.customer} · {payment.method}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-slate-900">
                                                        {formatCurrency(payment.amount)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerifyPayment(payment.id)}
                                                        className="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-semibold text-white"
                                                    >
                                                        Verify
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {payments.length === 0 && (
                                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                                No payments pending verification.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === 'tickets' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Support Tickets
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Monitor and resolve customer concerns
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="grid gap-4">
                                        {tickets.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className="flex flex-col gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {ticket.subject}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {ticket.customer} · {ticket.id}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            ticketStyles[ticket.status]
                                                        }`}
                                                    >
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                    {ticket.status !== 'resolved' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleResolveTicket(ticket.id)}
                                                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                                                        >
                                                            Resolve
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {tickets.length === 0 && (
                                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                                                No support tickets.
                                            </div>
                                        )}
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
