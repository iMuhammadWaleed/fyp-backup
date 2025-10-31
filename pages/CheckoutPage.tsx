import React, { useState, FormEvent, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';

const CheckoutPage: React.FC = () => {
    const { cart, cartTotal, placeOrder, currentUser } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        address: '',
        city: '',
        zip: '',
        phone: '',
        paymentMethod: 'credit-card',
        paypalEmail: '', // Added for PayPal
    });
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
    });
    const [errors, setErrors] = useState({
        name: '',
        address: '',
        city: '',
        zip: '',
        phone: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        paypalEmail: '',
    });

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/menu');
        }
    }, [cart, navigate]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setPaymentError('');
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear errors when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors({ ...errors, [name]: ''});
        }
    };

    const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentError('');
         const { name, value } = e.target;
        setPaymentDetails({ ...paymentDetails, [name]: value });
         if (errors[name as keyof typeof errors]) {
            setErrors({ ...errors, [name]: ''});
        }
    };

    const validate = (): boolean => {
        const newErrors = { 
            name: '', address: '', city: '', zip: '', phone: '',
            cardNumber: '', expiry: '', cvv: '', paypalEmail: ''
        };
        let isValid = true;
        
        // Validate address fields
        if (!formData.name) { newErrors.name = 'Full name is required.'; isValid = false; }
        if (!formData.address) { newErrors.address = 'Address is required.'; isValid = false; }
        if (!formData.city) { newErrors.city = 'City is required.'; isValid = false; }
        if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) { newErrors.zip = 'Enter a valid ZIP code.'; isValid = false; }
        if (!/^\d{10,15}$/.test(formData.phone)) { newErrors.phone = 'Enter a valid phone number.'; isValid = false; }

        if (formData.paymentMethod === 'credit-card') {
            if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
                newErrors.cardNumber = 'Card number must be 16 digits.';
                isValid = false;
            }
            if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentDetails.expiry)) {
                newErrors.expiry = 'Expiry must be in MM/YY format.';
                isValid = false;
            } else {
                const [month, year] = paymentDetails.expiry.split('/');
                const expiryDate = new Date(parseInt(`20${year}`), parseInt(month));
                 if (expiryDate <= new Date()) {
                    newErrors.expiry = 'Card is expired.';
                    isValid = false;
                }
            }
            if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
                newErrors.cvv = 'CVV must be 3 or 4 digits.';
                isValid = false;
            }
        } else if (formData.paymentMethod === 'paypal') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalEmail)) {
                newErrors.paypalEmail = 'Please enter a valid email address.';
                isValid = false;
            }
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setPaymentError('');
        if (!validate()) {
            return;
        }

        setIsProcessing(true);
        // FIX: The `placeOrder` function returns a promise. It must be awaited.
        // The callback to setTimeout needs to be async to use await.
        setTimeout(async () => {
            const paymentInfo = {
                method: formData.paymentMethod,
                cardNumber: paymentDetails.cardNumber,
            };
            const result = await placeOrder(paymentInfo);

            if(result.success && result.order){
                navigate(`/order-confirmation/${result.order.id}`);
            } else {
                setPaymentError(result.error || "An unknown error occurred. Please try again.");
                setIsProcessing(false);
            }
        }, 1500);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
                {/* Left Column: Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">Delivery Address</h2>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <input type="text" id="address" name="address" value={formData.address} onChange={handleFormChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2" />
                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input type="text" id="city" name="city" value={formData.city} onChange={handleFormChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2" />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>
                            <div>
                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                                <input type="text" id="zip" name="zip" value={formData.zip} onChange={handleFormChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2" />
                                {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleFormChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2" />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">Payment Method</h2>
                        <div className="space-y-2">
                             <label className="flex items-center p-3 border rounded-md has-[:checked]:bg-teal-50 has-[:checked]:border-teal-500 cursor-pointer transition-colors">
                                <input type="radio" name="paymentMethod" value="credit-card" checked={formData.paymentMethod === 'credit-card'} onChange={handleFormChange} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"/>
                                <span className="ml-3 font-medium text-gray-700 flex-grow">Credit Card</span>
                            </label>
                            {formData.paymentMethod === 'credit-card' && (
                                <div className="p-4 border rounded-b-md -mt-2 space-y-3 bg-gray-50">
                                    <div>
                                        <input type="text" name="cardNumber" placeholder="Card Number (16 digits)" value={paymentDetails.cardNumber} onChange={handlePaymentDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input type="text" name="expiry" placeholder="MM/YY" value={paymentDetails.expiry} onChange={handlePaymentDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                             {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                                        </div>
                                        <div className="flex-1">
                                            <input type="text" name="cvv" placeholder="CVV" value={paymentDetails.cvv} onChange={handlePaymentDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                            {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <label className="flex items-center p-3 border rounded-md has-[:checked]:bg-teal-50 has-[:checked]:border-teal-500 cursor-pointer transition-colors">
                                <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleFormChange} className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"/>
                                <span className="ml-3 font-medium text-gray-700">Cash on Delivery</span>
                            </label>
                        </div>
                    </div>
                     {paymentError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center" role="alert">
                            <p><span className="font-bold">Payment Failed:</span> {paymentError}</p>
                        </div>
                    )}
                    <button 
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-green-500 text-white px-8 py-3 rounded-md font-semibold text-lg hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center">
                        {isProcessing ? 'Processing...' : `Place Order - $${(cartTotal + 5).toFixed(2)}`}
                    </button>
                     <ReactRouterDOM.Link to="/cart" className="text-center block mt-2 text-teal-600 hover:underline text-sm">
                        &larr; Back to Cart
                    </ReactRouterDOM.Link>
                </form>
                
                {/* Right Column: Order Summary */}
                <div className="lg:sticky lg:top-24 h-fit mt-12 lg:mt-0">
                    <div className="p-6 bg-gray-50 rounded-lg border">
                        <h3 className="text-xl font-semibold mb-4 flex items-center border-b pb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Order Summary
                        </h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                             {cart.map(({ item, quantity }) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-md object-cover" />
                                        <div>
                                            <p className="font-semibold text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-sm">${(item.price * quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 border-t pt-4 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>$5.00</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl mt-2 pt-2 border-t">
                                <span>Total</span>
                                <span>${(cartTotal + 5).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;