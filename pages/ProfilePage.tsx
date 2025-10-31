
import React, { useState, useEffect, FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import * as ReactRouterDOM from 'react-router-dom';
import { User, UserRole } from '../types';

const ProfilePage: React.FC = () => {
    const { currentUser, updateUser, logout } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();
    
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else {
            setFormData({
                name: currentUser.name,
                email: currentUser.email,
                businessName: currentUser.businessName || '',
                businessDescription: currentUser.businessDescription || '',
                phone: currentUser.phone || '',
            });
        }
    }, [currentUser, navigate]);

    if (!currentUser) {
        return null; // Or a loading spinner
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const updatedUser = { ...currentUser, ...formData };
        updateUser(updatedUser as User);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isCaterer = currentUser.role === UserRole.CATERER;

    const renderField = (label: string, name: keyof User, value: string | undefined, type = 'text', readOnly = false, isTextarea = false) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            {isEditing && !readOnly ? (
                 isTextarea ? (
                    <textarea
                        id={name}
                        name={name}
                        value={value || ''}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2 bg-white"
                    />
                ) : (
                    <input
                        type={type}
                        id={name}
                        name={name}
                        value={value || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-2 bg-white"
                    />
                )
            ) : (
                <p className="mt-1 text-lg text-gray-800 bg-gray-100 p-2 rounded-md min-h-[42px]">{value}</p>
            )}
        </div>
    );

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 flex-wrap">
                <h1 className="text-3xl font-bold">My Profile</h1>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6" role="alert">
                    <p>{successMessage}</p>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('Full Name', 'name', formData.name)}
                    {renderField('Email Address', 'email', formData.email, 'email', true)}
                </div>
                
                {isCaterer && (
                    <div className="pt-6 border-t">
                        <h2 className="text-xl font-semibold mb-4">Business Information</h2>
                        <div className="space-y-6">
                            {renderField('Business Name', 'businessName', formData.businessName)}
                            {renderField('Phone Number', 'phone', formData.phone, 'tel')}
                            {renderField('Business Description', 'businessDescription', formData.businessDescription, 'text', false, true)}
                        </div>
                    </div>
                )}
                
                {isEditing && (
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button 
                            type="button" 
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    name: currentUser.name,
                                    email: currentUser.email,
                                    businessName: currentUser.businessName || '',
                                    businessDescription: currentUser.businessDescription || '',
                                    phone: currentUser.phone || '',
                                });
                            }}
                            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 font-semibold"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 font-semibold"
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </form>
            <div className="mt-8 border-t pt-6 text-center">
                 <button 
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
