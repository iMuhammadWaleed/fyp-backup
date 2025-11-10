

import React, { useState, FormEvent, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { UserRole } from '../../server/types.ts';

const AppLogo = () => (
    <div className="flex flex-col items-center space-y-2">
        <svg className="w-16 h-16 text-teal-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
            <path d="M12 5C10.14 5 8.5 6.27 8.5 7.75C8.5 9.23 10.14 10.5 12 10.5C13.86 10.5 15.5 9.23 15.5 7.75C15.5 6.27 13.86 5 12 5ZM12 9C11.04 9 10.5 8.44 10.5 7.75C10.5 7.06 11.04 6.5 12 6.5C12.96 6.5 13.5 7.06 13.5 7.75C13.5 8.44 12.96 9 12 9Z" fill="currentColor"/>
            <path d="M18 13.5C18 12.12 15.31 11 12 11C8.69 11 6 12.12 6 13.5V17H18V13.5ZM8 15.5V14.5C8.62 13.84 10.16 13 12 13C13.84 13 15.38 13.84 16 14.5V15.5H8Z" fill="currentColor"/>
        </svg>
        <h1 className="text-3xl font-bold text-gray-800">GourmetGo</h1>
    </div>
);


const AdminLoginPage: React.FC = () => {
    const { login, logout, currentUser } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();
    const location = ReactRouterDOM.useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser?.role === UserRole.ADMIN) {
            navigate('/admin', { replace: true });
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        
        const result = await login(email, password);

        if (result.success && result.user) {
            if (result.user.role === UserRole.ADMIN) {
                const from = location.state?.from?.pathname || '/admin';
                navigate(from, { replace: true });
            } else {
                setError('This is the admin portal. Other account types are not permitted.');
                logout(); // Log out the user if they were accidentally logged in
            }
        } else {
            setError(result.message || 'Invalid email or password, or not an admin account.');
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-full bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/auth-bg/1600/1200')"}}>
            <div className="max-w-md w-full bg-slate-50/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
                <div className="text-center p-8 bg-slate-100/90 border-b border-slate-200">
                    <AppLogo />
                    <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Admin Portal Sign In</h2>
                </div>
                <div className="p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </span>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                    placeholder="Admin email address"
                                />
                            </div>
                            <div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                        placeholder="Password"
                                    />
                                </div>
                                 <div className="text-right mt-2">
                                    <ReactRouterDOM.Link to="/admin/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-500">
                                        Forgot your password?
                                    </ReactRouterDOM.Link>
                                </div>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                     <div className="text-sm text-center mt-6">
                        <p className="text-gray-600 text-xs">
                            New admin accounts must be created by an existing administrator.
                        </p>
                    </div>
                    <div className="text-sm text-center mt-4">
                        <p>
                            <ReactRouterDOM.Link to="/" className="font-medium text-gray-500 hover:text-gray-700 text-xs">
                                &larr; Back to main site
                            </ReactRouterDOM.Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;