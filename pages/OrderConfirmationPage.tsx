import React, { useMemo } from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const OrderConfirmationPage: React.FC = () => {
    const { orderId } = ReactRouterDOM.useParams<{ orderId: string }>();
    const { orders } = useAppContext();

    // Use useMemo to efficiently find the order and avoid re-computation on re-renders.
    const order = useMemo(() => {
        return orders.find(o => o.id === orderId);
    }, [orders, orderId]);

    if (!order) {
        return (
            <div className="text-center bg-white p-12 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Order Not Found</h1>
                <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
                <ReactRouterDOM.Link to="/orders" className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700">
                    View Order History
                </ReactRouterDOM.Link>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You For Your Order!</h1>
                <p className="text-gray-600 mb-6">Your order has been placed successfully and is now being processed.</p>

                <div className="bg-gray-50 p-6 rounded-lg text-left my-8 border">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
                    <div className="flex justify-between mb-2">
                        <span className="font-semibold text-gray-700">Order ID:</span>
                        <span className="text-gray-600">#{order.id.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                        <span className="font-semibold text-gray-700">Order Date:</span>
                        <span className="text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                        <span className="font-semibold text-gray-700">Estimated Delivery:</span>
                        <span className="text-gray-600">2-3 business days</span>
                    </div>

                    <div className="space-y-2 mb-4">
                        {order.items.map(({ item, quantity }) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {quantity} x ${item.price.toFixed(2)}
                                    </p>
                                </div>
                                <p className="font-semibold">${(item.price * quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span>$5.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl mt-2">
                            <span>Total</span>
                            <span>${(order.total + 5).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <ReactRouterDOM.Link to="/orders" className="bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 font-semibold">
                        View Order History
                    </ReactRouterDOM.Link>
                     <ReactRouterDOM.Link to="/menu" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 font-semibold">
                        Continue Shopping
                    </ReactRouterDOM.Link>
                </div>
            </div>
        </>
    );
};

export default OrderConfirmationPage;