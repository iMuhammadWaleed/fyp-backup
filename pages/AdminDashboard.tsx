import React from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { UserRole } from '../server/types.ts';
import AdminDashboardHome from './admin/AdminDashboardHome.tsx';
import AdminOrderManagement from './admin/AdminOrderManagement.tsx';
import AdminMenuManagement from './admin/AdminMenuManagement.tsx';
import AdminUserManagement from './admin/AdminUserManagement.tsx';
import AdminCategoryManagement from './admin/AdminCategoryManagement.tsx';

// Icons
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 100 2h4a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>;
const CategoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 7a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm10-1a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V7a1 1 0 00-1-1h-4zM3 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm10-1a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1h-4z" clipRule="evenodd" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;


const AdminDashboard: React.FC = () => {
    const { currentUser } = useAppContext();
    const location = ReactRouterDOM.useLocation();

    if (!currentUser) {
        return <ReactRouterDOM.Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    if (currentUser.role !== UserRole.ADMIN) {
        return <ReactRouterDOM.Navigate to="/" replace />;
    }
    
    const baseLinkClasses = "flex items-center px-4 py-2 text-gray-700 rounded-md transition-colors";
    const inactiveLinkClasses = "hover:bg-gray-200";
    const activeLinkClasses = "bg-teal-600 text-white font-semibold shadow-md";

    const navLinks = [
        { to: '/admin', icon: <DashboardIcon />, label: 'Dashboard' },
        { to: '/admin/orders', icon: <OrdersIcon />, label: 'Orders' },
        { to: '/admin/menu', icon: <MenuIcon />, label: 'Menu Items' },
        { to: '/admin/categories', icon: <CategoryIcon />, label: 'Categories' },
        { to: '/admin/users', icon: <UsersIcon />, label: 'Users' },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-64 flex-shrink-0">
                <nav className="sticky top-24 bg-white p-4 rounded-lg shadow-lg space-y-2">
                    {navLinks.map(link => (
                         <ReactRouterDOM.NavLink key={link.to} to={link.to} end={link.to === '/admin'} className={({isActive}) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                            {link.icon}
                            <span>{link.label}</span>
                        </ReactRouterDOM.NavLink>
                    ))}
                </nav>
            </aside>
            <div className="flex-grow bg-white p-8 rounded-lg shadow-lg min-h-[calc(100vh-10rem)]">
                <ReactRouterDOM.Routes>
                    <ReactRouterDOM.Route path="/" element={<AdminDashboardHome />} />
                    <ReactRouterDOM.Route path="orders" element={<AdminOrderManagement />} />
                    <ReactRouterDOM.Route path="menu" element={<AdminMenuManagement />} />
                    <ReactRouterDOM.Route path="users" element={<AdminUserManagement />} />
                    <ReactRouterDOM.Route path="categories" element={<AdminCategoryManagement />} />
                    <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/admin" />} />
                </ReactRouterDOM.Routes>
            </div>
        </div>
    );
};

export default AdminDashboard;