import { User, UserRole, MenuItem, Category, Order } from './server/types';

export const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Admin User', email: 'admin@test.com', role: UserRole.ADMIN, password: 'password', businessName: 'GourmetGo Central Kitchen' },
    { id: 'user-2', name: 'Customer User', email: 'customer@test.com', role: UserRole.CUSTOMER, password: 'password' },
    { id: 'user-3', name: 'Luigi\'s Pasta', email: 'caterer@test.com', role: UserRole.CATERER, password: 'password', businessName: 'Luigi\'s Pasta House', businessDescription: 'Authentic Italian catering.', phone: '123-456-7890' },
];

export const MOCK_CATEGORIES: Category[] = [
    { id: 'cat-1', name: 'Main Menu' },
    { id: 'cat-2', name: 'Unit' },
    { id: 'cat-3', name: 'Package' },
    { id: 'cat-4', name: 'Beverages' },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
    { id: 'item-3', name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, and black pepper.', price: 15.99, imageUrl: 'https://picsum.photos/seed/carbonara/400/300', categoryId: 'cat-1', catererId: 'user-1' },
    { id: 'item-4', name: 'Margherita Pizza', description: 'Classic pizza with San Marzano tomatoes, mozzarella cheese, fresh basil, salt, and extra-virgin olive oil.', price: 14.50, imageUrl: 'https://picsum.photos/seed/pizza/400/300', categoryId: 'cat-1', catererId: 'user-1' },
    { id: 'item-1', name: 'Bruschetta', description: 'Grilled bread topped with tomatoes, garlic, basil, and olive oil.', price: 8.99, imageUrl: 'https://picsum.photos/seed/bruschetta/400/300', categoryId: 'cat-2', catererId: 'user-1' },
    { id: 'item-2', name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, and sweet basil, seasoned with salt and olive oil.', price: 10.50, imageUrl: 'https://picsum.photos/seed/salad/400/300', categoryId: 'cat-2', catererId: 'user-1' },
    { id: 'item-5', name: 'Tiramisu', description: 'Coffee-flavoured Italian dessert.', price: 7.99, imageUrl: 'https://picsum.photos/seed/tiramisu/400/300', categoryId: 'cat-2', catererId: 'user-3' },
    { id: 'item-6', name: 'Panna Cotta', description: 'Italian dessert of sweetened cream thickened with gelatin.', price: 6.50, imageUrl: 'https://picsum.photos/seed/pannacotta/400/300', categoryId: 'cat-2', catererId: 'user-3' },
    { id: 'item-9', name: 'Family Feast Package', description: 'A complete meal for four. Includes one large pizza, a family-size spaghetti, four bruschettas, and a pitcher of lemonade.', price: 49.99, imageUrl: 'https://picsum.photos/seed/feast/400/300', categoryId: 'cat-3', catererId: 'user-1' },
    { id: 'item-7', name: 'Mineral Water', description: 'Still or sparkling mineral water.', price: 2.50, imageUrl: 'https://picsum.photos/seed/water/400/300', categoryId: 'cat-4', catererId: 'user-1' },
    { id: 'item-8', name: 'Espresso', description: 'Concentrated coffee beverage brewed by forcing a small amount of nearly boiling water under pressure.', price: 3.00, imageUrl: 'https://picsum.photos/seed/espresso/400/300', categoryId: 'cat-4', catererId: 'user-3' },
];

export const MOCK_ORDERS: Order[] = [
    { id: 'order-1', userId: 'user-2', customerName: 'Customer User', items: [{ item: MOCK_MENU_ITEMS[0], quantity: 1 }, { item: MOCK_MENU_ITEMS[1], quantity: 1 }], total: 30.49, status: 'Delivered', orderDate: '2023-10-26T10:00:00Z' },
    { id: 'order-2', userId: 'user-2', customerName: 'Customer User', items: [{ item: MOCK_MENU_ITEMS[2], quantity: 2 }], total: 17.98, status: 'Pending', orderDate: '2023-10-27T11:30:00Z' },
];
