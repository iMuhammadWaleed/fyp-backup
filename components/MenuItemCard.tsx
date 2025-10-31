
import React from 'react';
import { MenuItem } from '../types';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

interface MenuItemCardProps {
    item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
    const { addToCart, users, toggleFavorite, isFavorite, currentUser } = useAppContext();
    const caterer = users.find(u => u.id === item.catererId);
    const isItemFavorite = isFavorite(item.id);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to detail page
        e.stopPropagation();
        addToCart(item);
        // Optionally, add visual feedback here
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(item.id);
    };


    return (
        <ReactRouterDOM.Link to={`/menu/${item.id}`} className="block bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 group flex flex-col">
            <div className="relative">
                <img className="w-full h-48 object-cover" src={item.imageUrl} alt={item.name} />
                 {currentUser?.role === UserRole.CUSTOMER && (
                    <button onClick={handleToggleFavorite} className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-red-500 rounded-full p-2 transition-transform hover:scale-110" aria-label={isItemFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill={isItemFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
                 <button onClick={handleQuickAdd} className="absolute bottom-2 right-2 bg-teal-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-teal-700 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white" aria-label={`Quick add ${item.name} to cart`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{caterer?.businessName || 'GourmetGo'}</p>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-600 transition-colors flex-grow">{item.name}</h3>
                <p className="text-gray-600 mb-4 h-12 overflow-hidden text-sm">{item.description.substring(0, 70)}...</p>
                <div className="flex justify-between items-center mt-auto">
                    <span className="text-2xl font-bold text-teal-600">${item.price.toFixed(2)}</span>
                    <span className="text-teal-500 font-semibold text-sm">View Details &rarr;</span>
                </div>
            </div>
        </ReactRouterDOM.Link>
    );
};

export default MenuItemCard;
