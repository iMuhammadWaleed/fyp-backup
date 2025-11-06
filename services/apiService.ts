import { User, MenuItem, Category, Order, CartItem } from '../types';

export const apiRequest = async (action: string, payload?: any): Promise<any> => {
    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
            console.error(`API Error for action ${action}:`, errorData.message);
            return { success: false, data: null, message: errorData.message || 'Server error' };
        }

        return await response.json();
    } catch (error) {
        console.error(`API request failed for action: ${action}`, error);
        return { success: false, data: null, message: 'Network error or server is not responding.' };
    }
};

export const apiService = {
    // --- Combined Fetch ---
    fetchAllData: () => apiRequest('fetchAllData'),

    // --- Auth ---
    loginUser: (email: string, password?: string) => apiRequest('loginUser', { email, password }),
    resetPassword: (email: string, newPassword: string) => apiRequest('resetPassword', { email, newPassword }),

    // --- Users ---
    addUser: (userData: Omit<User, 'id'>) => apiRequest('addUser', { userData }),
    updateUser: (updatedUser: User) => apiRequest('updateUser', { updatedUser }),
    deleteUser: (userId: string) => apiRequest('deleteUser', { userId }),
    
    // --- Menu Items ---
    addMenuItem: (itemData: Omit<MenuItem, 'id'>) => apiRequest('addMenuItem', { itemData }),
    updateMenuItem: (updatedItem: MenuItem) => apiRequest('updateMenuItem', { updatedItem }),
    deleteMenuItem: (itemId: string) => apiRequest('deleteMenuItem', { itemId }),

    // --- Categories ---
    addCategory: (categoryName: string) => apiRequest('addCategory', { categoryName }),
    updateCategory: (updatedCategory: Category) => apiRequest('updateCategory', { updatedCategory }),
    deleteCategory: (categoryId: string) => apiRequest('deleteCategory', { categoryId }),

    // --- Orders ---
    placeOrder: (user: User, cart: CartItem[], total: number, paymentDetails: { method: string; [key: string]: any; }) => 
        apiRequest('placeOrder', { user, cart, total, paymentDetails }),
    updateOrderStatus: (orderId: string, status: Order['status']) => apiRequest('updateOrderStatus', { orderId, status }),
    deleteOrder: (orderId: string) => apiRequest('deleteOrder', { orderId }),
};