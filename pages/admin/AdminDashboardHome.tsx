import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../server/types';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className={`p-6 rounded-lg shadow-md ${colorClass}`}>
        <div className="flex items-center">
            <div className="mr-4">{icon}</div>
            <div>
                <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                <p className="text-4xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
);


const AdminDashboardHome: React.FC = () => {
    const { menuItems, orders, users } = useAppContext();

    const menuCount = menuItems.length;
    const orderCount = orders.length;
    const customerCount = users.filter(user => user.role === UserRole.CUSTOMER).length;

    const MenuIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
    );

    const OrderIcon = () => (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    );

    const CustomerIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Menu Items"
                    value={menuCount}
                    icon={<MenuIcon />}
                    colorClass="bg-blue-100"
                />
                 <StatCard 
                    title="Incoming Orders"
                    value={orderCount}
                    icon={<OrderIcon />}
                    colorClass="bg-green-100"
                />
                 <StatCard 
                    title="Registered Customers"
                    value={customerCount}
                    icon={<CustomerIcon />}
                    colorClass="bg-purple-100"
                />
            </div>
        </div>
    );
};

export default AdminDashboardHome;