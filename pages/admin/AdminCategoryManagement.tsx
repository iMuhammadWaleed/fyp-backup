

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Category } from '../../server/types';

const AdminCategoryManagement: React.FC = () => {
    const { categories, deleteCategory, isLoading } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const openModal = (category: Category | null = null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleDelete = async (categoryId: string) => {
        if (window.confirm('Are you sure you want to delete this category? Any menu items in it will be moved to a default category.')) {
            const result = await deleteCategory(categoryId);
            alert(result.message);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Food Category Management</h1>
                <button onClick={() => openModal()} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                    Add New Category
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Category Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {categories.map(category => (
                            <tr key={category.id} className="border-b">
                                <td className="py-3 px-4">{category.name}</td>
                                <td className="py-3 px-4">
                                    <button onClick={() => openModal(category)} className="text-teal-600 hover:text-teal-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900 disabled:text-gray-400" disabled={isLoading}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <CategoryModal category={editingCategory} onClose={closeModal} />}
        </div>
    );
};

interface CategoryModalProps {
    category: Category | null;
    onClose: () => void;
}


const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose }) => {
    const { addCategory, updateCategory, isLoading } = useAppContext();
    const [name, setName] = useState(category?.name || '');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Category name cannot be empty.');
            return;
        }

        let result;
        if (category) { // Editing
            result = await updateCategory({ ...category, name });
        } else { // Adding
            result = await addCategory(name);
        }
        
        if (result.success) {
            alert(category ? 'Category updated successfully.' : 'Category added successfully.');
            onClose();
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-lg">
                 <div className="bg-slate-100 p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700 text-center">{category ? 'Edit Category' : 'Add New Category'}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    </div>
                    <div className="flex justify-end space-x-4 p-4 bg-slate-100 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 font-semibold text-sm">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 font-semibold text-sm disabled:bg-teal-400">
                            {isLoading ? 'Saving...' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCategoryManagement;
