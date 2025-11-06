
import React from 'react';
import { useAppContext } from '../context/AppContext';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';

const CartPage: React.FC = () => {
    const { cart, cartTotal, removeFromCart, updateCartQuantity, clearCart } = useAppContext();

    const handleClearCart = () => {
        if (window.confirm("Are you sure you want to remove all items from your cart?")) {
            clearCart();
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6 flex-wrap">
                <h1 className="text-3xl font-bold">Your Cart</h1>
                {cart.length > 0 && (
                     <button onClick={handleClearCart} className="text-sm text-red-500 hover:text-red-700 font-semibold hover:underline">
                        Clear Cart
                    </button>
                )}
            </div>
            {cart.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-xl text-gray-500">Your cart is empty.</p>
                    <ReactRouterDOM.Link to="/menu" className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700">Browse Menu</ReactRouterDOM.Link>
                </div>
            ) : (
                <>
                    <div className="divide-y divide-gray-200">
                        {cart.map(({ item, quantity }) => (
                            <div key={item.id} className="flex items-center justify-between py-4 flex-wrap">
                                <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-md object-cover"/>
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-gray-500">PKR {item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border rounded-md">
                                        <button onClick={() => updateCartQuantity(item.id, quantity - 1)} className="px-3 py-1 text-lg font-bold">-</button>
                                        <span className="px-4 py-1">{quantity}</span>
                                        <button onClick={() => updateCartQuantity(item.id, quantity + 1)} className="px-3 py-1 text-lg font-bold">+</button>
                                    </div>
                                    <p className="font-semibold w-20 text-right">PKR {(item.price * quantity).toFixed(2)}</p>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-1" aria-label={`Remove ${item.name} from cart`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t">
                        <div className="flex justify-end items-center">
                            <span className="text-xl font-bold">Total:</span>
                            <span className="text-2xl font-bold ml-4">PKR {cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-end mt-6 space-x-4">
                             <ReactRouterDOM.Link to="/menu" className="bg-gray-200 text-gray-800 px-8 py-3 rounded-md font-semibold hover:bg-gray-300">
                                Continue Shopping
                            </ReactRouterDOM.Link>
                            <ReactRouterDOM.Link 
                                to="/checkout"
                                className="bg-green-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-600">
                                Proceed to Payment
                            </ReactRouterDOM.Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
