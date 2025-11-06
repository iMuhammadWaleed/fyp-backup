
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User, UserRole, MenuItem, Category, Order, CartItem } from '../types';
import { apiService } from '../services/apiService';
import { geminiService } from '../services/geminiService';

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

// Debounce utility to prevent excessive API calls
const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): void => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

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
    const shouldSync = useRef(false);

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiService.fetchAllData();
            if (data && Array.isArray(data.users) && Array.isArray(data.menuItems) && Array.isArray(data.categories) && Array.isArray(data.orders)) {
                setUsers(data.users);
                setMenuItems(data.menuItems);
                setCategories(data.categories);
                setOrders(data.orders);
            } else {
                console.error("Failed to fetch initial data or data format is incorrect", data);
                setUsers([]); setMenuItems([]); setCategories([]); setOrders([]);
            }
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- App Initialization & Session Management ---
    useEffect(() => {
        const initializeApp = async () => {
            setIsLoading(true);
            const userId = sessionStorage.getItem('userId');
            if (userId) {
                const result = await apiService.getUserById(userId);
                if (result.success && result.user) {
                    setCurrentUser(result.user);
                    setCart(result.user.cart || []);
                    setFavorites(result.user.favorites || []);
                } else {
                    sessionStorage.removeItem('userId'); // Clean up invalid session
                }
            }
            // Fetch general app data after checking for a session
            await fetchData();
            shouldSync.current = true; // Enable DB syncing after initial load
            setIsLoading(false);
        };
        initializeApp();
    }, [fetchData]);

    // --- Database Sync for Cart & Favorites ---
    const syncCart = useCallback(debounce(async (userId: string, cartToSync: CartItem[]) => {
        await apiService.updateCart(userId, cartToSync);
    }, 1500), []);

    const syncFavorites = useCallback(debounce(async (userId: string, favoritesToSync: string[]) => {
        await apiService.updateFavorites(userId, favoritesToSync);
    }, 1500), []);

    useEffect(() => {
        if (currentUser && shouldSync.current) {
            syncCart(currentUser.id, cart);
        }
    }, [cart, currentUser, syncCart]);

    useEffect(() => {
        if (currentUser && shouldSync.current) {
            syncFavorites(currentUser.id, favorites);
        }
    }, [favorites, currentUser, syncFavorites]);

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
        setIsLoading(true);
        try {
            const result = await apiService.loginUser(email, password);
            if (result.success && result.user) {
                setCurrentUser(result.user);
                setCart(result.user.cart || []);
                setFavorites(result.user.favorites || []);
                sessionStorage.setItem('userId', result.user.id);
            }
            return result;
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, user: null, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };
    
    const logout = () => {
        shouldSync.current = false;
        setCurrentUser(null);
        setCart([]);
        setFavorites([]);
        setMealPlan([]);
        sessionStorage.removeItem('userId');
    };
    
    const register = async (userData: Omit<User, 'id'>) => {
        setIsLoading(true);
        try {
            const result = await apiService.addUser(userData);
            if (result.success && result.data) {
                setCurrentUser(result.data);
                setCart(result.data.cart || []);
                setFavorites(result.data.favorites || []);
                sessionStorage.setItem('userId', result.data.id);
                await fetchData();
            }
            return { success: result.success, message: result.message };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    const registerCaterer = async (data: Omit<User, 'id' | 'role'>) => {
        setIsLoading(true);
        try {
            const catererData = { ...data, role: UserRole.CATERER };
            const result = await apiService.addUser(catererData);
            if (result.success && result.data) {
                setCurrentUser(result.data);
                setCart(result.data.cart || []);
                setFavorites(result.data.favorites || []);
                sessionStorage.setItem('userId', result.data.id);
                await fetchData();
            }
            return { success: result.success, message: result.message };
        } catch (error) {
            console.error("Caterer registration error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string, newPassword: string) => {
        setIsLoading(true);
        try { return await apiService.resetPassword(email, newPassword); } 
        catch (error) { console.error("Reset password error:", error); return { success: false, message: "An unexpected error occurred." }; } 
        finally { setIsLoading(false); }
    };

    // --- Users ---
    const addUser = async (userData: Omit<User, 'id'>) => {
        setIsLoading(true);
        try {
            const result = await apiService.addUser(userData);
            if (result.success) await fetchData();
            return { success: result.success, message: result.message };
        } catch (error) {
            console.error("Add user error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (updatedUser: User) => {
        setIsLoading(true);
        try {
            const result = await apiService.updateUser(updatedUser);
            if (result.success) {
                if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
                await fetchData();
            }
            return { success: result.success, message: result.message };
        } catch (error) {
            console.error("Update user error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (userId: string) => {
        setIsLoading(true);
        try {
            const result = await apiService.deleteUser(userId);
            if (result.success) await fetchData();
            return result;
        } catch (error) {
            console.error("Delete user error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Menu Items ---
    const addMenuItem = async (itemData: Omit<MenuItem, 'id'>) => {
        setIsLoading(true);
        try {
            const result = await apiService.addMenuItem(itemData);
            if(result.success) await fetchData();
            return { success: result.success, message: result.message };
        } catch (error) {
            console.error("Add menu item error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    const updateMenuItem = async (updatedItem: MenuItem) => {
        setIsLoading(true);
        try {
            const result = await apiService.updateMenuItem(updatedItem);
            if (result.success) {
                setCart(prevCart => prevCart.map(cartItem => 
                    cartItem.item.id === updatedItem.id 
                        ? { ...cartItem, item: updatedItem }
                        : cartItem
                ));
                await fetchData();
            }
            return { success: result.success, message: result.message };
        } catch (error) {
            console.error("Update menu item error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteMenuItem = async (itemId: string) => {
        setIsLoading(true);
        try {
            const result = await apiService.deleteMenuItem(itemId);
            if (result.success) {
                await fetchData();
                setCart(prev => prev.filter(cartItem => cartItem.item.id !== itemId));
                setFavorites(prev => prev.filter(id => id !== itemId));
            }
            return result;
        } catch (error) {
            console.error("Delete menu item error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    // --- Categories ---
    const addCategory = async (categoryName: string) => {
        setIsLoading(true);
        try {
            const result = await apiService.addCategory(categoryName);
            if (result.success) await fetchData();
            return { success: result.success, message: result.message };
        } catch (error) {
            console.error("Add category error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    const updateCategory = async (updatedCategory: Category) => {
        setIsLoading(true);
        try {
            const result = await apiService.updateCategory(updatedCategory);
            if (result.success) await fetchData();
            return result;
        } catch (error) {
            console.error("Update category error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCategory = async (categoryId: string) => {
        setIsLoading(true);
        try {
            const result = await apiService.deleteCategory(categoryId);
            if (result.success) await fetchData();
            return result;
        } catch (error) {
            console.error("Delete category error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    // --- Cart Management (now local state + DB sync) ---
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
        setIsLoading(true);
        try {
            const result = await apiService.placeOrder(currentUser, cart, cartTotal, paymentDetails);
            if (result.success) {
                clearCart();
                await fetchData();
            }
            return { success: result.success, order: result.data, error: result.message };
        } catch (error) {
            console.error("Place order error:", error);
            return { success: false, error: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        setIsLoading(true);
        try {
            const result = await apiService.updateOrderStatus(orderId, status);
            if (result.success) await fetchData();
            return result;
        } catch (error) {
            console.error("Update order status error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteOrder = async (orderId: string) => {
        setIsLoading(true);
        try {
            const result = await apiService.deleteOrder(orderId);
            if (result.success) await fetchData();
            return result;
        } catch (error) {
            console.error("Delete order error:", error);
            return { success: false, message: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    // --- Favorites Management (now local state + DB sync) ---
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