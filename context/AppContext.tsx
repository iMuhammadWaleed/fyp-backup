import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole, MenuItem, Category, Order, CartItem } from '../server/types.ts';
import { apiService } from '../services/apiService.ts';

// Interface for the context
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
    isFetchingRecs: boolean;
    
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
    
    // --- Data Loading & Persistence ---
    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        const result = await apiService.fetchAllData();
        if (result.success && result.data) {
            setUsers(result.data.users || []);
            setMenuItems(result.data.menuItems || []);
            setCategories(result.data.categories || []);
            setOrders(result.data.orders || []);
        } else {
            console.error("Failed to fetch data:", result.message);
        }
        if (showLoading) setIsLoading(false);
    }, []);
    
    // Initial data load and session restoration
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            const initialDataResult = await apiService.fetchAllData();
            
            if (initialDataResult.success && initialDataResult.data) {
                setUsers(initialDataResult.data.users || []);
                setMenuItems(initialDataResult.data.menuItems || []);
                setCategories(initialDataResult.data.categories || []);
                setOrders(initialDataResult.data.orders || []);
            } else {
                console.error("Failed to load initial data:", initialDataResult.message);
            }

            const userId = sessionStorage.getItem('userId');
            if (userId) {
                const userResult = await apiService.getUserById(userId);
                if (userResult.success && userResult.user) {
                    setCurrentUser(userResult.user);
                    setCart(userResult.user.cart || []);
                    setFavorites(userResult.user.favorites || []);
                } else {
                    sessionStorage.removeItem('userId');
                }
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, []);

    // Persist cart changes to DB
    useEffect(() => {
        if (!currentUser || isLoading) return;
        const handler = setTimeout(() => {
            apiService.updateCart(currentUser.id, cart);
        }, 500); // Debounce updates
        return () => clearTimeout(handler);
    }, [cart, currentUser, isLoading]);

    // Persist favorites changes to DB
    useEffect(() => {
        if (!currentUser || isLoading) return;
         const handler = setTimeout(() => {
            apiService.updateFavorites(currentUser.id, favorites);
        }, 500); // Debounce updates
        return () => clearTimeout(handler);
    }, [favorites, currentUser, isLoading]);

    // --- Auth ---
    const login = async (email: string, password?: string) => {
        const result = await apiService.loginUser(email, password);
        if (result.success && result.user) {
            setCurrentUser(result.user);
            setCart(result.user.cart || []);
            setFavorites(result.user.favorites || []);
            sessionStorage.setItem('userId', result.user.id);
        }
        return result;
    };
    
    const logout = () => {
        setCurrentUser(null);
        setCart([]);
        setFavorites([]);
        setMealPlan([]);
        sessionStorage.removeItem('userId');
    };
    
    const register = async (userData: Omit<User, 'id'>) => {
        const result = await apiService.addUser(userData);
        if (result.success) {
            await login(userData.email, userData.password);
            await fetchData(false);
        }
        return result;
    };

    const registerCaterer = async (data: Omit<User, 'id' | 'role'>) => {
        const catererData = { ...data, role: UserRole.CATERER };
        const result = await apiService.addUser(catererData);
        if (result.success) {
            await login(data.email, data.password);
            await fetchData(false);
        }
        return result;
    };

    const resetPassword = async (email: string, newPassword: string) => {
        return await apiService.resetPassword(email, newPassword);
    };

    // --- Users ---
    const addUser = async (userData: Omit<User, 'id'>) => {
        const result = await apiService.addUser(userData);
        if (result.success) await fetchData(false);
        return result;
    };

    const updateUser = async (user: User) => {
        const result = await apiService.updateUser(user);
        if (result.success) {
            if (currentUser?.id === user.id) {
                 const userResult = await apiService.getUserById(user.id);
                 if (userResult.success) setCurrentUser(userResult.user);
            }
            await fetchData(false);
        }
        return result;
    };

    const deleteUser = async (userId: string) => {
        const result = await apiService.deleteUser(userId);
        if (result.success) await fetchData(false);
        return result;
    };

    // --- Menu Items ---
    const addMenuItem = async (itemData: Omit<MenuItem, 'id'>) => {
        const result = await apiService.addMenuItem(itemData);
        if (result.success) await fetchData(false);
        return result;
    };
    
    const updateMenuItem = async (item: MenuItem) => {
        const result = await apiService.updateMenuItem(item);
        if (result.success) await fetchData(false);
        return result;
    };

    const deleteMenuItem = async (itemId: string) => {
        const result = await apiService.deleteMenuItem(itemId);
        if (result.success) await fetchData(false);
        return result;
    };

    // --- Categories ---
    const addCategory = async (categoryName: string) => {
        const result = await apiService.addCategory(categoryName);
        if (result.success) await fetchData(false);
        return result;
    };
    
    const updateCategory = async (category: Category) => {
        const result = await apiService.updateCategory(category);
        if (result.success) await fetchData(false);
        return result;
    };

    const deleteCategory = async (categoryId: string) => {
        const result = await apiService.deleteCategory(categoryId);
        if (result.success) await fetchData(false);
        return result;
    };

    // --- Cart ---
    const addToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.item.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { item, quantity: 1 }];
        });
    };
    
    const addToCartWithQuantity = (item: MenuItem, quantity: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.item.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
                );
            }
            return [...prevCart, { item, quantity }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prevCart => prevCart.filter(cartItem => cartItem.item.id !== itemId));
    };

    const updateCartQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setCart(prevCart => prevCart.map(cartItem =>
            cartItem.item.id === itemId ? { ...cartItem, quantity } : cartItem
        ));
    };

    const clearCart = () => setCart([]);

    // --- Favorites ---
    const toggleFavorite = (itemId: string) => {
        setFavorites(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };
    const isFavorite = (itemId: string) => favorites.includes(itemId);
    
    // --- Orders ---
    const placeOrder = async (paymentDetails: { method: string; [key: string]: any; }) => {
        if (!currentUser) return { success: false, error: 'You must be logged in to place an order.' };
        const result = await apiService.placeOrder(currentUser, cart, cartTotal, paymentDetails);
        if (result.success) {
            clearCart();
            await fetchData(false);
        }
        return { ...result, order: result.data };
    };
    
    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        const result = await apiService.updateOrderStatus(orderId, status);
        if (result.success) await fetchData(false);
        return result;
    };

    const deleteOrder = async (orderId: string) => {
        const result = await apiService.deleteOrder(orderId);
        if (result.success) await fetchData(false);
        return result;
    };

    // --- AI Meal Planner ---
    const generateMealPlan = async (budget: number) => {
        if (!currentUser || menuItems.length === 0) return;
        setIsFetchingRecs(true);
        try {
            const userOrders = orders.filter(o => o.userId === currentUser.id);
            const favoriteItems = menuItems.filter(item => favorites.includes(item.id));
            const orderedItems = userOrders.flatMap(o => o.items.map(cartItem => cartItem.item));
            const preferredItems = [...favoriteItems, ...orderedItems];
            const uniquePreferredItemNames = [...new Set(preferredItems.map(item => item.name))];
            const menuToRecommendFrom = menuItems.filter(item => !uniquePreferredItemNames.includes(item.name) || menuItems.length < 5);

            const result = await apiService.generateMealPlan(uniquePreferredItemNames, menuToRecommendFrom, budget);
            
            if (result.success && Array.isArray(result.data)) {
                const recommendedNames = result.data;
                const recommendedMenuItems = menuItems
                    .filter(item => recommendedNames.includes(item.name))
                    .sort((a, b) => recommendedNames.indexOf(a.name) - recommendedNames.indexOf(b.name));
                setMealPlan(recommendedMenuItems);
            } else {
                console.error("Failed to fetch meal plan:", result.message);
                setMealPlan([]);
            }
        } catch (error) {
            console.error("Failed to fetch meal plan:", error);
            setMealPlan([]);
        } finally {
            setIsFetchingRecs(false);
        }
    };

    const clearMealPlan = () => setMealPlan([]);

    // --- Derived State ---
    const cartTotal = cart.reduce((total, { item, quantity }) => total + item.price * quantity, 0);

    // --- Context Value ---
    const value = {
        currentUser, users, menuItems, categories, orders, cart, favorites, mealPlan, isLoading, isFetchingRecs,
        cartTotal, isFavorite,
        login, logout, register, registerCaterer, resetPassword,
        addUser, updateUser, deleteUser,
        addMenuItem, updateMenuItem, deleteMenuItem,
        addCategory, updateCategory, deleteCategory,
        addToCart, addToCartWithQuantity, removeFromCart, updateCartQuantity, clearCart,
        placeOrder, updateOrderStatus, deleteOrder,
        toggleFavorite,
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
