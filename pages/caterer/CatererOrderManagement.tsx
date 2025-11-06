
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Order } from '../../types';

const CatererOrderManagement: React.FC = () => {
    const { orders, currentUser, updateOrderStatus } = useAppContext();
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const myOrders = useMemo(() => {
        return orders.filter(order => order.items.some(cartItem => cartItem.item.catererId === currentUser?.id));
    }, [orders, currentUser]);


    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) {
            return myOrders;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return myOrders.filter(order =>
            order.customerName.toLowerCase().includes(lowercasedQuery) ||
            order.id.toLowerCase().includes(lowercasedQuery) ||
            `#${order.id.slice(-6)}`.toLowerCase().includes(lowercasedQuery)
        );
    }, [myOrders, searchQuery]);
    
    const toggleExpand = (orderId: string) => {
        setExpandedOrderId(prevId => (prevId === orderId ? null : prevId));
    };

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        updateOrderStatus(orderId, newStatus);
    };

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
    
    const calculateMySubtotal = (order: Order) => {
        return order.items
            .filter(i => i.item.catererId === currentUser?.id)
            .reduce((subtotal, i) => subtotal + (i.item.price * i.quantity), 0);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">My Orders</h1>
            </div>
            
             <div className="mb-6">
                <div className="relative max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by customer name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        aria-label="Search orders"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Order ID</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Customer</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Date</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Status</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">
                                     {searchQuery ? 'No orders match your search query.' : 'You have no orders yet.'}
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => (
                                <React.Fragment key={order.id}>
                                    <tr 
                                        className={`border-b hover:bg-gray-100 transition-colors ${expandedOrderId === order.id ? 'bg-teal-50' : ''}`}
                                    >
                                        <td className="py-3 px-4" onClick={() => toggleExpand(order.id)}>#{order.id.slice(-6)}</td>
                                        <td className="py-3 px-4" onClick={() => toggleExpand(order.id)}>{order.customerName}</td>
                                        <td className="py-3 px-4" onClick={() => toggleExpand(order.id)}>{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td className="py-3 px-4" onClick={() => toggleExpand(order.id)}>
                                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <select 
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                                onClick={(e) => e.stopPropagation()}
                                                className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Preparing">Preparing</option>
                                                <option value="Out for Delivery">Out for Delivery</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                    {expandedOrderId === order.id && (
                                        <tr className="bg-white">
                                            <td colSpan={6} className="p-4 border-b">
                                                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                                                    <h4 className="font-bold mb-2 text-gray-800">Your Items in this Order:</h4>
                                                    <ul className="divide-y divide-gray-200">
                                                        {order.items.filter(i => i.item.catererId === currentUser?.id).map(({ item, quantity }) => (
                                                            <li key={item.id} className="py-2 flex justify-between items-center">
                                                                <div>
                                                                    <span className="font-semibold text-gray-800">{item.name}</span>
                                                                    <span className="text-sm text-gray-500 ml-2">({quantity} x PKR {item.price.toFixed(2)})</span>
                                                                </div>
                                                                <span className="font-semibold text-gray-800">PKR {(item.price * quantity).toFixed(2)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="flex justify-end font-bold text-lg mt-3 pt-3 border-t">
                                                        <span>Your Subtotal:</span>
                                                        <span className="ml-4">PKR {calculateMySubtotal(order).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CatererOrderManagement;
