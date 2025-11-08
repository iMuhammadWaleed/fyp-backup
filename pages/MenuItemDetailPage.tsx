

import React, { useState, useMemo } from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../server/types';
import MenuItemCard from '../components/MenuItemCard';

const MenuItemDetailPage: React.FC = () => {
    const { itemId } = ReactRouterDOM.useParams<{ itemId: string }>();
    const { menuItems, addToCartWithQuantity, currentUser, users, toggleFavorite, isFavorite } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    const item = useMemo(() => menuItems.find(i => i.id === itemId), [itemId, menuItems]);
    const caterer = useMemo(() => users.find(u => u.id === item?.catererId), [item, users]);
    const isItemFavorite = isFavorite(item?.id || '');


    const relatedItems = useMemo(() => {
        if (!item) return [];
        return menuItems.filter(
            mi => mi.categoryId === item.categoryId && mi.id !== item.id
        ).slice(0, 4);
    }, [item, menuItems]);

    if (!item) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">Menu Item Not Found</h1>
                <ReactRouterDOM.Link to="/menu" className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700">Back to Menu</ReactRouterDOM.Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        addToCartWithQuantity(item, quantity);
        setAdded(true);
        setTimeout(() => {
            setAdded(false); // Reset button state
        }, 2000); 
    };

    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <img src={item.imageUrl} alt={item.name} className="w-full h-auto rounded-lg shadow-md object-cover aspect-square" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Provided by {caterer?.businessName || 'GourmetGo'}</p>
                        <h1 className="text-4xl font-bold mb-4">{item.name}</h1>
                        <p className="text-gray-600 mb-6 text-lg">{item.description}</p>
                        <span className="text-4xl font-bold text-teal-600 mb-6">PKR {item.price.toFixed(2)}</span>
                        
                        <div className="flex items-center space-x-4 mb-6">
                            <label htmlFor="quantity" className="font-semibold text-lg">Quantity:</label>
                            <div className="flex items-center border rounded-md">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-xl font-bold">-</button>
                                <input
                                    id="quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-16 text-center py-2 border-l border-r"
                                    min="1"
                                />
                                <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-xl font-bold">+</button>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                             <button 
                                onClick={handleAddToCart}
                                disabled={added}
                                className="flex-grow bg-green-500 text-white px-8 py-3 rounded-md font-semibold text-lg hover:bg-green-600 disabled:bg-green-300 transition-colors flex items-center justify-center">
                                {added ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Added!
                                    </>
                                ) : 'Add to Cart'}
                            </button>
                            {currentUser?.role === UserRole.CUSTOMER && (
                                <button
                                    onClick={() => item && toggleFavorite(item.id)}
                                    className="flex-shrink-0 bg-white border border-red-500 text-red-500 p-3 rounded-md font-semibold text-lg hover:bg-red-50 transition-colors"
                                    aria-label={isItemFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill={isItemFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1}>
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                         <ReactRouterDOM.Link to="/menu" className="text-center mt-4 text-teal-600 hover:underline">
                            &larr; Back to Menu
                        </ReactRouterDOM.Link>
                    </div>
                </div>

                {relatedItems.length > 0 && (
                    <div className="mt-12 pt-8 border-t">
                        <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
                         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedItems.map(relatedItem => (
                                <MenuItemCard key={relatedItem.id} item={relatedItem} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MenuItemDetailPage;
