
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, UserRole } from '../../types';

const AdminUserManagement: React.FC = () => {
    const { users, currentUser, deleteUser, isLoading } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const openModal = (user: User | null = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const result = await deleteUser(userId);
            alert(result.message);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <button onClick={() => openModal()} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                    Add New User
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Role</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {users.map(user => (
                            <tr key={user.id} className="border-b">
                                <td className="py-3 px-4">{user.name}</td>
                                <td className="py-3 px-4">{user.email}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : user.role === 'CATERER' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                    <button onClick={() => openModal(user)} className="text-teal-600 hover:text-teal-900 mr-4 font-medium">Edit</button>
                                    <button 
                                        onClick={() => handleDelete(user.id)} 
                                        className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                                        disabled={currentUser?.id === user.id || isLoading}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <UserModal user={editingUser} onClose={closeModal} />}
        </div>
    );
};

interface UserModalProps {
    user: User | null;
    onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose }) => {
    const { addUser, updateUser, isLoading } = useAppContext();
    const [formData, setFormData] = useState({
        id: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || UserRole.CUSTOMER,
        businessName: user?.businessName || '',
    });
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const userData: Omit<User, 'id'> & { id?: string } = {
            ...formData,
            businessName: formData.role !== UserRole.CUSTOMER ? formData.businessName : undefined,
        };

        let result;
        if (user) { // Editing existing user
            result = await updateUser(userData as User);
        } else { // Adding new user
             if (!password) {
                setError("Password is required for new users.");
                return;
            }
            result = await addUser({ ...userData, password });
        }

        if (result.success) {
            alert(user ? 'User updated successfully.' : 'User added successfully.');
            onClose();
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="bg-slate-100 p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700 text-center">{user ? 'Edit User' : 'Add New User'}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"/>
                        </div>
                        {!user && (
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"/>
                            </div>
                        )}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                            <select name="role" id="role" value={formData.role} onChange={handleChange} required className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                            <option value={UserRole.CUSTOMER}>Customer</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                            <option value={UserRole.CATERER}>Caterer</option>
                            </select>
                        </div>
                        {formData.role !== UserRole.CUSTOMER && (
                             <div>
                                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
                                <input type="text" name="businessName" id="businessName" value={formData.businessName} onChange={handleChange} required className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"/>
                            </div>
                        )}
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    </div>
                    <div className="flex justify-end space-x-4 p-4 bg-slate-100 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 font-semibold text-sm">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 font-semibold text-sm disabled:bg-teal-400">
                           {isLoading ? 'Saving...' : 'Save User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default AdminUserManagement;
