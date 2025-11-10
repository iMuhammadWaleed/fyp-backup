
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white mt-auto print:hidden">
            <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">GourmetGo</h3>
                        <p className="text-gray-400">Exquisite catering for every occasion.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                            <li><Link to="/menu" className="text-gray-400 hover:text-white">Menu</Link></li>
                            <li><Link to="/orders" className="text-gray-400 hover:text-white">My Orders</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-4">For Partners</h3>
                        <ul className="space-y-2">
                            <li><Link to="/caterer/register" className="text-gray-400 hover:text-white">Become a Partner</Link></li>
                            <li><Link to="/admin/login" className="text-gray-400 hover:text-white">Admin Portal</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} GourmetGo Catering. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;