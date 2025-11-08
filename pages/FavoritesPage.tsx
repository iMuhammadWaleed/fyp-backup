

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MenuItemCard from '../components/MenuItemCard';
import { UserRole } from '../server/types';

const FavoritesPage: React.FC = () => {
    const { menuItems, favorites, currentUser } = useAppContext();

    if (!currentUser || currentUser.role !== UserRole.CUSTOMER) {
        return <ReactRouterDOM.Navigate to="/login" />;
    }

    const favoriteItems = menuItems.filter(item => favorites.includes(item.id));

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
            {favoriteItems.length === 0 ? (
                <div className="text-center py-10">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                    <p className="text-xl text-gray-500 mt-4">You have no favorite items yet.</p>
                    <p className="text-gray-400 mt-2">Click the heart icon on any menu item to add it here.</p>
                    <ReactRouterDOM.Link to="/menu" className="mt-6 inline-block bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700 font-semibold">
                        Browse Menu
                    </ReactRouterDOM.Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {favoriteItems.map(item => (
                        <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
