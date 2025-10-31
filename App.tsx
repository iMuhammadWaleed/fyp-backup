
import React from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import MenuItemDetailPage from './pages/MenuItemDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import CatererRegisterPage from './pages/CatererRegisterPage';
import CatererDashboard from './pages/CatererDashboard';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminForgotPasswordPage from './pages/admin/AdminForgotPasswordPage';
import CatererLoginPage from './pages/caterer/CatererLoginPage';
import CatererForgotPasswordPage from './pages/caterer/CatererForgotPasswordPage';


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
