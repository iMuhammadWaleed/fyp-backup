
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file in the root directory
dotenv.config();

import connectToDatabase from './db';
import { User, MenuItem, Category, Order } from './models';
import { getMealPlanFromServer } from './gemini';
import { User as UserType, MenuItem as MenuItemType, Category as CategoryType, Order as OrderType, UserRole } from '../types';
import { Types } from 'mongoose';

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies, increase limit for images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Serve Frontend Static Files ---
const rootDir = process.cwd();
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
    deleteUser: async ({ userId }: any