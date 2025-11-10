import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { UserRole } from '../server/types.ts';
import CatererDashboardHome from './caterer/CatererDashboardHome.tsx';
import CatererMenuManagement from './caterer/CatererMenuManagement.tsx';
import CatererOrderManagement from './caterer/CatererOrderManagement.tsx';

// Icons
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 100 2h4a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>;

const CatererDashboard: React.FC = () => {
    const { currentUser } = useAppContext();
    const location = ReactRouterDOM.useLocation();

    if (!currentUser) {
        return <ReactRouterDOM.Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (currentUser.role !== UserRole.CATERER) {
        return <ReactRouterDOM.Navigate to="/" replace />;
    }
    
    const baseLinkClasses = "flex items-center px-4 py-2 text-gray-700 rounded-md transition-colors";
    const inactiveLinkClasses = "hover:bg-gray-200";
    const activeLinkClasses = "bg-teal-600 text-white font-semibold shadow-md";

    const navLinks = [
        { to: '/caterer', icon: <DashboardIcon />, label: 'Dashboard' },
        { to: '/caterer/menu', icon: <MenuIcon />, label: 'My Menu' },
        { to: '/caterer/orders', icon: <OrdersIcon />, label: 'My Orders' },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-64 flex-shrink-0">
                <nav className="sticky top-24 bg-white p-4 rounded-lg shadow-lg space-y-2">
                    {navLinks.map(link => (
                         <ReactRouterDOM.NavLink key={link.to} to={link.to} end={link.to === '/caterer'} className={({isActive}) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                            {link.icon}
                            <span>{link.label}</span>
                        </ReactRouterDOM.NavLink>
                    ))}
                </nav>
            </aside>
            <div className="flex-grow bg-white p-8 rounded-lg shadow-lg min-h-[calc(100vh-10rem)]">
                <ReactRouterDOM.Routes>
                    <ReactRouterDOM.Route path="/" element={<CatererDashboardHome />} />
                    <ReactRouterDOM.Route path="menu" element={<CatererMenuManagement />} />
                    <ReactRouterDOM.Route path="orders" element={<CatererOrderManagement />} />
                    <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/caterer" />} />
                </ReactRouterDOM.Routes>
            </div>
        </div>
    );
};

export default CatererDashboard;