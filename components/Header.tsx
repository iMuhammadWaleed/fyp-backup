
import React, { useState } from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { UserRole } from '../server/types.ts';

const AppLogo = () => (
    <div className="flex items-center space-x-2">
        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
            <path d="M12 5C10.14 5 8.5 6.27 8.5 7.75C8.5 9.23 10.14 10.5 12 10.5C13.86 10.5 15.5 9.23 15.5 7.75C15.5 6.27 13.86 5 12 5ZM12 9C11.04 9 10.5 8.44 10.5 7.75C10.5 7.06 11.04 6.5 12 6.5C12.96 6.5 13.5 7.06 13.5 7.75C13.5 8.44 12.96 9 12 9Z" fill="currentColor"/>
            <path d="M18 13.5C18 12.12 15.31 11 12 11C8.69 11 6 12.12 6 13.5V17H18V13.5ZM8 15.5V14.5C8.62 13.84 10.16 13 12 13C13.84 13 15.38 13.84 16 14.5V15.5H8Z" fill="currentColor"/>
        </svg>
        <span className="text-2xl font-bold text-white">GourmetGo</span>
    </div>
);

const Header: React.FC = () => {
    const { currentUser, logout, cart } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    const baseLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const inactiveLinkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";
    const activeLinkClasses = "bg-gray-900 text-white";

    const getLinkClass = ({ isActive }: { isActive: boolean }) => 
        `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;

    const renderLinks = () => (
        <>
            <ReactRouterDOM.NavLink to="/" className={getLinkClass}>Home</ReactRouterDOM.NavLink>
            <ReactRouterDOM.NavLink to="/menu" className={getLinkClass}>Menu</ReactRouterDOM.NavLink>
            {currentUser?.role === UserRole.ADMIN && (
                <ReactRouterDOM.NavLink to="/admin" className={getLinkClass}>Admin</ReactRouterDOM.NavLink>
            )}
             {currentUser?.role === UserRole.CATERER && (
                <ReactRouterDOM.NavLink to="/caterer" className={getLinkClass}>Dashboard</ReactRouterDOM.NavLink>
            )}
            {currentUser?.role === UserRole.CUSTOMER && (
                <ReactRouterDOM.NavLink to="/orders" className={getLinkClass}>Order History</ReactRouterDOM.NavLink>
            )}
        </>
    );

    return (
        <>
            <header className="bg-gray-800 text-white shadow-lg sticky top-0 z-50 print:hidden">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <ReactRouterDOM.NavLink to="/" className="text-2xl font-bold text-white"><AppLogo /></ReactRouterDOM.NavLink>
                            <div className="hidden md:block ml-10">
                                <div className="flex items-baseline space-x-4">
                                   {renderLinks()}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {currentUser?.role === UserRole.CUSTOMER && (
                                <ReactRouterDOM.NavLink to="/cart" className="relative mr-4 text-gray-300 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>
                                    )}
                                </ReactRouterDOM.NavLink>
                            )}
                            <div className="hidden md:block">
                                {currentUser ? (
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm">Welcome, {currentUser.name}</span>
                                        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Logout</button>
                                    </div>
                                ) : (
                                    <div className="space-x-2">
                                        <ReactRouterDOM.NavLink to="/login" className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</ReactRouterDOM.NavLink>
                                        <ReactRouterDOM.NavLink to="/register" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Register</ReactRouterDOM.NavLink>
                                    </div>
                                )}
                            </div>
                            <div className="md:hidden">
                                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                    <span className="sr-only">Open main menu</span>
                                    {isMenuOpen ? (
                                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                             {renderLinks()}
                        </div>
                         <div className="pt-4 pb-3 border-t border-gray-700">
                            {currentUser ? (
                                 <>
                                     <div className="flex items-center px-5">
                                         <div>
                                             <div className="text-base font-medium leading-none text-white">{currentUser.name}</div>
                                             <div className="text-sm font-medium leading-none text-gray-400">{currentUser.email}</div>
                                         </div>
                                     </div>
                                     <div className="mt-3 px-2 space-y-1">
                                        <button onClick={()=>{handleLogout(); setIsMenuOpen(false);}} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">Logout</button>
                                     </div>
                                 </>
                            ) : (
                                 <div className="px-2 space-y-1">
                                    <ReactRouterDOM.NavLink to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Login</ReactRouterDOM.NavLink>
                                    <ReactRouterDOM.NavLink to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Register</ReactRouterDOM.NavLink>
                                 </div>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;