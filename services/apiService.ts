
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
    
    resetPassword: async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
        const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (userIndex > -1) {
            db.users[userIndex].password = newPassword;
            persistDb();
        }
        // To prevent user enumeration, always return a success-style message.
        return withDelay({ success: true, message: 'Password reset successful. You can now log in with your new password.' });
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
                successMessage += `\n${itemsToReassign.length} menu item(s) were reassigned to "${fallbackCaterer.businessName}".`;
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
        return withDelay({ success: true, data: newItem, message: 'Item added.' });
    },
    
    updateMenuItem: async (updatedItem: MenuItem) => {
        db.menuItems = db.menuItems.map(i => i.id === updatedItem.id ? updatedItem : i);
        persistDb();
        return withDelay({ success: true, data: updatedItem, message: 'Item updated.' });
    },

    deleteMenuItem: async (itemId: string) => {
        // Prevent deletion if the item is in any order
        const isInOrder = db.orders.some(order => order.items.some(cartItem => cartItem.item.id === itemId));
        if (isInOrder) {
            const itemName = db.menuItems.find(item => item.id === itemId)?.name || 'the item';
            return withDelay({ success: false, message: `Cannot delete "${itemName}" because it is part of one or more existing orders.` });
        }

        db.menuItems = db.menuItems.filter(i => i.id !== itemId);
        persistDb();
        return withDelay({ success: true, message: 'Item deleted.' });
    },

    // --- Categories ---
    addCategory: async (categoryName: string) => {
        if (db.categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
            return withDelay({ success: false, data: null, message: 'A category with this name already exists.' });
        }
        const newCategory: Category = { id: `cat-${Date.now()}`, name: categoryName };
        db.categories.push(newCategory);
        persistDb();
        return withDelay({ success: true, data: newCategory, message: 'Category added.' });
    },

    updateCategory: async (updatedCategory: Category) => {
         if (db.categories.some(c => c.name.toLowerCase() === updatedCategory.name.toLowerCase() && c.id !== updatedCategory.id)) {
            return withDelay({ success: false, data: null, message: 'Another category with this name already exists.' });
        }
        db.categories = db.categories.map(c => c.id === updatedCategory.id ? updatedCategory : c);
        persistDb();
        return withDelay({ success: true, data: updatedCategory, message: 'Category updated.' });
    },

    deleteCategory: async (categoryId: string) => {
        const defaultCategory = db.categories[0];
        if (!defaultCategory || defaultCategory.id === categoryId) {
             return withDelay({ success: false, message: 'Cannot delete the default category.' });
        }
        // Re-assign items to the default category
        db.menuItems = db.menuItems.map(item => 
            item.categoryId === categoryId 
                ? { ...item, categoryId: defaultCategory.id } 
                : item
        );
        db.categories = db.categories.filter(c => c.id !== categoryId);
        persistDb();
        return withDelay({ success: true, message: 'Category deleted and items reassigned.' });
    },

    // --- Orders ---
    placeOrder: async (user: User, cart: CartItem[], total: number, paymentDetails: { method: string; [key: string]: any; }) => {
        if (cart.length === 0) {
            return withDelay({ success: false, data: null, message: 'Cart is empty.' });
        }
        
        // Simulate payment failure for specific cases
        if (paymentDetails.method === 'credit-card' && paymentDetails.cardNumber?.endsWith('0000')) {
            return withDelay({ success: false, data: null, message: 'Your credit card was declined.' });
        }
        
        // Simulate JazzCash payment failure for demonstration
        if (paymentDetails.method === 'jazzcash' && paymentDetails.jazzcashCNIC === '000000') {
             return withDelay({ success: false, data: null, message: 'JazzCash payment failed. Please check your details.' });
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
        return withDelay({ success: true, data: newOrder, message: 'Order placed.' });
    },

    updateOrderStatus: async (orderId: string, status: Order['status']) => {
        db.orders = db.orders.map(o => o.id === orderId ? { ...o, status } : o);
        persistDb();
        return withDelay({ success: true, message: 'Order status updated.' });
    },

    deleteOrder: async (orderId: string) => {
        const order = db.orders.find(o => o.id === orderId);
        if (order && order.status !== 'Delivered' && order.status !== 'Cancelled') {
             return withDelay({ success: false, message: 'Cannot delete an order that is not completed or cancelled.' });
        }
        db.orders = db.orders.filter(o => o.id !== orderId);
        persistDb();
        return withDelay({ success: true, message: 'Order deleted.' });
    },
};
