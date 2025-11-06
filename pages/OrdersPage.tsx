
import React from 'react';
import { useAppContext } from '../context/AppContext';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { Order, UserRole } from '../types';

const OrdersPage: React.FC = () => {
    const { orders, currentUser } = useAppContext();

    if (!currentUser || currentUser.role !== UserRole.CUSTOMER) {
        return <ReactRouterDOM.Navigate to="/login" />;
    }

    const userOrders = orders.filter(order => order.userId === currentUser.id);
    
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

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Order History</h1>
            {userOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">You have not placed any orders yet.</p>
            ) : (
                <div className="space-y-6">
                    {userOrders.map(order => (
                        <div 
                            key={order.id} 
                            className="block border rounded-lg p-6"
                        >
                            <div className="flex justify-between items-start flex-wrap">
                                <div>
                                    <h2 className="text-xl font-semibold text-teal-700">Order #{order.id.slice(-6)}</h2>
                                    <p className="text-sm text-gray-500">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                                    <p className="text-lg font-bold mt-2">Total: PKR {order.total.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <h3 className="font-semibold mb-2">Items:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                    {order.items.map(({ item, quantity }) => (
                                        <li key={item.id}>{item.name} x {quantity}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
