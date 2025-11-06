// This file runs on the server as part of a Vercel Serverless Function.
// It is not part of the client-side bundle.

import { readDb, writeDb, Database } from './db';
import { User, MenuItem, Category, Order, CartItem, UserRole } from '../types';

// Define types for Vercel's request/response objects to avoid needing @vercel/node
interface VercelRequest {
  method: string;
  body: {
    action: string;
    payload: any;
  };
}
interface VercelResponse {
  status: (code: number) => {
    json: (data: any) => void;
  };
}

// --- Business Logic (moved from original apiService) ---

const logic = {
    fetchAllData: (db: Database) => {
        return {
            users: [...db.users],
            categories: [...db.categories],
            menuItems: [...db.menuItems],
            orders: [...db.orders],
        };
    },
    loginUser: (db: Database, { email, password }: any) => {
        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.password === password) {
            return { success: true, user, message: 'Login successful.' };
        }
        return { success: false, user: null, message: 'Invalid credentials.' };
    },
    resetPassword: (db: Database, { email, newPassword }: any) => {
        const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (userIndex > -1) {
            db.users[userIndex].password = newPassword;
        }
        return { success: true, message: 'Password reset successful.' };
    },
    addUser: (db: Database, { userData }: any) => {
        if (db.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return { success: false, data: null, message: 'An account with this email already exists.' };
        }
        const newUser: User = { ...userData, id: `user-${Date.now()}` };
        db.users.push(newUser);
        return { success: true, data: newUser, message: 'User added.' };
    },
    updateUser: (db: Database, { updatedUser }: any) => {
        db.users = db.users.map(u => u.id === updatedUser.id ? updatedUser : u);
        return { success: true, data: updatedUser, message: 'User updated.' };
    },
    deleteUser: (db: Database, { userId }: any) => {
        const userToDelete = db.users.find(u => u.id === userId);
        if (!userToDelete) return { success: false, message: "User not found." };
        if (userToDelete.role === UserRole.CUSTOMER && db.orders.some(order => order.userId === userId)) {
            return { success: false, message: `Cannot delete customer "${userToDelete.name}". They have existing order(s).` };
        }
        let successMessage = `User "${userToDelete.name}" deleted successfully.`;
        if (userToDelete.role === UserRole.CATERER) {
            const fallbackCatererId = 'user-1';
            const itemsToReassign = db.menuItems.filter(item => item.catererId === userId);
            if (itemsToReassign.length > 0) {
                db.menuItems = db.menuItems.map(item => item.catererId === userId ? { ...item, catererId: fallbackCatererId } : item);
                successMessage += `\n${itemsToReassign.length} menu item(s) were reassigned.`;
            }
        }
        db.users = db.users.filter(u => u.id !== userId);
        return { success: true, message: successMessage };
    },
    addMenuItem: (db: Database, { itemData }: any) => {
        const newItem: MenuItem = { ...itemData, id: `item-${Date.now()}` };
        db.menuItems.push(newItem);
        return { success: true, data: newItem, message: 'Item added.' };
    },
    updateMenuItem: (db: Database, { updatedItem }: any) => {
        db.menuItems = db.menuItems.map(i => i.id === updatedItem.id ? updatedItem : i);
        return { success: true, data: updatedItem, message: 'Item updated.' };
    },
    deleteMenuItem: (db: Database, { itemId }: any) => {
        const isInOrder = db.orders.some(order => order.items.some(cartItem => cartItem.item.id === itemId));
        if (isInOrder) {
            const itemName = db.menuItems.find(item => item.id === itemId)?.name || 'the item';
            return { success: false, message: `Cannot delete "${itemName}" because it is part of existing orders.` };
        }
        db.menuItems = db.menuItems.filter(i => i.id !== itemId);
        return { success: true, message: 'Item deleted.' };
    },
    addCategory: (db: Database, { categoryName }: any) => {
        if (db.categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
            return { success: false, data: null, message: 'A category with this name already exists.' };
        }
        const newCategory: Category = { id: `cat-${Date.now()}`, name: categoryName };
        db.categories.push(newCategory);
        return { success: true, data: newCategory, message: 'Category added.' };
    },
    updateCategory: (db: Database, { updatedCategory }: any) => {
        if (db.categories.some(c => c.name.toLowerCase() === updatedCategory.name.toLowerCase() && c.id !== updatedCategory.id)) {
           return { success: false, data: null, message: 'Another category with this name already exists.' };
       }
       db.categories = db.categories.map(c => c.id === updatedCategory.id ? updatedCategory : c);
       return { success: true, data: updatedCategory, message: 'Category updated.' };
    },
    deleteCategory: (db: Database, { categoryId }: any) => {
        const defaultCategory = db.categories[0];
        if (!defaultCategory || defaultCategory.id === categoryId) {
             return { success: false, message: 'Cannot delete the default category.' };
        }
        db.menuItems = db.menuItems.map(item => item.categoryId === categoryId ? { ...item, categoryId: defaultCategory.id } : item);
        db.categories = db.categories.filter(c => c.id !== categoryId);
        return { success: true, message: 'Category deleted and items reassigned.' };
    },
    placeOrder: (db: Database, { user, cart, total, paymentDetails }: any) => {
        if (cart.length === 0) return { success: false, data: null, message: 'Cart is empty.' };
        if (paymentDetails.method === 'credit-card' && paymentDetails.cardNumber?.endsWith('0000')) {
            return { success: false, data: null, message: 'Your credit card was declined.' };
        }
        if (paymentDetails.method === 'jazzcash' && paymentDetails.jazzcashCNIC === '000000') {
            return { success: false, data: null, message: 'JazzCash payment failed. Please check your details.' };
        }
        const newOrder: Order = {
            id: `order-${Date.now()}`,
            userId: user.id,
            customerName: user.name,
            items: cart,
            total: total,
            status: 'Pending',
            orderDate: new Date().toISOString(),
        };
        db.orders.push(newOrder);
        return { success: true, data: newOrder, message: 'Order placed.' };
    },
    updateOrderStatus: (db: Database, { orderId, status }: any) => {
        db.orders = db.orders.map(o => o.id === orderId ? { ...o, status } : o);
        return { success: true, message: 'Order status updated.' };
    },
    deleteOrder: (db: Database, { orderId }: any) => {
        const order = db.orders.find(o => o.id === orderId);
        if (order && order.status !== 'Delivered' && order.status !== 'Cancelled') {
             return { success: false, message: 'Cannot delete an order that is not completed or cancelled.' };
        }
        db.orders = db.orders.filter(o => o.id !== orderId);
        return { success: true, message: 'Order deleted.' };
    },
};

const writeActions = new Set([
    'resetPassword', 'addUser', 'updateUser', 'deleteUser', 'addMenuItem', 'updateMenuItem',
    'deleteMenuItem', 'addCategory', 'updateCategory', 'deleteCategory', 'placeOrder',
    'updateOrderStatus', 'deleteOrder'
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const db = await readDb();
  const { action, payload } = req.body;

  const actionFunction = (logic as any)[action];

  if (!actionFunction) {
      return res.status(400).json({ success: false, message: `Invalid action: ${action}` });
  }

  try {
    const result = actionFunction(db, payload);
  
    if (writeActions.has(action) && result.success) {
      await writeDb(db);
    }
  
    return res.status(200).json(result);
  } catch (error) {
    console.error(`Error executing action ${action}:`, error);
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}
