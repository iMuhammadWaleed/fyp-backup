
import { MOCK_USERS, MOCK_CATEGORIES, MOCK_MENU_ITEMS, MOCK_ORDERS } from '../constants';
import { User, MenuItem, Category, Order, CartItem, UserRole } from '../types';

const SIMULATED_DELAY = 150; // ms

// Use a single key for the whole database to ensure transactional updates
const DB_KEY = 'gourmetgo_db';

interface Database {
    users: User[];
    categories: Category[];
    menuItems: MenuItem[];
    orders: Order[];
}

// In-memory representation of the database
let db: Database;

const initDatabase = () => {
    const storedDb = localStorage.getItem(DB_KEY);
    if (storedDb) {
        db = JSON.parse(storedDb);
    } else {
        // Deep copy from constants to avoid any reference issues
        db = {
            users: JSON.parse(JSON.stringify(MOCK_USERS)),
            categories: JSON.parse(JSON.stringify(MOCK_CATEGORIES)),
            menuItems: JSON.parse(JSON.stringify(MOCK_MENU_ITEMS)),
            orders: JSON.parse(JSON.stringify(MOCK_ORDERS)),
        };
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
};

const persistDb = () => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

initDatabase();


const withDelay = <T,>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), SIMULATED_DELAY));

// --- API Service Definition ---
// API service now operates on the in-memory `db` object and persists changes.
export const apiService = {
    // --- Combined Fetch ---
    fetchAllData: async () => {
         // Return copies to prevent direct mutation of the in-memory db from outside
        return withDelay({
            users: [...db.users],
            categories: [...db.categories],
            menuItems: [...db.menuItems],
            orders: [...db.orders],
        });
    },

    // --- Auth ---
    loginUser: async (email: string, password?: string): Promise<{ success: boolean; user: User | null; message: string }> => {
        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.password === password) {
            return withDelay({ success: true, user, message: 'Login successful.' });
        }
        return withDelay({ success: false, user: null, message: 'Invalid credentials.' });
    },

    // --- Users ---
    addUser: async (userData: Omit<User, 'id'>) => {
        if (db.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return withDelay({ success: false, data: null, message: 'An account with this email already exists.' });
        }
        const newUser: User = { ...userData, id: `user-${Date.now()}` };
        db.users.push(newUser);
        persistDb();
        return withDelay({ success: true, data: newUser, message: 'User added.' });
    },
    
    updateUser: async (updatedUser: User) => {
        db.users = db.users.map(u => u.id === updatedUser.id ? updatedUser : u);
        persistDb();
        return withDelay({ success: true, data: updatedUser, message: 'User updated.' });
    },

    deleteUser: async (userId: string) => {
        const userToDelete = db.users.find(u => u.id === userId);
        if (!userToDelete) {
            return withDelay({ success: false, message: "User not found." });
        }

        // For customers, block deletion if they have orders
        if (userToDelete.role === UserRole.CUSTOMER) {
            if (db.orders.some(order => order.userId === userId)) {
                const message = `Cannot delete customer "${userToDelete.name}". They have existing order(s). Please resolve these orders first.`;
                return withDelay({ success: false, message });
            }
        }
        
        let successMessage = `User "${userToDelete.name}" deleted successfully.`;

        // For caterers, reassign their menu items to the main admin/platform account
        if (userToDelete.role === UserRole.CATERER) {
            const fallbackCatererId = 'user-1'; // The main admin account
            const fallbackCaterer = db.users.find(u => u.id === fallbackCatererId);
            const itemsToReassign = db.menuItems.filter(item => item.catererId === userId);
            
            if (itemsToReassign.length > 0) {
                 if (!fallbackCaterer) {
                     return withDelay({ success: false, message: `Cannot delete caterer "${userToDelete.name}" because the fallback admin account (ID: user-1) was not found.` });
                }
                db.menuItems = db.menuItems.map(item => 
                    item.catererId === userId 
                        ? { ...item, catererId: fallbackCatererId } 
                        : item
                );
                successMessage = `Caterer "${userToDelete.name}" deleted. Their menu items were reassigned to "${fallbackCaterer.businessName}".`;
            }
        }
        
        db.users = db.users.filter(u => u.id !== userId);
        persistDb();
        return withDelay({ success: true, message: successMessage });
    },

    // --- Menu Items ---
    addMenuItem: async (itemData: Omit<MenuItem, 'id'>) => {
        const newItem: MenuItem = { ...itemData, id: `item-${Date.now()}` };
        db.menuItems.push(newItem);
        persistDb();
        return withDelay({ success: true, data: newItem, message: 'Menu item added.' });
    },

    updateMenuItem: async (updatedItem: MenuItem) => {
        db.menuItems = db.menuItems.map(item => item.id === updatedItem.id ? updatedItem : item);
        persistDb();
        return withDelay({ success: true, data: updatedItem, message: 'Menu item updated.' });
    },

    deleteMenuItem: async (itemId: string) => {
        // Check if item is in an order. In a real app, this might have more complex logic.
        if (db.orders.some(order => order.items.some(cartItem => cartItem.item.id === itemId))) {
            return withDelay({ success: false, message: 'Cannot delete item as it is part of an existing order. Consider deactivating it instead.' });
        }
        db.menuItems = db.menuItems.filter(item => item.id !== itemId);
        persistDb();
        return withDelay({ success: true, message: 'Menu item deleted.' });
    },

    // --- Categories ---
    addCategory: async (categoryName: string) => {
        if (db.categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
            return withDelay({ success: false, data: null, message: 'A category with this name already exists.' });
        }
        const newCategory: Category = { name: categoryName, id: `cat-${Date.now()}` };
        db.categories.push(newCategory);
        persistDb();
        return withDelay({ success: true, data: newCategory, message: 'Category added.' });
    },
    
    updateCategory: async (updatedCategory: Category) => {
        db.categories = db.categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat);
        persistDb();
        return withDelay({ success: true, data: updatedCategory, message: 'Category updated.' });
    },

    deleteCategory: async (categoryId: string) => {
        if (db.categories.length <= 1) {
            return withDelay({ success: false, message: 'Cannot delete the last category.' });
        }
        const fallbackCategory = db.categories.find(c => c.id !== categoryId);
        if (!fallbackCategory) {
            // This case should be virtually impossible given the check above, but it's good practice for type safety.
            return withDelay({ success: false, message: 'Critical error: Could not find a fallback category.' });
        }
        db.menuItems = db.menuItems.map(item => 
            item.categoryId === categoryId 
                ? { ...item, categoryId: fallbackCategory.id } 
                : item
        );
        db.categories = db.categories.filter(cat => cat.id !== categoryId);
        persistDb();
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

        const newOrder: Order = {
            id: `order-${Date.now()}`,
            userId: user.id,
            customerName: user.name,
            items: cart,
            total: total,
            status: 'Pending',
            orderDate: new Date().toISOString(),
        };
        db.orders.push(newOrder);
        persistDb();
        return withDelay({ success: true, data: newOrder, message: 'Order placed successfully.' });
    },

    updateOrderStatus: async (orderId: string, status: Order['status']) => {
        db.orders = db.orders.map(order => 
            order.id === orderId 
                ? { ...order, status } 
                : order
        );
        persistDb();
        return withDelay({ success: true, message: 'Order status updated successfully.' });
    },

    deleteOrder: async (orderId: string) => {
        const orderToDelete = db.orders.find(o => o.id === orderId);

        if (!orderToDelete) {
             return withDelay({ success: false, message: 'Order not found.' });
        }

        if (orderToDelete.status !== 'Delivered' && orderToDelete.status !== 'Cancelled') {
            return withDelay({ success: false, message: 'Only delivered or cancelled orders can be deleted.' });
        }
        
        db.orders = db.orders.filter(order => order.id !== orderId);
        persistDb();
        return withDelay({ success: true, message: 'Order deleted successfully.' });
    },
};
