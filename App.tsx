
import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.tsx';

import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import HomePage from './pages/HomePage.tsx';
import MenuPage from './pages/MenuPage.tsx';
import MenuItemDetailPage from './pages/MenuItemDetailPage.tsx';
import CartPage from './pages/CartPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.tsx';
import OrdersPage from './pages/OrdersPage.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import FavoritesPage from './pages/FavoritesPage.tsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.tsx';
import AdminRegisterPage from './pages/admin/AdminRegisterPage.tsx';
import CatererRegisterPage from './pages/CatererRegisterPage.tsx';
import CatererDashboard from './pages/CatererDashboard.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import AdminForgotPasswordPage from './pages/admin/AdminForgotPasswordPage.tsx';
import CatererLoginPage from './pages/caterer/CatererLoginPage.tsx';
import CatererForgotPasswordPage from './pages/caterer/CatererForgotPasswordPage.tsx';


const AppContent: React.FC = () => {
    const location = useLocation();
    const isAuthPage = ['/login', '/register', '/admin/login', '/admin/register', '/caterer/register', '/forgot-password', '/admin/forgot-password', '/caterer/login', '/caterer/forgot-password'].includes(location.pathname);
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            {!isAuthPage && <Header />}
            <main key={location.pathname} className={isAuthPage ? "flex-grow" : "flex-grow container mx-auto px-4 py-8 page-enter-active"}>
                 <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/menu/:itemId" element={<MenuItemDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/register" element={<AdminRegisterPage />} />
                    <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />
                    <Route path="/caterer/register" element={<CatererRegisterPage />} />
                    <Route path="/caterer/login" element={<CatererLoginPage />} />
                    <Route path="/caterer/forgot-password" element={<CatererForgotPasswordPage />} />
                    <Route path="/caterer/*" element={<CatererDashboard />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
            {!isAuthPage && <Footer />}
        </div>
    );
}

const App: React.FC = () => {
    return (
        <AppProvider>
            <HashRouter>
                <AppContent />
            </HashRouter>
        </AppProvider>
    );
};

export default App;