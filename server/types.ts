
export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN',
    CATERER = 'CATERER',
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    password?: string;
    // Caterer-specific fields
    businessName?: string;
    businessDescription?: string;
    phone?: string;
    // User-specific persistent data
    favorites?: string[];
    cart?: CartItem[];
}

export interface Category {
    id:string;
    name: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    categoryId: string;
    catererId: string;
}

export interface CartItem {
    item: MenuItem;
    quantity: number;
}

export interface Order {
    id:string;
    userId: string;
    items: CartItem[];
    total: number;
    status: 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
    orderDate: string;
    customerName: string;
}