import { Head, usePage, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { type SharedData } from '@/types';

type SectionId = 'dashboard' | 'browse' | 'cart' | 'orders' | 'support';

type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'Guitars' | 'Keyboards' | 'Accessories' | 'Studio' | 'Drums';
    image: string;
};

type CartItem = Product & { quantity: number };

const stats = [
    { label: 'Total Orders', value: '3' },
    { label: 'Pending Orders', value: '1' },
    { label: 'In Transit', value: '1' },
    { label: 'Available Products', value: '7' },
];

const orders = [
    {
        id: 'ORD-2024-00001',
        store: 'Music Hub Philippines',
        amount: 'P8,750',
        status: 'delivered',
    },
    {
        id: 'ORD-2024-00002',
        store: 'Guitar World Manila',
        amount: 'P45,500',
        status: 'shipped',
    },
    {
        id: 'ORD-2024-00003',
        store: 'Music Hub Philippines',
        amount: 'P12,800',
        status: 'pending',
    },
];

const statusStyles: Record<string, string> = {
    delivered: 'bg-emerald-100 text-emerald-700',
    shipped: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
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
        id: 'browse',
        label: 'Browse Products',
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
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h10" />
            </svg>
        ),
    },
    {
        id: 'cart',
        label: 'Shopping Cart',
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
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.4 12.2a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
        ),
    },
    {
        id: 'orders',
        label: 'My Orders',
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
        id: 'support',
        label: 'Support',
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

const products: Product[] = [
    {
        id: 'prod-001',
        name: 'Yamaha F310 Acoustic Guitar',
        description: 'Full-size dreadnought body with a warm, balanced tone.',
        price: 8750,
        category: 'Guitars',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-002',
        name: 'Fender Stratocaster Electric Guitar',
        description: 'Iconic single-coil pickups with versatile modern tone.',
        price: 45500,
        category: 'Guitars',
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-003',
        name: 'Casio CT-S300 Keyboard',
        description: '61-key portable keyboard with 400 tones and 77 rhythms.',
        price: 12800,
        category: 'Keyboards',
        image: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-004',
        name: 'Roland TD-07 Drum Kit',
        description: 'Quiet electronic kit with expressive mesh heads.',
        price: 38900,
        category: 'Drums',
        image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-005',
        name: 'Focusrite Scarlett 2i2',
        description: 'Studio-grade interface for vocals and instrument tracks.',
        price: 10900,
        category: 'Studio',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-006',
        name: 'Ernie Ball Regular Slinky Strings',
        description: 'Nickel wound strings for electric guitars.',
        price: 450,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=900&q=80',
    },
];

const orderHistory = [
    {
        id: 'ORD-2024-00011',
        items: 2,
        total: 9150,
        date: 'Mar 12, 2024',
        status: 'delivered',
    },
    {
        id: 'ORD-2024-00014',
        items: 1,
        total: 12800,
        date: 'Apr 05, 2024',
        status: 'shipped',
    },
    {
        id: 'ORD-2024-00018',
        items: 3,
        total: 46350,
        date: 'Apr 21, 2024',
        status: 'pending',
    },
];

const faqs = [
    {
        question: 'How long does delivery take within Mindanao?',
        answer: 'Standard delivery is 3-5 business days after order confirmation.',
    },
    {
        question: 'Can I return an instrument after delivery?',
        answer: 'Yes. Returns are accepted within 7 days for unused items.',
    },
    {
        question: 'Do you offer COD payment?',
        answer: 'COD is available for select areas in CARAGA and Davao.',
    },
];

const categories = ['All', 'Guitars', 'Keyboards', 'Accessories', 'Studio', 'Drums'];

const formatCurrency = (value: number) =>
    `P${value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function Dashboard() {
    const { auth } = usePage().props as SharedData;
    const [activeSection, setActiveSection] = useState<SectionId>('browse');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketMessage, setTicketMessage] = useState('');
    const [ticketSubmitted, setTicketSubmitted] = useState(false);

    const filteredProducts = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return products.filter((product) => {
            const matchesCategory =
                category === 'All' || product.category === category;
            const matchesSearch =
                !keyword ||
                product.name.toLowerCase().includes(keyword) ||
                product.description.toLowerCase().includes(keyword);

            return matchesCategory && matchesSearch;
        });
    }, [category, search]);

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleAddToCart = (product: Product) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);

            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const handleRemoveFromCart = (productId: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const handleUpdateQuantity = (productId: string, delta: number) => {
        setCartItems((prev) =>
            prev
                .map((item) =>
                    item.id === productId
                        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                        : item,
                )
                .filter((item) => item.quantity > 0),
        );
    };

    const cartSubtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [cartItems],
    );

    const handleTicketSubmit = () => {
        if (!ticketSubject.trim() || !ticketMessage.trim()) {
            return;
        }

        setTicketSubmitted(true);
        setTicketSubject('');
        setTicketMessage('');
    };

    return (
        <>
            <Head title="Customer Dashboard" />
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
                                <p className="text-xs text-slate-500">
                                    Customer Dashboard
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {auth.user.user_type.replace('_', ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </p>
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
                                        Welcome, {auth.user.name.split(' ')[0]}!
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Manage your orders and browse musical instruments
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

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Recent Orders
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Your latest purchases
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
                                                        {order.store}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {order.amount}
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

                        {activeSection === 'browse' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Browse Products
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Discover musical instruments and accessories
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
                                    <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="h-4 w-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Search products..."
                                            className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                                        />
                                    </div>
                                    <select
                                        value={category}
                                        onChange={(event) => setCategory(event.target.value)}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                                    >
                                        {categories.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-48 w-full object-cover"
                                                />
                                                <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                                    {product.category}
                                                </span>
                                            </div>
                                            <div className="space-y-2 p-4">
                                                <h3 className="text-base font-semibold text-slate-900">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    {product.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-semibold text-slate-900">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddToCart(product)}
                                                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                                    >
                                                        Add to cart
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                                            No products match your search.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeSection === 'cart' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Shopping Cart
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Review your selected items before checkout
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    {cartItems.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                            Your cart is empty. Add items from Browse Products.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {cartItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-16 w-16 rounded-xl object-cover"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {item.category}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleUpdateQuantity(
                                                                    item.id,
                                                                    -1,
                                                                )
                                                            }
                                                            className="h-8 w-8 rounded-full border border-slate-200 text-sm font-semibold text-slate-600"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-sm font-semibold text-slate-700">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleUpdateQuantity(
                                                                    item.id,
                                                                    1,
                                                                )
                                                            }
                                                            className="h-8 w-8 rounded-full border border-slate-200 text-sm font-semibold text-slate-600"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {formatCurrency(
                                                                item.price * item.quantity,
                                                            )}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveFromCart(item.id)
                                                            }
                                                            className="text-xs font-semibold text-red-500"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                                                <span>Subtotal</span>
                                                <span>{formatCurrency(cartSubtotal)}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                            >
                                                Proceed to checkout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeSection === 'orders' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        My Orders
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Track purchases and delivery updates
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="grid gap-4">
                                        {orderHistory.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex flex-col gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {order.id}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {order.items} items · {order.date}
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSection === 'support' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        Support Center
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Get help with orders, payments, and returns
                                    </p>
                                </div>

                                <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Frequently Asked Questions
                                        </h2>
                                        <div className="mt-4 grid gap-4">
                                            {faqs.map((faq) => (
                                                <div key={faq.question} className="space-y-1">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {faq.question}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Submit a ticket
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Our support team replies within 24 hours.
                                        </p>
                                        <div className="mt-4 grid gap-3">
                                            <input
                                                type="text"
                                                value={ticketSubject}
                                                onChange={(event) => {
                                                    setTicketSubmitted(false);
                                                    setTicketSubject(event.target.value);
                                                }}
                                                placeholder="Subject"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                                            />
                                            <textarea
                                                value={ticketMessage}
                                                onChange={(event) => {
                                                    setTicketSubmitted(false);
                                                    setTicketMessage(event.target.value);
                                                }}
                                                rows={4}
                                                placeholder="Describe your concern"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleTicketSubmit}
                                                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                            >
                                                Send ticket
                                            </button>
                                            {ticketSubmitted && (
                                                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                                                    Ticket sent. We will email you updates shortly.
                                                </div>
                                            )}
                                        </div>
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
