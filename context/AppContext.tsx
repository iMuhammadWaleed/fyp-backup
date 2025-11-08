import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole, MenuItem, Category, Order, CartItem } from '../server/types';
import { geminiService } from '../services/geminiService';
import { MOCK_USERS, MOCK_CATEGORIES, MOCK_MENU_ITEMS, MOCK_ORDERS } from '../constants';

interface AppContextType {
    // State
    currentUser: User | null;
    users: User[];
    menuItems: MenuItem[];
    categories: Category[];
    orders: Order[];
    cart: CartItem[];
    favorites: string[];
    mealPlan: MenuItem[];
    isLoading: boolean;
    
    // Derived State
    cartTotal: number;
    isFavorite: (itemId: string) => boolean;

    // Auth
    login: (email: string, password?: string) => Promise<{ success: boolean; message: string; user: User | null; }>;
    logout: () => void;
    register: (userData: Omit<User, 'id'>) => Promise<{ success: boolean; message: string; }>;
    registerCaterer: (data: Omit<User, 'id' | 'role'>) => Promise<{ success: boolean; message: string; }>;
    resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string; }>;

    // Users
    addUser: (userData: Omit<User, 'id'>) => Promise<{ success: boolean; message: string }>;
    updateUser: (user: User) => Promise<{ success: boolean; message: string }>;
    deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
    
    // Menu Items
    addMenuItem: (itemData: Omit<MenuItem, 'id'>) => Promise<{ success: boolean; message: string }>;
    updateMenuItem: (item: MenuItem) => Promise<{ success: boolean; message: string }>;
    deleteMenuItem: (itemId: string) => Promise<{ success: boolean; message: string }>;

    // Categories
    addCategory: (categoryName: string) => Promise<{ success: boolean; message:string }>;
    updateCategory: (category: Category) => Promise<{ success: boolean; message: string }>;
    deleteCategory: (categoryId: string) => Promise<{ success: boolean; message: string }>;

    // Cart
    addToCart: (item: MenuItem) => void;
    addToCartWithQuantity: (item: MenuItem, quantity: number) => void;
    removeFromCart: (itemId: string) => void;
    updateCartQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;

    // Orders
    placeOrder: (paymentDetails: { method: string; [key: string]: any; }) => Promise<{ success: boolean; order?: Order | null; error?: string }>;
    updateOrderStatus: (orderId: string, status: Order['status']) => Promise<{ success: boolean; message: string }>;
    deleteOrder: (orderId: string) => Promise<{ success: boolean; message: string }>;
    
    // Favorites
    toggleFavorite: (itemId: string) => void;

    // AI Meal Plan
    generateMealPlan: (budget: number) => Promise<void>;
    clearMealPlan: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- State ---
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingRecs, setIsFetchingRecs] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [mealPlan, setMealPlan] = useState<MenuItem[]>([]);

    // --- Data Loading from Local Storage ---
    useEffect(() => {
        setIsLoading(true);
        try {
            const db = localStorage.getItem('gourmetgo_db');
            let data;
            if (db) {
                data = JSON.parse(db);
            } else {
                data = {
                    users: MOCK_USERS,
                    menuItems: MOCK_MENU_ITEMS,
                    categories: MOCK_CATEGORIES,
                    orders: MOCK_ORDERS,
                };
            }
            setUsers(data.users || []);
            setMenuItems(data.menuItems || []);
            setCategories(data.categories || []);
            setOrders(data.orders || []);
            
            // Session Management
            const userId = sessionStorage.getItem('userId');
            if (userId) {
                const user = data.users.find((u: User) => u.id === userId);
                if (user) {
                    setCurrentUser(user);
                    setCart(user.cart || []);
                    setFavorites(user.favorites || []);
                } else {
                    sessionStorage.removeItem('userId'); // Clean up invalid session
                }
            }
        } catch (error) {
            console.error("Failed to load data from local storage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- Data Persistence to Local Storage ---
    useEffect(() => {
        if (!isLoading) {
            // Update user-specific data (cart/favorites) within the main users array for persistence
            const updatedUsers = currentUser 
                ? users.map(u => u.id === currentUser.id ? { ...u, cart, favorites } : u)
                : users;

            const db = { users: updatedUsers, menuItems, categories, orders };
            localStorage.setItem('gourmetgo_db', JSON.stringify(db));
        }
    }, [users, menuItems, categories, orders, cart, favorites, currentUser, isLoading]);

    // --- AI Meal Planner ---
    const clearMealPlan = () => setMealPlan([]);

    const generateMealPlan = async (budget: number) => {
        if (!currentUser || currentUser.role !== UserRole.CUSTOMER || menuItems.length === 0) return;
        setIsFetchingRecs(true);
        try {
            const userOrders = orders.filter(o => o.userId === currentUser.id);
            const favoriteItems = menuItems.filter(item => favorites.includes(item.id));
            const orderedItems = userOrders.flatMap(o => o.items.map(cartItem => cartItem.item));
            const preferredItems = [...favoriteItems, ...orderedItems];
            const uniquePreferredItemNames = [...new Set(preferredItems.map(item => item.name))];
            const potentialMenuItems = menuItems.filter(item => !uniquePreferredItemNames.includes(item.name));
            const menuToRecommendFrom = potentialMenuItems.length > 0 ? potentialMenuItems : menuItems;
            const recommendedNames = await geminiService.getMealPlan(uniquePreferredItemNames, menuToRecommendFrom, budget);
            const recommendedMenuItems = menuItems.filter(item => recommendedNames.includes(item.name)).sort((a, b) => recommendedNames.indexOf(a.name) - recommendedNames.indexOf(b.name));
            setMealPlan(recommendedMenuItems);
        } catch (error) {
            console.error("Failed to fetch meal plan:", error);
            setMealPlan([]);
        } finally {
            setIsFetchingRecs(false);
        }
    };

    // --- Auth ---
    const login = async (email: string, password?: string) => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            setCurrentUser(user);
            setCart(user.cart || []);
            setFavorites(user.favorites || []);
            sessionStorage.setItem('userId', user.id);
            return { success: true, user, message: 'Login successful.' };
        }
        return { success: false, user: null, message: 'Invalid email or password.' };
    };
    
    const logout = () => {
        setCurrentUser(null);
        setCart([]);
        setFavorites([]);
        setMealPlan([]);
        sessionStorage.removeItem('userId');
    };
    
    const register = async (userData: Omit<User, 'id'>) => {
        const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (existingUser) {
            return { success: false, message: 'An account with this email already exists.' };
        }
        const newUser: User = { ...userData, id: `user-${Date.now()}` };
        setUsers(prev => [...prev, newUser]);
        await login(newUser.email, newUser.password);
        return { success: true, message: 'Registration successful.' };
    };

    const registerCaterer = async (data: Omit<User, 'id' | 'role'>) => {
        const catererData = { ...data, role: UserRole.CATERER };
        return register(catererData);
    };

    const resetPassword = async (email: string, newPassword: string) => {
        let userFound = false;
        setUsers(prev => prev.map(user => {
            if (user.email.toLowerCase() === email.toLowerCase()) {
                userFound = true;
                return { ...user, password: newPassword };
            }
            return user;
        }));
        return userFound 
            ? { success: true, message: 'Password reset successful.' }
            : { success: false, message: 'User not found.' };
    };

    // --- Users ---
    const addUser = async (userData: Omit<User, 'id'>) => {
        const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (existingUser) {
            return { success: false, message: 'An account with this email already exists.' };
        }
        const newUser: User = { ...userData, id: `user-${Date.now()}` };
        setUsers(prev => [...prev, newUser]);
        return { success: true, message: 'User added successfully.' };
    };

    const updateUser = async (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
        return { success: true, message: 'User updated successfully.' };
    };

    const deleteUser = async (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) return { success: false, message: 'User not found.' };

        // Prevent deletion if customer has orders
        if (userToDelete.role === UserRole.CUSTOMER) {
            if (orders.some(o => o.userId === userId)) {
                return { success: false, message: `Cannot delete customer "${userToDelete.name}" as they have existing orders.` };
            }
        }
        
        setUsers(prev => prev.filter(u => u.id !== userId));
        return { success: true, message: 'User deleted successfully.' };
    };
    
    // --- Menu Items ---
    const addMenuItem = async (itemData: Omit<MenuItem, 'id'>) => {
        const newItem: MenuItem = { ...itemData, id: `item-${Date.now()}` };
        setMenuItems(prev => [...prev, newItem]);
        return { success: true, message: 'Item added successfully.' };
    };

    const updateMenuItem = async (updatedItem: MenuItem) => {
        setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        // Also update the item if it's in the cart
        setCart(prevCart => prevCart.map(cartItem => 
            cartItem.item.id === updatedItem.id 
                ? { ...cartItem, item: updatedItem }
                : cartItem
        ));
        return { success: true, message: 'Item updated successfully.' };
    };

    const deleteMenuItem = async (itemId: string) => {
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
        setCart(prev => prev.filter(cartItem => cartItem.item.id !== itemId));
        setFavorites(prev => prev.filter(id => id !== itemId));
        return { success: true, message: 'Item deleted successfully.' };
    };

    // --- Categories ---
    const addCategory = async (categoryName: string) => {
        const existingCategory = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (existingCategory) {
            return { success: false, message: 'A category with this name already exists.' };
        }
        const newCategory: Category = { name: categoryName, id: `cat-${Date.now()}` };
        setCategories(prev => [...prev, newCategory]);
        return { success: true, message: 'Category added successfully.' };
    };

    const updateCategory = async (updatedCategory: Category) => {
        const existingCategory = categories.find(c => c.name.toLowerCase() === updatedCategory.name.toLowerCase() && c.id !== updatedCategory.id);
        if (existingCategory) {
            return { success: false, message: 'Another category with this name already exists.' };
        }
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
        return { success: true, message: 'Category updated successfully.' };
    };

    const deleteCategory = async (categoryId: string) => {
        if (categories.length <= 1) {
            return { success: false, message: 'Cannot delete the last category.' };
        }
        const defaultCategory = categories.find(c => c.id !== categoryId);
        // Re-assign menu items to a default category
        setMenuItems(prev => prev.map(item => item.categoryId === categoryId ? { ...item, categoryId: defaultCategory!.id } : item));
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        return { success: true, message: 'Category deleted.' };
    };

    // --- Cart Management ---
    const addToCart = (item: MenuItem) => addToCartWithQuantity(item, 1);
    const addToCartWithQuantity = (item: MenuItem, quantity: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(ci => ci.item.id === item.id);
            if (existingItem) {
                return prevCart.map(ci => ci.item.id === item.id ? { ...ci, quantity: ci.quantity + quantity } : ci);
            }
            return [...prevCart, { item, quantity }];
        });
    };
    const removeFromCart = (itemId: string) => setCart(prev => prev.filter(ci => ci.item.id !== itemId));
    const updateCartQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCart(prev => prev.map(ci => ci.item.id === itemId ? { ...ci, quantity } : ci));
        }
    };
    const clearCart = () => setCart([]);
    const cartTotal = cart.reduce((total, { item, quantity }) => total + item.price * quantity, 0);

    // --- Orders ---
    const placeOrder = async (paymentDetails: { method: string; [key: string]: any; }) => {
        if (!currentUser) return { success: false, error: 'User not logged in.' };
        if (cart.length === 0) return { success: false, error: 'Cart is empty.' };
        
        const newOrder: Order = {
            id: `order-${Date.now()}`,
            userId: currentUser.id,
            items: cart,
            total: cartTotal,
            status: 'Pending',
            orderDate: new Date().toISOString(),
            customerName: currentUser.name,
        };

        setOrders(prev => [...prev, newOrder]);
        clearCart();
        return { success: true, order: newOrder };
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        return { success: true, message: 'Order status updated.' };
    };

    const deleteOrder = async (orderId: string) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        return { success: true, message: 'Order deleted.' };
    };

    // --- Favorites Management ---
    const toggleFavorite = (itemId: string) => {
        setFavorites(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
    };
    const isFavorite = (itemId: string) => favorites.includes(itemId);
    
    // --- Context Value ---
    const value = {
        currentUser, users, menuItems, categories, orders, cart, favorites, mealPlan,
        isLoading: isLoading || isFetchingRecs,
        cartTotal,
        login, logout, register, registerCaterer, resetPassword,
        addUser, updateUser, deleteUser,
        addMenuItem, updateMenuItem, deleteMenuItem,
        addCategory, updateCategory, deleteCategory,
        addToCart, addToCartWithQuantity, removeFromCart, updateCartQuantity, clearCart,
        placeOrder, updateOrderStatus, deleteOrder,
        toggleFavorite, isFavorite,
        generateMealPlan, clearMealPlan,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
