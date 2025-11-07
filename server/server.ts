
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
// FIX: Define `__dirname` for ES module compatibility.
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import connectToDatabase from './db';
import { User, MenuItem, Category, Order } from './models';
import { getMealPlanFromServer } from './gemini';
import { User as UserType, MenuItem as MenuItemType, Category as CategoryType, Order as OrderType, UserRole } from '../../types';
import { Types } from 'mongoose';

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies, increase limit for images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Serve Frontend Static Files ---
const rootDir = path.resolve(__dirname, '../../');
app.use(express.static(rootDir));

// --- API Logic (from former api/index.ts) ---
const logic = {
    fetchAllData: async () => {
        const users = await User.find({}).select('-password').lean();
        const categories = await Category.find({}).lean();
        const menuItems = await MenuItem.find({}).lean();
        const orders = await Order.find({}).sort({ orderDate: -1 }).lean();
        return { users, categories, menuItems, orders };
    },
    loginUser: async ({ email, password }: any) => {
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (user && user.password === password) {
            const { password: _, ...userWithoutPassword } = user.toObject();
            return { success: true, user: userWithoutPassword, message: 'Login successful.' };
        }
        return { success: false, user: null, message: 'Invalid credentials.' };
    },
    getUserById: async ({ userId }: any) => {
        const user = await User.findById(userId).select('-password').lean();
        if (user) {
            return { success: true, user: user };
        }
        return { success: false, user: null, message: 'User session not found.' };
    },
    resetPassword: async ({ email, newPassword }: any) => {
        await User.updateOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }, { $set: { password: newPassword } });
        return { success: true, message: 'Password reset successful.' };
    },
    addUser: async ({ userData }: any) => {
        const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${userData.email}$`, 'i') } });
        if (existingUser) {
            return { success: false, data: null, message: 'An account with this email already exists.' };
        }
        const newUser = new User(userData);
        await newUser.save();
        const { password: _, ...userWithoutPassword } = newUser.toObject();
        return { success: true, data: userWithoutPassword, message: 'User added.' };
    },
    updateUser: async ({ updatedUser }: any) => {
        const { id, ...updateData } = updatedUser;
        const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        return { success: true, data: user, message: 'User updated.' };
    },
    deleteUser: async ({ userId }: any) => {
        const userToDelete = await User.findById(userId);
        if (!userToDelete) return { success: false, message: "User not found." };

        if (userToDelete.role === UserRole.CUSTOMER) {
            const orderCount = await Order.countDocuments({ userId: userToDelete._id });
            if (orderCount > 0) {
                 return { success: false, message: `Cannot delete customer "${userToDelete.name}". They have existing order(s).` };
            }
        }
        
        let successMessage = `User "${userToDelete.name}" deleted successfully.`;
        if (userToDelete.role === UserRole.CATERER) {
             const adminUser = await User.findOne({ role: UserRole.ADMIN });
             const fallbackCatererId = adminUser ? adminUser._id : (await User.findOne({}))?._id;
             if(fallbackCatererId){
                 const updateResult = await MenuItem.updateMany({ catererId: userToDelete._id }, { $set: { catererId: fallbackCatererId } });
                 if (updateResult.modifiedCount > 0) {
                     successMessage += `\n${updateResult.modifiedCount} menu item(s) were reassigned.`;
                 }
             }
        }
        
        await User.findByIdAndDelete(userId);
        return { success: true, message: successMessage };
    },
    updateCart: async ({ userId, cart }: any) => {
        await User.findByIdAndUpdate(userId, { $set: { cart: cart } });
        return { success: true, message: 'Cart updated.' };
    },
    updateFavorites: async ({ userId, favorites }: any) => {
        await User.findByIdAndUpdate(userId, { $set: { favorites: favorites } });
        return { success: true, message: 'Favorites updated.' };
    },
    addMenuItem: async ({ itemData }: any) => {
        const newItem = new MenuItem(itemData);
        await newItem.save();
        return { success: true, data: newItem, message: 'Item added.' };
    },
    updateMenuItem: async ({ updatedItem }: any) => {
        const { id, ...updateData } = updatedItem;
        const item = await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
        return { success: true, data: item, message: 'Item updated.' };
    },
    deleteMenuItem: async ({ itemId }: any) => {
        const isInOrder = await Order.exists({ 'items.item._id': new Types.ObjectId(itemId) });
        if (isInOrder) {
            const item = await MenuItem.findById(itemId);
            return { success: false, message: `Cannot delete "${item?.name || 'the item'}" because it is part of existing orders.` };
        }
        await MenuItem.findByIdAndDelete(itemId);
        return { success: true, message: 'Item deleted.' };
    },
    addCategory: async ({ categoryName }: any) => {
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });
        if (existingCategory) {
            return { success: false, data: null, message: 'A category with this name already exists.' };
        }
        const newCategory = new Category({ name: categoryName });
        await newCategory.save();
        return { success: true, data: newCategory, message: 'Category added.' };
    },
    updateCategory: async ({ updatedCategory }: any) => {
         const existingCategory = await Category.findOne({ 
             name: { $regex: new RegExp(`^${updatedCategory.name}$`, 'i') }, 
             _id: { $ne: updatedCategory.id } 
         });
       if (existingCategory) {
           return { success: false, data: null, message: 'Another category with this name already exists.' };
       }
       const category = await Category.findByIdAndUpdate(updatedCategory.id, { name: updatedCategory.name }, { new: true });
       return { success: true, data: category, message: 'Category updated.' };
    },
    deleteCategory: async ({ categoryId }: any) => {
        const defaultCategory = await Category.findOne().sort({ createdAt: 1 }); // Assuming first created is default
        if (!defaultCategory || defaultCategory._id.toString() === categoryId) {
             return { success: false, message: 'Cannot delete the default category.' };
        }
        await MenuItem.updateMany({ categoryId: categoryId }, { $set: { categoryId: defaultCategory._id } });
        await Category.findByIdAndDelete(categoryId);
        return { success: true, message: 'Category deleted and items reassigned.' };
    },
    placeOrder: async ({ user, cart, total }: any) => {
        if (cart.length === 0) return { success: false, data: null, message: 'Cart is empty.' };
        
        const newOrder = new Order({
            userId: user.id,
            customerName: user.name,
            items: cart,
            total: total,
            status: 'Pending',
            orderDate: new Date().toISOString(),
        });
        await newOrder.save();
        return { success: true, data: newOrder.toObject(), message: 'Order placed.' };
    },
    updateOrderStatus: async ({ orderId, status }: any) => {
        await Order.findByIdAndUpdate(orderId, { $set: { status: status } });
        return { success: true, message: 'Order status updated.' };
    },
    deleteOrder: async ({ orderId }: any) => {
        const order = await Order.findById(orderId);
        if (order && order.status !== 'Delivered' && order.status !== 'Cancelled') {
             return { success: false, message: 'Cannot delete an order that is not completed or cancelled.' };
        }
        await Order.findByIdAndDelete(orderId);
        return { success: true, message: 'Order deleted.' };
    },
    generateMealPlan: async ({ preferredItemNames, allMenuItems, budget }: any) => {
        const recommendedNames = await getMealPlanFromServer(preferredItemNames, allMenuItems, budget);
        return { success: true, data: recommendedNames };
    },
};

// --- API Endpoint ---
app.post('/api', async (req, res) => {
    const { action, payload } = req.body;

    if (!action) {
        return res.status(400).json({ success: false, message: 'Action not specified.' });
    }

    const actionFunction = (logic as any)[action];

    if (!actionFunction) {
        return res.status(400).json({ success: false, message: `Invalid action: ${action}` });
    }

    try {
        await connectToDatabase();
        const result = await actionFunction(payload);
        return res.status(200).json(result);
    } catch (error: any) {
        console.error(`Error executing action ${action}:`, error);
        return res.status(500).json({ success: false, message: error.message || 'An internal server error occurred.' });
    }
});

// --- Catch-all to serve index.html for any other route (for client-side routing) ---
app.get('*', (req, res) => {
  res.sendFile(path.resolve(rootDir, 'index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log('Frontend is available at the same address.');
});