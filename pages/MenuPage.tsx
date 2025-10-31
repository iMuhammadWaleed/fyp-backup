import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import MenuItemCard from '../components/MenuItemCard';
import { MenuItem } from '../types';

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

const MenuPage: React.FC = () => {
    const { menuItems, categories } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('default');

    const sortedAndFilteredItems = useMemo(() => {
        let items = [...menuItems];

        if (selectedCategory !== 'all') {
            items = items.filter(item => item.categoryId === selectedCategory);
        }

        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(lowercasedQuery) ||
                item.description.toLowerCase().includes(lowercasedQuery)
            );
        }

        switch (sortOption) {
            case 'name-asc':
                items.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                items.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-asc':
                items.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                items.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }

        return items;
    }, [menuItems, selectedCategory, searchQuery, sortOption]);

    return (
        <div>
            <h1 className="text-4xl font-bold text-center mb-8">Our Menu</h1>
            
            <div className="bg-white p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center border shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center flex-grow w-full">
                    <div className="flex-grow w-full relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search for a dish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                        />
                    </div>
                    <div className="relative w-full md:w-auto">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="w-full md:w-48 appearance-none pl-4 pr-10 py-3 bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                        >
                            <option value="default">Sort by Default</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="price-asc">Price (Low-High)</option>
                            <option value="price-desc">Price (High-Low)</option>
                        </select>
                         <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4 lg:w-1/5">
                    <div className="sticky top-24">
                        <h2 className="text-xl font-bold mb-4">Categories</h2>
                        <ul className="space-y-2">
                             <li>
                                <button 
                                    onClick={() => setSelectedCategory('all')}
                                    className={`w-full text-left px-4 py-2 rounded-md transition-colors text-sm font-medium ${selectedCategory === 'all' ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'}`}
                                >
                                    All Categories
                                </button>
                            </li>
                            {categories.map(category => (
                                <li key={category.id}>
                                    <button 
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`w-full text-left px-4 py-2 rounded-md transition-colors text-sm font-medium ${selectedCategory === category.id ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'}`}
                                    >
                                        {category.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
                
                <div className="flex-grow">
                    {sortedAndFilteredItems.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sortedAndFilteredItems.map(item => (
                                <MenuItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500">No menu items found.</p>
                             <p className="text-gray-400 mt-2">Try adjusting your search or category filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuPage;