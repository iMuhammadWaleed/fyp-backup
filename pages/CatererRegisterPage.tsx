

import React, { useState, FormEvent } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

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

const CatererRegisterPage: React.FC = () => {
    const { registerCaterer } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();
    const [formData, setFormData] = useState({
        businessName: '',
        name: '', // Contact Person Name
        email: '',
        phone: '',
        businessDescription: '',
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        const result = await registerCaterer({ ...formData, password });
        if (result.success) {
            navigate('/caterer');
        } else {
            setError(result.message || 'An account with this email already exists.');
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-full bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/auth-bg/1600/1200')"}}>
            <div className="max-w-xl w-full bg-slate-50/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
                <div className="text-center p-8 bg-slate-100/90 border-b border-slate-200">
                    <AppLogo />
                    <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Become a Catering Partner</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join our platform and reach new customers.
                    </p>
                </div>
                <div className="p-8">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="businessName" type="text" required value={formData.businessName} onChange={handleChange} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="Business Name" />
                            <input name="name" type="text" required value={formData.name} onChange={handleChange} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="Contact Person Name" />
                            <input name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="Contact Email Address" />
                            <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="Business Phone" />
                        </div>
                        <div>
                            <textarea name="businessDescription" value={formData.businessDescription} onChange={handleChange} rows={3} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="Brief Business Description (optional)"></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="Password" />
                            <input name="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="Confirm Password" />
                        </div>
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                Create Partner Account
                            </button>
                        </div>
                    </form>
                    <div className="text-sm text-center mt-6">
                        <p className="text-gray-600">
                            Already have a partner account?{' '}
                            <ReactRouterDOM.Link to="/caterer/login" className="font-medium text-teal-600 hover:text-teal-500">
                            Sign in
                            </ReactRouterDOM.Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatererRegisterPage;