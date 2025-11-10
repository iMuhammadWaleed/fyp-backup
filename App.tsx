
import React from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
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
    const location = ReactRouterDOM.useLocation();
    const isAuthPage = ['/login', '/register', '/admin/login', '/admin/register', '/caterer/register', '/forgot-password', '/admin/forgot-password', '/caterer/login', '/caterer/forgot-password'].includes(location.pathname);
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            {!isAuthPage && <Header />}
            <main key={location.pathname} className={isAuthPage ? "flex-grow" : "flex-grow container mx-auto px-4 py-8 page-enter-active"}>
                 <ReactRouterDOM.Routes>
                    <ReactRouterDOM.Route path="/" element={<HomePage />} />
                    <ReactRouterDOM.Route path="/menu" element={<MenuPage />} />
                    <ReactRouterDOM.Route path="/menu/:itemId" element={<MenuItemDetailPage />} />
                    <ReactRouterDOM.Route path="/cart" element={<CartPage />} />
                    <ReactRouterDOM.Route path="/checkout" element={<CheckoutPage />} />
                    <ReactRouterDOM.Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                    <ReactRouterDOM.Route path="/orders" element={<OrdersPage />} />
                    <ReactRouterDOM.Route path="/favorites" element={<FavoritesPage />} />
                    <ReactRouterDOM.Route path="/profile" element={<ProfilePage />} />
                    <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
                    <ReactRouterDOM.Route path="/register" element={<RegisterPage />} />
                    <ReactRouterDOM.Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <ReactRouterDOM.Route path="/admin/login" element={<AdminLoginPage />} />
                    <ReactRouterDOM.Route path="/admin/register" element={<AdminRegisterPage />} />
                    <ReactRouterDOM.Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
                    <ReactRouterDOM.Route path="/admin/*" element={<AdminDashboard />} />
                    <ReactRouterDOM.Route path="/caterer/register" element={<CatererRegisterPage />} />
                    <ReactRouterDOM.Route path="/caterer/login" element={<CatererLoginPage />} />
                    <ReactRouterDOM.Route path="/caterer/forgot-password" element={<CatererForgotPasswordPage />} />
                    <ReactRouterDOM.Route path="/caterer/*" element={<CatererDashboard />} />
                    <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" />} />
                </ReactRouterDOM.Routes>
            </main>
            {!isAuthPage && <Footer />}
        </div>
    );
}

const App: React.FC = () => {
    return (
        <AppProvider>
            <ReactRouterDOM.HashRouter>
                <AppContent />
            </ReactRouterDOM.HashRouter>
        </AppProvider>
    );
};

export default App;