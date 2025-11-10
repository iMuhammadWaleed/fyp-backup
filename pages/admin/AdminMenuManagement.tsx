

import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { MenuItem, UserRole } from '../../server/types.ts';

const AdminMenuManagement: React.FC = () => {
    const { menuItems, categories, deleteMenuItem, users, isLoading } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const allSelected = menuItems.length > 0 && selectedItems.length === menuItems.length;
            const someSelected = selectedItems.length > 0 && !allSelected;
            selectAllCheckboxRef.current.checked = allSelected;
            selectAllCheckboxRef.current.indeterminate = someSelected;
        }
    }, [selectedItems, menuItems]);

    const openModal = (item: MenuItem | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = async (itemId: string) => {
        if(window.confirm('Are you sure you want to delete this item?')) {
            const result = await deleteMenuItem(itemId);
            alert(result.message);
            if (result.success) {
                setSelectedItems(prev => prev.filter(id => id !== itemId));
            }
        }
    }

    const handleSelectItem = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(menuItems.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) {
            const results = await Promise.all(selectedItems.map(id => deleteMenuItem(id)));
            
            const successCount = results.filter(r => r.success).length;
            const errorMessages = results.filter(r => !r.success).map(r => r.message);
            
            let alertMessage = '';
            if (successCount > 0) {
                alertMessage += `${successCount} item(s) deleted successfully.\n\n`;
            }
            if (errorMessages.length > 0) {
                alertMessage += `${errorMessages.length} item(s) could not be deleted.\nReasons:\n- ${errorMessages.slice(0, 3).join('\n- ')}`;
                 if (errorMessages.length > 3) {
                    alertMessage += '\n- ... (and more)';
                }
            }

            alert(alertMessage.trim());
            
            // The context will refetch data, which will re-render the list.
            // We just need to clear the selection state.
            setSelectedItems([]);
        }
    }


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Menu Management</h1>
                <div className="flex items-center gap-4">
                     {selectedItems.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isLoading}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:bg-red-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                            <span>Delete ({selectedItems.length})</span>
                        </button>
                    )}
                    <button onClick={() => openModal()} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                        Add New Item
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                             <th className="py-3 px-4">
                                <input
                                    ref={selectAllCheckboxRef}
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    onChange={handleSelectAll}
                                    aria-label="Select all items"
                                />
                            </th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Image</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Caterer</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Category</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Price</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {menuItems.map(item => (
                            <tr key={item.id} className={`border-b align-middle transition-colors ${selectedItems.includes(item.id) ? 'bg-teal-50' : 'hover:bg-gray-50'}`}>
                                <td className="py-2 px-4">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                        aria-label={`Select ${item.name}`}
                                    />
                                </td>
                                <td className="py-2 px-4">
                                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                </td>
                                <td className="py-3 px-4">{item.name}</td>
                                <td className="py-3 px-4">{users.find(u => u.id === item.catererId)?.businessName || 'N/A'}</td>
                                <td className="py-3 px-4">{categories.find(c => c.id === item.categoryId)?.name}</td>
                                <td className="py-3 px-4">PKR {item.price.toFixed(2)}</td>
                                <td className="py-3 px-4">
                                    <button onClick={() => openModal(item)} className="text-teal-600 hover:text-teal-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 disabled:text-gray-400" disabled={isLoading}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <MenuItemModal item={editingItem} onClose={closeModal} />}
        </div>
    );
};

interface MenuItemModalProps {
    item: MenuItem | null;
    onClose: () => void;
}


const MenuItemModal: React.FC<MenuItemModalProps> = ({ item, onClose }) => {
    const { categories, addMenuItem, updateMenuItem, users, isLoading } = useAppContext();
    const caterers = users.filter(u => u.role === UserRole.CATERER || u.role === UserRole.ADMIN);

    const [formData, setFormData] = useState({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price || 0,
        imageUrl: item?.imageUrl || '',
        categoryId: item?.categoryId || categories[0]?.id || '',
        catererId: item?.catererId || caterers[0]?.id || ''
    });
    const [imageError, setImageError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'price' ? parseFloat(value) : value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageError('');
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImageError('Please select a valid image file (PNG, JPG).');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({...prev, imageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.imageUrl) {
            setImageError('An image is required.');
            return;
        }
        
        let result;
        if(item) {
            result = await updateMenuItem({ ...item, ...formData });
        } else {
            result = await addMenuItem(formData);
        }

        if (result.success) {
            alert(item ? 'Item updated successfully.' : 'Item added successfully.');
            onClose();
        } else {
             alert(`Error: ${result.message}`);
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                 <div className="bg-slate-100 p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700 text-center">{item ? 'Edit' : 'Add'} Menu Item</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required step="0.01" className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"/>
                        </div>
                         <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image</label>
                            <div className="mt-1 flex items-center">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-md mr-4" />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-200 rounded-md mr-4 flex items-center justify-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                                    </div>
                                )}
                                <input 
                                    id="image-upload" 
                                    name="image-upload" 
                                    type="file" 
                                    accept="image/png, image/jpeg"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                />
                            </div>
                            {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
                        </div>
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
                            <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="catererId" className="block text-sm font-medium text-gray-700">Caterer</label>
                            <select name="catererId" id="catererId" value={formData.catererId} onChange={handleChange} required className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
                                {caterers.map(c => <option key={c.id} value={c.id}>{c.businessName || c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 p-4 bg-slate-100 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 font-semibold text-sm">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 font-semibold text-sm disabled:bg-teal-400">
                           {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminMenuManagement;