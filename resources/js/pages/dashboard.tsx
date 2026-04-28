import { Head, router, usePage } from '@inertiajs/react';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import ProfileInformationForm from '@/components/profile-information-form';
import ThemeSwitch from '@/components/theme-switch';
import UpdatePasswordForm from '@/components/update-password-form';
import { type SharedData } from '@/types';

type SectionId = 'dashboard' | 'browse' | 'cart' | 'orders' | 'history' | 'support' | 'settings';

type Product = {
    id: string;
    name: string;
    description: string;
    seller: string;
    stock: number;
    price: number;
    category: 'Guitars' | 'Keyboards' | 'Drums' | 'Accessories' | 'Music Sheets' | 'Music Books';
    image: string;
};

type DashboardOrder = {
    id: string;
    store: string;
    amount: string;
    paymentMethod: string;
    date: string;
    paymentStatus: 'verified' | 'pending';
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

type OrderLineItem = {
    name: string;
    meta?: string | null;
    quantity: number;
    amount: string;
};

type OrderDetail = {
    orderId: number;
    id: string;
    date: string;
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
    paymentStatus: 'verified' | 'pending';
    paymentMethod: string;
    items: OrderLineItem[];
    quantity: number;
    recipient: string;
    phone: string;
    address: string;
    courier: 'J&T Express' | 'LBC' | 'Ninja Van';
    subtotal: string;
    shippingFee: string;
    total: string;
    seller: string;
    sellerPhone?: string | null;
};

type Ticket = {
    id: string;
    subject: string;
    date: string;
    status: 'resolved' | 'open';
};

type CartItem = {
    product: Product;
    quantity: number;
};

type SiteNotification = {
    message: string;
    type: 'success' | 'warning';
};

type DashboardPageProps = {
    stats?: { label: string; value: string }[];
    dashboardOrders?: DashboardOrder[];
    products?: Product[];
    cartItems?: CartItem[];
    activeOrderDetails?: OrderDetail[];
    historyOrderDetails?: OrderDetail[];
    tickets?: Ticket[];
    faqs?: string[];
    checkoutDefaults?: {
        recipientName: string;
        phone: string;
        address: string;
        courier: 'J&T Express' | 'LBC' | 'Ninja Van';
    };
};

const navItems: { id: SectionId; label: string; icon: ReactNode }[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 8h8" />
                <path d="M9 3v3" />
                <path d="M15 3v3" />
            </svg>
        ),
    },
    {
        id: 'cart',
        label: 'Shopping Cart',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
            </svg>
        ),
    },
    {
        id: 'history',
        label: 'History',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 3v4h4" />
                <path d="M12 7v5l3 2" />
            </svg>
        ),
    },
    {
        id: 'support',
        label: 'Support',
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
            </svg>
        ),
    },
];

const defaultStats = [
    { label: 'Total Orders', value: '3' },
    { label: 'Pending Orders', value: '1' },
    { label: 'In Transit', value: '1' },
    { label: 'Available Products', value: '7' },
];

const defaultDashboardOrders: DashboardOrder[] = [
    { id: 'ORD-2024-00001', store: 'Music Hub Philippines', amount: '₱8,750', paymentMethod: 'Cash on Delivery', date: 'February 7, 2024', paymentStatus: 'verified', status: 'delivered' },
    { id: 'ORD-2024-00002', store: 'Guitar World Manila', amount: '₱45,500', paymentMethod: 'GCash', date: 'February 9, 2024', paymentStatus: 'verified', status: 'shipped' },
    { id: 'ORD-2024-00003', store: 'Music Hub Philippines', amount: '₱12,800', paymentMethod: 'Cash on Delivery', date: 'February 14, 2024', paymentStatus: 'pending', status: 'pending' },
];

const defaultProducts: Product[] = [
    {
        id: 'prod-001',
        name: 'Yamaha F310 Acoustic Guitar',
        description: 'Perfect for beginners. Full-size dreadnought body with a natural... ',
        seller: 'Music Hub Philippines',
        stock: 15,
        price: 8500,
        category: 'Guitars',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-002',
        name: 'Fender Stratocaster Electric Guitar',
        description: 'Classic electric guitar with three single-coil pickups. Versatile tone... ',
        seller: 'Guitar World Manila',
        stock: 8,
        price: 45000,
        category: 'Guitars',
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-003',
        name: 'Casio CT-S300 Keyboard',
        description: '61-key portable keyboard with 400 tones and 77 rhythms. Perfect for... ',
        seller: 'Music Hub Philippines',
        stock: 12,
        price: 12500,
        category: 'Keyboards',
        image: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-004',
        name: 'Pearl Export Series Drum Set',
        description: '5-piece drum set including hardware. Great for intermediate... ',
        seller: 'Music Hub Philippines',
        stock: 5,
        price: 35000,
        category: 'Drums',
        image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-005',
        name: "Guitar Strings Set - D'Addario",
        description: 'Premium phosphor bronze acoustic guitar strings. Warm,... ',
        seller: 'Guitar World Manila',
        stock: 50,
        price: 450,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-006',
        name: 'Piano Sheet Music Collection - ...',
        description: 'Complete collection of classical piano pieces. Includes works by... ',
        seller: 'Music Hub Philippines',
        stock: 30,
        price: 850,
        category: 'Music Sheets',
        image: 'https://images.unsplash.com/photo-1516727003284-a96541e51e9d?auto=format&fit=crop&w=900&q=80',
    },
    {
        id: 'prod-007',
        name: 'Music Theory Book Vol. 1',
        description: 'Beginner-friendly guide to music reading and harmony... ',
        seller: 'Music Hub Philippines',
        stock: 18,
        price: 650,
        category: 'Music Books',
        image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=900&q=80',
    },
];

const defaultOrderDetails: OrderDetail[] = [
    {
        orderId: 1,
        id: 'ORD-2024-00001',
        date: 'February 7, 2024',
        status: 'delivered',
        paymentStatus: 'verified',
        paymentMethod: 'Cash on Delivery',
        items: [{ name: 'Yamaha F310 Acoustic Guitar', quantity: 1, amount: '₱8,500' }],
        quantity: 1,
        recipient: 'John Doe',
        phone: '+63 912 345 6789',
        address: '123 Main St, Brgy. Central, Manila, Metro Manila 1000',
        courier: 'J&T Express',
        subtotal: '₱8,500',
        shippingFee: '₱250',
        total: '₱8,750',
        seller: 'Music Hub Philippines',
    },
    {
        orderId: 2,
        id: 'ORD-2024-00002',
        date: 'February 9, 2024',
        status: 'shipped',
        paymentStatus: 'verified',
        paymentMethod: 'GCash',
        items: [{ name: 'Fender Stratocaster Electric Guitar', meta: 'Color: Sunburst', quantity: 1, amount: '₱45,000' }],
        quantity: 1,
        recipient: 'John Doe',
        phone: '+63 912 345 6789',
        address: '123 Main St, Brgy. Central, Manila, Metro Manila 1000',
        courier: 'LBC',
        subtotal: '₱45,000',
        shippingFee: '₱500',
        total: '₱45,500',
        seller: 'Guitar World Manila',
    },
    {
        orderId: 3,
        id: 'ORD-2024-00003',
        date: 'February 14, 2024',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'Cash on Delivery',
        items: [{ name: 'Casio CT-S300 Keyboard', quantity: 1, amount: '₱12,500' }],
        quantity: 1,
        recipient: 'John Doe',
        phone: '+63 912 345 6789',
        address: '123 Main St, Brgy. Central, Manila, Metro Manila 1000',
        courier: 'Ninja Van',
        subtotal: '₱12,500',
        shippingFee: '₱300',
        total: '₱12,800',
        seller: 'Music Hub Philippines',
    },
];

const defaultActiveOrderDetails = defaultOrderDetails.filter(
    (order) => order.status !== 'delivered' && order.status !== 'cancelled',
);

const defaultHistoryOrderDetails = defaultOrderDetails.filter(
    (order) => order.status === 'delivered' || order.status === 'cancelled',
);

const defaultTickets: Ticket[] = [
    { id: 'TICK-2024-00001', subject: 'Question about guitar maintenance', date: '2/11/2024', status: 'resolved' },
    { id: 'TICK-2024-00002', subject: 'General inquiry about shipping', date: '2/14/2024', status: 'open' },
];

const defaultFaqs = [
    'How do I place an order?',
    'What payment methods do you accept?',
    'How long does shipping take?',
    'Can I return or exchange a product?',
    'How do I become a seller?',
];

const browseCategoryOptions = [
    'All Categories',
    'Guitars',
    'Keyboards',
    'Drums',
    'Accessories',
    'Music Sheets',
    'Music Books',
];

const dashboardStatusStyles: Record<DashboardOrder['status'], string> = {
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
    shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-100',
    confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
    shipped_dispatched: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-100',
    en_route: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-100',
    in_transit: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-100',
    out_for_delivery: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-100',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-100',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-100',
};

const orderStatusStyles: Record<OrderDetail['status'], string> = {
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
    shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-100',
    confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
    shipped_dispatched: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-100',
    en_route: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-100',
    in_transit: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-100',
    out_for_delivery: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-100',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-100',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-100',
};

const orderStatusLabels: Record<OrderDetail['status'], string> = {
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

const paymentStatusStyles: Record<OrderDetail['paymentStatus'], string> = {
    verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-100',
};

const ticketStatusStyles: Record<Ticket['status'], string> = {
    resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
    open: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-100',
};

const formatCurrency = (amount: number) =>
    `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;

const courierOptions: Array<'J&T Express' | 'LBC' | 'Ninja Van'> = [
    'J&T Express',
    'LBC',
    'Ninja Van',
];

const paymentMethodOptions: Array<'gcash' | 'cash_on_delivery'> = [
    'gcash',
    'cash_on_delivery',
];

const getCourierFee = (courier: 'J&T Express' | 'LBC' | 'Ninja Van') => {
    if (courier === 'LBC') return 150;
    if (courier === 'Ninja Van') return 130;

    return 120;
};

const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 4) {
        return digits;
    }

    if (digits.length <= 7) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

const getInitialSectionFromUrl = (url: string): SectionId => {
    const query = url.split('?')[1] ?? '';
    const sectionParam = new URLSearchParams(query).get('section');

    if (sectionParam === 'dashboard' || sectionParam === 'browse' || sectionParam === 'cart' || sectionParam === 'orders' || sectionParam === 'history' || sectionParam === 'support' || sectionParam === 'settings') {
        return sectionParam;
    }

    return 'browse';
};

export default function Dashboard({
    stats = [],
    dashboardOrders = [],
    products = [],
    cartItems: initialCartItems = [],
    activeOrderDetails = defaultActiveOrderDetails,
    historyOrderDetails = defaultHistoryOrderDetails,
    tickets = [],
    faqs = [],
    checkoutDefaults = {
        recipientName: '',
        phone: '',
        address: '',
        courier: 'J&T Express',
    },
}: DashboardPageProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const profileData = page.props.profileData;
    const userType = page.props.userType;
    const [activeSection, setActiveSection] = useState<SectionId>(getInitialSectionFromUrl(page.url));
    const [searchText, setSearchText] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'none'>('name-asc');
    const [isDateDescending, setIsDateDescending] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
    const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[]>([]);
    const [siteNotification, setSiteNotification] = useState<SiteNotification | null>(null);
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketMessage, setTicketMessage] = useState('');
    const [checkoutRecipientName, setCheckoutRecipientName] = useState(checkoutDefaults.recipientName);
    const [checkoutPhone, setCheckoutPhone] = useState(formatPhoneNumber(checkoutDefaults.phone));
    const [checkoutAddress, setCheckoutAddress] = useState(checkoutDefaults.address);
    const [checkoutCourier, setCheckoutCourier] = useState<'J&T Express' | 'LBC' | 'Ninja Van'>(checkoutDefaults.courier);
    const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'gcash' | 'cash_on_delivery'>('cash_on_delivery');
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

    const getInCartQuantity = (productId: string) =>
        cartItems.find((item) => item.product.id === productId)?.quantity ?? 0;

    const getProductDbId = (productId: string) => Number(productId.replace('prod-', ''));

    const getRemainingStock = (product: Product) =>
        Math.max(0, product.stock - getInCartQuantity(product.id));

    const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        setCartItems(initialCartItems);
    }, [initialCartItems]);

    const showSiteNotification = (message: string, type: SiteNotification['type']) => {
        setSiteNotification({ message, type });

        window.setTimeout(() => {
            setSiteNotification((current) =>
                current?.message === message && current.type === type ? null : current,
            );
        }, 2200);
    };

    const handleAddToCart = (product: Product) => {
        const remainingStock = getRemainingStock(product);

        if (remainingStock <= 0) {
            return;
        }

        const requestedQuantity = selectedQuantities[product.id] ?? 1;
        const quantityToAdd = Math.min(requestedQuantity, remainingStock);

        router.post(
            '/customer/cart',
            {
                product_id: getProductDbId(product.id),
                quantity: quantityToAdd,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onSuccess: () => {
                    showSiteNotification(`${product.name} added to cart.`, 'success');
                },
            },
        );

        setSelectedQuantities((prev) => ({
            ...prev,
            [product.id]: 1,
        }));
    };

    const handleSelectedQuantityChange = (product: Product, delta: number) => {
        const remainingStock = getRemainingStock(product);

        if (remainingStock <= 0) {
            return;
        }

        setSelectedQuantities((prev) => {
            const current = prev[product.id] ?? 1;
            const next = Math.max(1, Math.min(current + delta, remainingStock));

            return {
                ...prev,
                [product.id]: next,
            };
        });
    };

    const handleDecreaseCartItem = (productId: string) => {
        const item = cartItems.find((cartItem) => cartItem.product.id === productId);

        if (!item) {
            return;
        }

        const nextQuantity = item.quantity - 1;
        const dbProductId = getProductDbId(productId);

        if (nextQuantity <= 0) {
            router.delete(`/customer/cart/${dbProductId}`, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onSuccess: () => {
                    showSiteNotification(`${item.product.name} removed from cart.`, 'warning');
                },
            });

            setSelectedCartItemIds((selected) => selected.filter((id) => id !== productId));
            return;
        }

        router.patch(
            `/customer/cart/${dbProductId}`,
            {
                quantity: nextQuantity,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleIncreaseCartItem = (productId: string) => {
        const item = cartItems.find((cartItem) => cartItem.product.id === productId);

        if (!item) {
            return;
        }

        const nextQuantity = Math.min(item.quantity + 1, item.product.stock);

        if (nextQuantity === item.quantity) {
            return;
        }

        router.patch(
            `/customer/cart/${getProductDbId(productId)}`,
            {
                quantity: nextQuantity,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleRemoveCartItem = (productId: string) => {
        setSelectedCartItemIds((prev) => prev.filter((id) => id !== productId));

        router.delete(`/customer/cart/${getProductDbId(productId)}`, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onSuccess: () => {
                const removedItem = cartItems.find((item) => item.product.id === productId);

                if (removedItem) {
                    showSiteNotification(`${removedItem.product.name} removed from cart.`, 'warning');
                }
            },
        });
    };

    const toggleCartItemSelection = (productId: string) => {
        setSelectedCartItemIds((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId],
        );
    };

    const filteredProducts = products.filter((product) => {
        const categoryMatches = category === 'All Categories' || product.category === category;
        const search = searchText.trim().toLowerCase();
        const searchMatches =
            search.length === 0 ||
            product.name.toLowerCase().includes(search) ||
            product.description.toLowerCase().includes(search) ||
            product.seller.toLowerCase().includes(search);

        return categoryMatches && searchMatches;
    }).sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
    });

    const cartTotal = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
    );

    const selectedCartItems = cartItems.filter((item) =>
        selectedCartItemIds.includes(item.product.id),
    );

    const selectedCartTotal = selectedCartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
    );

    const selectedSellerCount = Array.from(
        new Set(selectedCartItems.map((item) => item.product.seller)),
    ).length;

    const estimatedShippingFee = selectedSellerCount * getCourierFee(checkoutCourier);
    const estimatedGrandTotal = selectedCartTotal + estimatedShippingFee;

    const selectedCartQuantity = selectedCartItems.reduce(
        (count, item) => count + item.quantity,
        0,
    );

    const handleProceedToCheckout = () => {
        if (selectedCartItems.length === 0) {
            showSiteNotification('Select at least one product to proceed to checkout.', 'warning');
            return;
        }

        const selectedProductIds = selectedCartItems
            .map((item) => getProductDbId(item.product.id))
            .filter((id) => Number.isInteger(id));

        if (!checkoutRecipientName.trim() || !checkoutPhone.trim() || !checkoutAddress.trim()) {
            showSiteNotification('Recipient name, phone, and delivery address are required.', 'warning');
            return;
        }

        router.post(
            '/customer/cart/checkout',
            {
                product_ids: selectedProductIds,
                recipient_name: checkoutRecipientName.trim(),
                recipient_phone: checkoutPhone.trim(),
                delivery_address: checkoutAddress.trim(),
                courier: checkoutCourier,
                payment_method: checkoutPaymentMethod,
            },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () => {
                    setActiveSection('orders');
                },
            },
        );
    };

    const handleSubmitTicket = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!ticketSubject.trim() || !ticketMessage.trim()) {
            showSiteNotification('Subject and message are required.', 'warning');
            return;
        }

        router.post(
            '/support/tickets',
            {
                subject: ticketSubject.trim(),
                message: ticketMessage.trim(),
                priority: 'high',
            },
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const handleCancelOrDeleteOrder = (order: OrderDetail) => {
        const action = order.status === 'pending' || order.status === 'confirmed' ? 'cancel' : 'delete';
        const confirmationMessage =
            action === 'cancel'
                ? 'Cancel this order?'
                : 'Delete this order from your list?';

        if (!window.confirm(confirmationMessage)) {
            return;
        }

        if (action === 'cancel') {
            router.patch(
                `/customer/orders/${order.orderId}/cancel`,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    onSuccess: () => {
                        showSiteNotification('Order cancelled.', 'warning');
                    },
                },
            );
        } else {
            router.delete(
                `/customer/orders/${order.orderId}`,
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    onSuccess: () => {
                        showSiteNotification('Order deleted.', 'warning');
                    },
                },
            );
        }
    };

    const handleMarkOrderReceived = (order: OrderDetail) => {
        if (order.status !== 'out_for_delivery' || order.paymentStatus !== 'verified') {
            showSiteNotification('Order can only be marked as received when payment is verified and it is out for delivery.', 'warning');
            return;
        }

        if (!window.confirm('Mark this order as received?')) {
            return;
        }

        router.patch(
            `/customer/orders/${order.orderId}/received`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
                replace: true,
                onSuccess: () => {
                    showSiteNotification('Order marked as received.', 'success');
                },
            },
        );
    };

    const accountName = String(auth.user.name || auth.user.username || 'Customer');
    const firstName = accountName.trim().split(/\s+/)[0] || 'Customer';

    return (
        <>
            <Head title="Customer Dashboard" />
            <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
                <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18V5l10-2v13" />
                                    <circle cx="6" cy="18" r="3" />
                                    <circle cx="16" cy="16" r="3" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg font-bold font-['Geist','-apple-system','BlinkMacSystemFont','Segoe UI',sans-serif] dark:text-slate-50">
                                    Tunely
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Customer Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <ThemeSwitch />
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{firstName}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Customer</p>
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
                                const isOrders = item.id === 'orders';
                                const isHistory = item.id === 'history';
                                const isCart = item.id === 'cart';
                                const isSupport = item.id === 'support';

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveSection(item.id)}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <span
                                            className={`grid h-5 w-5 place-items-center rounded ${
                                                isActive
                                                    ? 'text-blue-600 dark:text-blue-300'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}
                                        >
                                            {item.icon}
                                        </span>

                                        {!isSidebarCollapsed && (
                                            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                                <span className="truncate">{item.label}</span>
                                                {(isOrders || isHistory || isCart || isSupport) && (
                                                    <span className="flex items-center gap-1">
                                                        {isOrders && activeOrderDetails.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold text-white">
                                                                {activeOrderDetails.length}
                                                            </span>
                                                        )}
                                                        {isHistory && historyOrderDetails.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-slate-400 px-1.5 py-0.5 text-xs font-bold text-white">
                                                                {historyOrderDetails.length}
                                                            </span>
                                                        )}
                                                        {isCart && cartItems.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-blue-500 px-1.5 py-0.5 text-xs font-bold text-white">
                                                                {cartItems.length}
                                                            </span>
                                                        )}
                                                        {isSupport && tickets.length > 0 && (
                                                            <span className="inline-flex min-w-6 justify-center rounded-full bg-slate-400 px-1.5 py-0.5 text-xs font-bold text-white">
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

                            <div className="pt-4">
                                <div className="mb-4 border-t border-slate-200 dark:border-slate-800" />
                                <div className="grid gap-1">
                                    <button
                                        type="button"
                                        onClick={handleOpenSettings}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            activeSection === 'settings'
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300'
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

                    <section className="min-w-0 space-y-6 dark:[&_.bg-white]:bg-slate-900 dark:[&_.border-slate-200]:border-slate-700 dark:[&_.text-slate-900]:text-slate-50 dark:[&_.text-slate-600]:text-slate-300 dark:[&_.text-slate-500]:text-slate-400 dark:[&_.bg-slate-100]:bg-slate-800 dark:shadow-lg">
                        {siteNotification && (
                            <div
                                className={`rounded-lg border px-4 py-3 text-sm font-medium shadow-sm ${
                                    siteNotification.type === 'success'
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                            >
                                {siteNotification.message}
                            </div>
                        )}

                        {activeSection === 'dashboard' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Welcome back, {firstName}!</h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your orders and explore musical instruments</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {stats.map((stat) => (
                                        <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">{stat.value}</p>
                                        </article>
                                    ))}
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Recent Orders</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Your latest purchases</p>
                                    </div>
                                    <div className="mt-4 grid gap-4">
                                        {dashboardOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                                            >
                                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                                                            {order.id}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {order.store}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                            {order.date}
                                                        </p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                                            {order.amount}
                                                        </p>
                                                        <span
                                                            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                                dashboardStatusStyles[order.status]
                                                            }`}
                                                        >
                                                            {orderStatusLabels[order.status]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
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

                        {activeSection === 'browse' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Browse Products</h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Discover musical instruments and accessories</p>
                                </div>

                                <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 dark:border-slate-600 dark:bg-slate-800">
                                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={searchText}
                                            onChange={(event) => setSearchText(event.target.value)}
                                            placeholder="Search products..."
                                            className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 dark:text-slate-100 dark:placeholder-slate-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {browseCategoryOptions.map((option) => {
                                            const isActive = category === option;

                                            return (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => setCategory(option)}
                                                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                                                        isActive
                                                            ? 'border-blue-300 bg-blue-50 text-black dark:border-blue-700 dark:bg-blue-900 dark:text-white'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    {option}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="border-t border-slate-300 dark:border-slate-600"></div>

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
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredProducts.sort((a, b) => {
                                        const aIndex = filteredProducts.indexOf(a);
                                        const bIndex = filteredProducts.indexOf(b);
                                        return isDateDescending ? bIndex - aIndex : aIndex - bIndex;
                                    }).map((product) => (
                                        <article key={product.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                                            <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                <img src={product.image} alt={product.name} className="h-48 w-full object-cover transition hover:scale-105" />
                                                <span className="absolute right-4 top-4 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-100">
                                                    {product.category}
                                                </span>
                                            </div>
                                            <div className="space-y-3 p-5">
                                                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{product.name}</h2>
                                                <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{product.description}</p>
                                                <div className="flex items-end justify-between pt-1">
                                                    <div>
                                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-300">{formatCurrency(product.price)}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">by {product.seller}</p>
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Stock: {product.stock}</p>
                                                </div>
                                                <div className="flex items-center justify-between gap-3 pt-2">
                                                    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectedQuantityChange(product, -1)}
                                                            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="min-w-8 text-center text-sm font-semibold text-slate-900 dark:text-slate-50">
                                                            {selectedQuantities[product.id] ?? 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectedQuantityChange(product, 1)}
                                                            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                        {getRemainingStock(product)} left
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={getRemainingStock(product) === 0}
                                                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                                                >
                                                    {getRemainingStock(product) === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {filteredProducts.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">No products found for your search.</p>
                                    </div>
                                )}
                            </>
                        )}

                        {activeSection === 'cart' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Shopping Cart</h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Review your items before checkout</p>
                                </div>

                                {cartItems.length === 0 ? (
                                    <div className="rounded-lg border border-slate-200 bg-white px-8 py-20 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                        <div className="mx-auto flex max-w-md flex-col items-center text-center">
                                            <svg viewBox="0 0 24 24" className="h-16 w-16 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="21" r="1.5" />
                                                <circle cx="20" cy="21" r="1.5" />
                                                <path d="M1 1h4l2.4 12.2a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L23 6H6" />
                                            </svg>
                                            <p className="mt-4 text-base font-medium text-slate-500 dark:text-slate-400">Your cart is empty</p>
                                            <button type="button" onClick={() => setActiveSection('browse')} className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                                                Start Shopping
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid gap-4">
                                            {cartItems.map((item) => (
                                                <article
                                                    key={item.product.id}
                                                    className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <label className="inline-flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCartItemIds.includes(item.product.id)}
                                                                onChange={() => toggleCartItemSelection(item.product.id)}
                                                                className="h-4 w-4 rounded border-slate-300 bg-slate-50 accent-slate-200 focus:ring-slate-300"
                                                            />
                                                        </label>
                                                        <img
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            className="h-28 w-full rounded-xl object-cover md:w-36"
                                                        />
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-between gap-3">
                                                        <div>
                                                            <p className="mb-2 text-xs font-semibold text-slate-600">
                                                                Include in checkout
                                                            </p>
                                                            <p className="text-base font-semibold text-slate-900">
                                                                {item.product.name}
                                                            </p>
                                                            <p className="text-sm text-slate-500">by {item.product.seller}</p>
                                                            <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-purple-300">
                                                                {formatCurrency(item.product.price)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDecreaseCartItem(item.product.id)}
                                                                    className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="min-w-6 text-center text-sm font-semibold text-slate-900">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleIncreaseCartItem(item.product.id)}
                                                                    className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveCartItem(item.product.id)}
                                                                className="text-sm font-semibold text-rose-600"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="grid gap-3">
                                                <h2 className="text-sm font-semibold text-slate-900">Delivery Details</h2>
                                                <div className="grid gap-1">
                                                    <label className="text-xs font-semibold text-slate-600">Name</label>
                                                    <input
                                                        type="text"
                                                        value={checkoutRecipientName}
                                                        onChange={(event) => setCheckoutRecipientName(event.target.value)}
                                                        placeholder="Recipient Name"
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                                                    />
                                                </div>
                                                <div className="grid gap-1">
                                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone Number</label>
                                                    <input
                                                        type="text"
                                                        value={checkoutPhone}
                                                        onChange={(event) => setCheckoutPhone(formatPhoneNumber(event.target.value))}
                                                        placeholder="Phone Number"
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                                                    />
                                                </div>
                                                <div className="grid gap-1">
                                                    <label className="text-xs font-semibold text-slate-600">Address</label>
                                                    <textarea
                                                        rows={2}
                                                        value={checkoutAddress}
                                                        onChange={(event) => setCheckoutAddress(event.target.value)}
                                                        placeholder="Delivery Address"
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                                                    />
                                                </div>
                                                <div className="grid gap-1">
                                                    <label className="text-xs font-semibold text-slate-600">Courier and Logistics</label>
                                                    <select
                                                        value={checkoutCourier}
                                                        onChange={(event) =>
                                                            setCheckoutCourier(event.target.value as 'J&T Express' | 'LBC' | 'Ninja Van')
                                                        }
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                                                    >
                                                        {courierOptions.map((courier) => (
                                                            <option key={courier} value={courier}>
                                                                {courier}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid gap-1">
                                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Payment Method</label>
                                                    <select
                                                        value={checkoutPaymentMethod}
                                                        onChange={(event) =>
                                                            setCheckoutPaymentMethod(event.target.value as 'gcash' | 'cash_on_delivery')
                                                        }
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                                                    >
                                                        {paymentMethodOptions.map((method) => (
                                                            <option key={method} value={method}>
                                                                {method === 'gcash' ? 'GCASH' : 'Cash on Delivery'}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mt-4 border-t border-slate-200 pt-4">
                                            <div className="flex items-center justify-between text-sm text-slate-600">
                                                <span>Selected Items</span>
                                                <span>
                                                    {selectedCartQuantity}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                {selectedCartItems.length} of {cartItems.length} products selected
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                                <span>Estimated Shipping Fee</span>
                                                <span className="text-indigo-600 dark:text-purple-300">{formatCurrency(estimatedShippingFee)}</span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-lg font-semibold text-slate-900 dark:text-white">
                                                <span>Estimated Total</span>
                                                <span className="text-indigo-600 dark:text-purple-300">{formatCurrency(estimatedGrandTotal)}</span>
                                            </div>
                                            <div className="mt-1 flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white">
                                                <span>Items Total</span>
                                                <span className="text-indigo-600 dark:text-purple-300">{formatCurrency(selectedCartTotal)}</span>
                                            </div>
                                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveSection('browse')}
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                                >
                                                    Continue Shopping
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleProceedToCheckout}
                                                    disabled={selectedCartItems.length === 0}
                                                    className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    Proceed to Checkout
                                                </button>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeSection === 'orders' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">My Orders</h1>
                                    <p className="text-sm text-slate-500">Track and manage your orders</p>
                                </div>

                                {activeOrderDetails.length === 0 ? (
                                    <div className="rounded-2xl border border-slate-200 bg-white px-8 py-20 shadow-sm">
                                        <div className="mx-auto flex max-w-md flex-col items-center text-center">
                                            <svg viewBox="0 0 24 24" className="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="21" r="1.5" />
                                                <circle cx="20" cy="21" r="1.5" />
                                                <path d="M1 1h4l2.4 12.2a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L23 6H6" />
                                            </svg>
                                            <p className="mt-4 text-base text-slate-500">No active orders yet</p>
                                            <button type="button" onClick={() => setActiveSection('browse')} className="mt-4 rounded-xl bg-slate-950 px-6 py-2 text-sm font-semibold text-white">
                                                Start Shopping
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {activeOrderDetails.map((order) => (
                                            <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                                                    <div>
                                                        <p className="text-base font-semibold text-slate-900">{order.id}</p>
                                                        <p className="mt-1 text-sm text-slate-500">{order.date}</p>
                                                    </div>
                                                    <div className="grid justify-items-end gap-2">
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusStyles[order.status]}`}>{orderStatusLabels[order.status]}</span>
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusStyles[order.paymentStatus]}`}>
                                                            Payment: {order.paymentStatus}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 space-y-3 rounded-xl bg-slate-100 px-4 py-4">
                                                    {order.items.map((item, itemIndex) => (
                                                        <div key={`${order.id}-item-${itemIndex}`} className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="text-base font-semibold text-slate-900">{item.name}</p>
                                                                {item.meta && <p className="text-sm text-slate-500">{item.meta}</p>}
                                                                <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                                                            </div>
                                                            <p className="text-base font-semibold text-slate-900">{item.amount}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 border-t border-slate-200 pt-4">
                                                    <p className="text-base font-semibold text-slate-900">Delivery Address</p>
                                                    <p className="mt-2 text-sm text-slate-600">{order.recipient}</p>
                                                    <p className="text-sm text-slate-600">{order.phone}</p>
                                                    <p className="text-sm text-slate-600">{order.address}</p>
                                                    <p className="mt-2 text-sm text-slate-600">Courier: <span className="font-semibold text-slate-900">{order.courier}</span></p>
                                                    <p className="mt-1 text-sm text-slate-600">Payment Method: <span className="font-semibold text-slate-900">{order.paymentMethod}</span></p>
                                                    {order.paymentMethod === 'GCash' && order.sellerPhone && (
                                                        <p className="mt-1 text-sm text-slate-600">
                                                            Store GCash Number: <span className="font-semibold text-slate-900">{order.sellerPhone}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                                                    <div className="flex items-center justify-between">
                                                        <span>Subtotal</span>
                                                        <span>{order.subtotal}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>Shipping Fee</span>
                                                        <span>{order.shippingFee}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>Total Quantity</span>
                                                        <span>{order.quantity}</span>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between text-xl font-semibold text-slate-900 dark:text-white">
                                                        <span>Total</span>
                                                        <span className="text-indigo-600 dark:text-violet-200">{order.total}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                                                    Sold by: <span className="font-semibold text-slate-900">{order.seller}</span>
                                                </div>

                                                <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
                                                    {order.status === 'out_for_delivery' && order.paymentStatus === 'verified' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMarkOrderReceived(order)}
                                                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900"
                                                        >
                                                            Mark as Received
                                                        </button>
                                                    )}

                                                    {(order.status === 'pending' || order.status === 'confirmed') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancelOrDeleteOrder(order)}
                                                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100 dark:hover:bg-rose-900"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeSection === 'history' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">History</h1>
                                    <p className="text-sm text-slate-500">Completed and past orders</p>
                                </div>

                                <div className="grid gap-4">
                                    {historyOrderDetails.map((order) => (
                                        <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                                                <div>
                                                    <p className="text-base font-semibold text-slate-900">{order.id}</p>
                                                    <p className="mt-1 text-sm text-slate-500">{order.date}</p>
                                                </div>
                                                <div className="grid justify-items-end gap-2">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusStyles[order.status]}`}>{orderStatusLabels[order.status]}</span>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusStyles[order.paymentStatus]}`}>
                                                        Payment: {order.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-3 rounded-xl bg-slate-100 px-4 py-4">
                                                {order.items.map((item, itemIndex) => (
                                                    <div key={`${order.id}-history-item-${itemIndex}`} className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-base font-semibold text-slate-900">{item.name}</p>
                                                            {item.meta && <p className="text-sm text-slate-500">{item.meta}</p>}
                                                            <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                                                        </div>
                                                        <p className="text-base font-semibold text-slate-900">{item.amount}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 border-t border-slate-200 pt-4">
                                                <p className="text-base font-semibold text-slate-900">Delivery Address</p>
                                                <p className="mt-2 text-sm text-slate-600">{order.recipient}</p>
                                                <p className="text-sm text-slate-600">{order.phone}</p>
                                                <p className="text-sm text-slate-600">{order.address}</p>
                                                <p className="mt-2 text-sm text-slate-600">Courier: <span className="font-semibold text-slate-900">{order.courier}</span></p>
                                                <p className="mt-1 text-sm text-slate-600">Payment Method: <span className="font-semibold text-slate-900">{order.paymentMethod}</span></p>
                                                {order.paymentMethod === 'GCash' && order.sellerPhone && (
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        Store GCash Number: <span className="font-semibold text-slate-900">{order.sellerPhone}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                                                <div className="flex items-center justify-between">
                                                    <span>Subtotal</span>
                                                    <span>{order.subtotal}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Shipping Fee</span>
                                                    <span>{order.shippingFee}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Total Quantity</span>
                                                    <span>{order.quantity}</span>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between text-xl font-semibold text-slate-900 dark:text-white">
                                                    <span>Total</span>
                                                    <span className="text-indigo-600 dark:text-violet-200">{order.total}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                                                Sold by: <span className="font-semibold text-slate-900">{order.seller}</span>
                                            </div>

                                            <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelOrDeleteOrder(order)}
                                                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900"
                                                >
                                                    Delete Order
                                                </button>
                                            </div>
                                        </article>
                                    ))}

                                    {historyOrderDetails.length === 0 && (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                                            No order history yet.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeSection === 'support' && (
                            <>
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">Support Center</h1>
                                    <p className="text-sm text-slate-500">Get help and submit support tickets</p>
                                </div>

                                <div className="grid gap-4 xl:grid-cols-2">
                                    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h2 className="text-base font-semibold text-slate-900">Submit a Ticket</h2>
                                        <p className="mt-1 text-sm text-slate-600">Need help? Let us know how we can assist you</p>

                                        <form onSubmit={handleSubmitTicket} className="mt-4 grid gap-3">
                                            <div>
                                                <label className="text-sm font-semibold text-slate-900">Subject</label>
                                                <input
                                                    type="text"
                                                    value={ticketSubject}
                                                    onChange={(event) => setTicketSubject(event.target.value)}
                                                    placeholder="Brief description of your issue"
                                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-slate-900">Message</label>
                                                <textarea
                                                    rows={3}
                                                    value={ticketMessage}
                                                    onChange={(event) => setTicketMessage(event.target.value)}
                                                    placeholder="Describe your issue in detail..."
                                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 outline-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
                                                />
                                            </div>
                                            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="22" y1="2" x2="11" y2="13" />
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                                </svg>
                                                Submit Ticket
                                            </button>
                                        </form>
                                    </article>

                                    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h2 className="text-base font-semibold text-slate-900">My Tickets</h2>
                                        <p className="mt-1 text-sm text-slate-600">Track your support requests</p>
                                        <div className="mt-4 grid gap-3">
                                            {tickets.map((ticket) => (
                                                <div key={ticket.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-base font-semibold text-slate-900">{ticket.id}</p>
                                                            <p className="text-sm text-slate-600">{ticket.subject}</p>
                                                            <p className="text-xs text-slate-500">{ticket.date}</p>
                                                        </div>
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ticketStatusStyles[ticket.status]}`}>
                                                            {ticket.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </article>
                                </div>

                                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="text-base font-semibold text-slate-900">Frequently Asked Questions</h2>
                                    <p className="mt-1 text-sm text-slate-600">Quick answers to common questions</p>

                                    <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                                        {faqs.map((question) => (
                                            <button key={question} type="button" className="flex w-full items-center justify-between px-4 py-4 text-left">
                                                <span className="text-sm font-semibold text-slate-900">{question}</span>
                                                <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                </article>
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
