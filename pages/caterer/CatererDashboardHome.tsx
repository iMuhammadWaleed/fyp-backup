import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import { Order } from '../../types';

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

const CatererDashboardHome: React.FC = () => {
    const { menuItems, orders, currentUser } = useAppContext();

    const myMenuItems = useMemo(() => menuItems.filter(item => item.catererId === currentUser?.id), [menuItems, currentUser]);
    const myOrders = useMemo(() => orders.filter(order => order.items.some(cartItem => cartItem.item.catererId === currentUser?.id)), [orders, currentUser]);
    
    const myDeliveredOrders = useMemo(() => myOrders.filter(o => o.status === 'Delivered'), [myOrders]);
    
    const totalRevenue = useMemo(() => {
        return myDeliveredOrders.reduce((total, order) => {
            const orderSubtotal = order.items
                .filter(i => i.item.catererId === currentUser?.id)
                .reduce((subtotal, i) => subtotal + (i.item.price * i.quantity), 0);
            return total + orderSubtotal;
        }, 0);
    }, [myDeliveredOrders, currentUser]);

    const pendingOrdersCount = useMemo(() => myOrders.filter(o => o.status === 'Pending').length, [myOrders]);

    const topSellingItems = useMemo(() => {
        const itemCounts: { [key: string]: { name: string, count: number } } = {};
        myDeliveredOrders.forEach(order => {
            order.items.forEach(({ item, quantity }) => {
                 if (item.catererId === currentUser?.id) {
                     if (itemCounts[item.id]) {
                        itemCounts[item.id].count += quantity;
                    } else {
                        itemCounts[item.id] = { name: item.name, count: quantity };
                    }
                 }
            });
        });
        return Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [myDeliveredOrders, currentUser]);

    const recentOrders = useMemo(() => myOrders.slice(0, 5), [myOrders]);

    const getStatusColor = (status: Order['status']) => {
        switch(status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Confirmed': return 'bg-blue-100 text-blue-800';
            case 'Preparing': return 'bg-cyan-100 text-cyan-800';
            case 'Out for Delivery': return 'bg-purple-100 text-purple-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };


    const RevenueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
    const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
    const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Welcome, {currentUser?.businessName}!</h1>
                <p className="text-gray-600">Here's a quick look at your business on GourmetGo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard 
                    title="Total Revenue"
                    value={`$${totalRevenue.toFixed(2)}`}
                    icon={<RevenueIcon />}
                    colorClass="bg-green-100"
                />
                <StatCard 
                    title="My Menu Items"
                    value={myMenuItems.length}
                    icon={<MenuIcon />}
                    colorClass="bg-blue-100"
                />
                <StatCard 
                    title="Pending Orders"
                    value={pendingOrdersCount}
                    icon={<PendingIcon />}
                    colorClass="bg-yellow-100"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-2 px-3 font-medium">Order ID</th>
                                    <th className="text-left py-2 px-3 font-medium">Date</th>
                                    <th className="text-left py-2 px-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="border-b">
                                        <td className="py-2 px-3 font-mono text-gray-600">#{order.id.slice(-6)}</td>
                                        <td className="py-2 px-3 text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td className="py-2 px-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <ReactRouterDOM.Link to="/caterer/orders" className="text-teal-600 hover:underline mt-4 block text-sm font-semibold text-right">View All Orders &rarr;</ReactRouterDOM.Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-bold mb-4">Top 5 Selling Items</h2>
                    {topSellingItems.length > 0 ? (
                        <ol className="space-y-2">
                            {topSellingItems.map((item, index) => (
                                <li key={index} className="flex justify-between items-center text-sm p-2 rounded-md even:bg-gray-50">
                                    <span className="font-medium text-gray-800">{index + 1}. {item.name}</span>
                                    <span className="font-bold text-teal-600">{item.count} units sold</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 py-10">
                            No sales data available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatererDashboardHome;