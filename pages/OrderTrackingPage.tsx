
import React from 'react';
import { Link } from 'react-router-dom';

const OrderTrackingPage: React.FC = () => {
    return (
        <div className="text-center bg-white p-12 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Tracking</h1>
            <p className="text-gray-600 mb-8">This feature is coming soon!</p>
            <Link to="/" className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700">
                Go to Homepage
            </Link>
        </div>
    );
};

export default OrderTrackingPage;