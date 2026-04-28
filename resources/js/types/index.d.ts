import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    profileData?: ProfileData | null;
    userType?: UserType | null;
    [key: string]: unknown;
}

export interface ProfileData {
    username?: string;
    email?: string;
    name?: string;
    customer_name?: string;
    owner_name?: string;
    business_name?: string;
    phone?: string;
    address?: string;
    registration_passkey?: string;
}

export type UserType = 'customer' | 'seller' | 'super_admin';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
