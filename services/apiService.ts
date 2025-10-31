
import { MOCK_USERS, MOCK_CATEGORIES, MOCK_MENU_ITEMS, MOCK_ORDERS } from '../constants';
import { User, MenuItem, Category, Order, CartItem, UserRole } from '../types';

const SIMULATED_DELAY = 150; // ms

// --- LocalStorage Wrapper ---
const storage = {
    get: <T,>(key: string): T | null => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) { console.error(`Failed to read ${key} from localStorage`, e); return null; }
    },
    set: <T,>(key: string, value: T): void => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { console.error(`Failed to write ${key} to localStorage`, e); }
    }
};

// --- Data Initialization ---
const initDatabase = () => {
    // Seed data only if it doesn't exist at all
    if (storage.get('users') === null) storage.set('users', MOCK_USERS);
    if (storage.get('categories') === null) storage.set('categories', MOCK_CATEGORIES);
    if (storage.get('menuItems') === null) storage.set('menuItems', MOCK_MENU_ITEMS);
    if (storage.get('orders') === null) storage.set('orders', MOCK_ORDERS);
};
initDatabase();

// --- Simulated Database Access ---
const db = {
    users: () => storage.get<User[]>('users') || [],
    categories: () => storage.get<Category[]>('categories') || [],
    menuItems: () => storage.get<MenuItem[]>('menuItems') || [],
    orders: () => storage.get<Order[]>('orders') || [],
};

const withDelay = <T,>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), SIMULATED_DELAY));

// --- API Service Definition ---
export const apiService = {
    // --- Combined Fetch ---
    fetchAllData: async () => {
        const [users, categories, menuItems, orders] = await Promise.all([
            withDelay(db.users()),
            withDelay(db.categories()),
            withDelay(db.menuItems()),
            withDelay(db.orders()),
        ]);
        return { users, categories, menuItems, orders };
    },

    // --- Auth ---
    loginUser: async (email: string, password?: string): Promise<{ success: boolean; user: User | null; message: string }> => {
        const user = db.users().find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.password === password) {
            return withDelay({ success: true, user, message: 'Login successful.' });
        }
        return withDelay({ success: false, user: null, message: 'Invalid credentials.' });
    },

    // --- Users ---
    addUser: async (userData: Omit<User, 'id'>) => {
        const users = db.users();
        if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return withDelay({ success: false, data: null, message: 'An account with this email already exists.' });
        }
        const newUser: User = { ...userData, id: `user-${Date.now()}` };
        storage.set('users', [...users, newUser]);
        return withDelay({ success: true, data: newUser, message: 'User added.' });
    },
    
    updateUser: async (updatedUser: User) => {
        const users = db.users();
        const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        storage.set('users', updatedUsers);
        return withDelay({ success: true, data: updatedUser, message: 'User updated.' });
    },

    deleteUser: async (userId: string) => {
        const users = db.users();
        const menuItems = db.menuItems();
        const orders = db.orders();

        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) {
            return withDelay({ success: false, message: "User not found." });
        }

        // For customers, block deletion if they have orders
        if (userToDelete.role === UserRole.CUSTOMER) {
            const blockingOrders = orders.filter(order => order.userId === userId);
            if (blockingOrders.length > 0) {
                const message = `Cannot delete customer "${userToDelete.name}". They have ${blockingOrders.length} existing order(s). Please resolve these orders first.`;
                return withDelay({ success: false, message });
            }
        }
        
        let successMessage = `User "${userToDelete.name}" deleted successfully.`;

        // For caterers, reassign their menu items to the main admin/platform account
        if (userToDelete.role === UserRole.CATERER) {
            const fallbackCatererId = 'user-1'; // The main admin account
            const fallbackCaterer = users.find(u => u.id === fallbackCatererId);
            const itemsToReassign = menuItems.filter(item => item.catererId === userId);
            
            if (itemsToReassign.length > 0) {
                 if (!fallbackCaterer) {
                     return withDelay({ success: false, message: `Cannot delete caterer "${userToDelete.name}" because the fallback admin account (ID: user-1) was not found.` });
                }
                const updatedMenuItems = menuItems.map(item => 
                    item.catererId === userId 
                        ? { ...item, catererId: fallbackCatererId } 
                        : item
                );
                storage.set('menuItems', updatedMenuItems);
                successMessage = `Caterer "${userToDelete.name}" deleted. Their menu items were reassigned to "${fallbackCaterer.businessName}".`;
            }
        }
        
        storage.set('users', users.filter(u => u.id !== userId));
        return withDelay({ success: true, message: successMessage });
    },

    // --- Menu Items ---
    addMenuItem: async (itemData: Omit<MenuItem, 'id'>) => {
        const menuItems = db.menuItems();
        const newItem: MenuItem = { ...itemData, id: `item-${Date.now()}` };
        storage.set('menuItems', [...menuItems, newItem]);
        return withDelay({ success: true, data: newItem, message: 'Menu item added.' });
    },

    updateMenuItem: async (updatedItem: MenuItem) => {
        const menuItems = db.menuItems();
        const updatedMenuItems = menuItems.map(item => item.id === updatedItem.id ? updatedItem : item);
        storage.set('menuItems', updatedMenuItems);
        return withDelay({ success: true, data: updatedItem, message: 'Menu item updated.' });
    },

    deleteMenuItem: async (itemId: string) => {
        const menuItems = db.menuItems();
        // Check if item is in an order. In a real app, this might have more complex logic.
        const orders = db.orders();
        const isItemInOrder = orders.some(order => order.items.some(cartItem => cartItem.item.id === itemId));
        if (isItemInOrder) {
            return withDelay({ success: false, message: 'Cannot delete item as it is part of an existing order. Consider deactivating it instead.' });
        }
        storage.set('menuItems', menuItems.filter(item => item.id !== itemId));
        return withDelay({ success: true, message: 'Menu item deleted.' });
    },

    // --- Categories ---
    addCategory: async (categoryName: string) => {
        const categories = db.categories();
        if (categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
            return withDelay({ success: false, data: null, message: 'A category with this name already exists.' });
        }
        const newCategory: Category = { name: categoryName, id: `cat-${Date.now()}` };
        storage.set('categories', [...categories, newCategory]);
        return withDelay({ success: true, data: newCategory, message: 'Category added.' });
    },
    
    updateCategory: async (updatedCategory: Category) => {
        const categories = db.categories();
        const updatedCategories = categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat);
        storage.set('categories', updatedCategories);
        return withDelay({ success: true, data: updatedCategory, message: 'Category updated.' });
    },

    deleteCategory: async (categoryId: string) => {
        const categories = db.categories();
        const menuItems = db.menuItems();
        if (categories.length <= 1) {
            return withDelay({ success: false, message: 'Cannot delete the last category.' });
        }
        const fallbackCategory = categories.find(c => c.id !== categoryId);
        if (!fallbackCategory) {
            // This case should be virtually impossible given the check above, but it's good practice for type safety.
            return withDelay({ success: false, message: 'Critical error: Could not find a fallback category.' });
        }
        const updatedMenuItems = menuItems.map(item => 
            item.categoryId === categoryId 
                ? { ...item, categoryId: fallbackCategory.id } 
                : item
        );
        storage.set('menuItems', updatedMenuItems);
        storage.set('categories', categories.filter(cat => cat.id !== categoryId));
        return withDelay({ success: true, message: 'Category deleted. Menu items were reassigned.' });
    },

    // --- Orders ---
    placeOrder: async (user: User, cart: CartItem[], total: number, paymentDetails: { method: string; cardNumber?: string; }) => {
        if (!user) {
            return withDelay({ success: false, data: null, message: 'User not logged in.' });
        }
        if (cart.length === 0) {
            return withDelay({ success: false, data: null, message: 'Your cart is empty.' });
        }

        // Simulate payment failure for specific card numbers
        if (paymentDetails.method === 'credit-card' && paymentDetails.cardNumber?.endsWith('0000')) {
             return withDelay({ success: false, data: null, message: 'Payment was declined by the bank. Please check your card details.' });
        }

        const orders = db.orders();
        const newOrder: Order = {
            id: `order-${Date.now()}`,
            userId: user.id,
            customerName: user.name,
            items: cart,
            total: total,
            status: 'Pending',
            orderDate: new Date().toISOString(),
        };
        storage.set('orders', [...orders, newOrder]);
        return withDelay({ success: true, data: newOrder, message: 'Order placed successfully.' });
    },

    updateOrderStatus: async (orderId: string, status: Order['status']) => {
        const orders = db.orders();
        const updatedOrders = orders.map(order => 
            order.id === orderId 
                ? { ...order, status } 
                : order
        );
        storage.set('orders', updatedOrders);
        return withDelay({ success: true, message: 'Order status updated successfully.' });
    },

    deleteOrder: async (orderId: string) => {
        const orders = db.orders();
        const orderToDelete = orders.find(o => o.id === orderId);

        if (!orderToDelete) {
             return withDelay({ success: false, message: 'Order not found.' });
        }

        if (orderToDelete.status !== 'Delivered' && orderToDelete.status !== 'Cancelled') {
            return withDelay({ success: false, message: 'Only delivered or cancelled orders can be deleted.' });
        }
        
        const updatedOrders = orders.filter(order => order.id !== orderId);
        storage.set('orders', updatedOrders);
        return withDelay({ success: true, message: 'Order deleted successfully.' });
    },
};