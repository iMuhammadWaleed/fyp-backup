// This file runs on the server as part of a Vercel Serverless Function.

import mongoose from 'mongoose';
import { User, Category, MenuItem, Order } from './models';
import { MOCK_USERS, MOCK_CATEGORIES, MOCK_MENU_ITEMS, MOCK_ORDERS } from '../constants';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local or your Vercel project settings.');
}

// Mongoose connection caching to improve performance on serverless functions
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (mongoose) => {
             console.log('New MongoDB connection established.');
            // Seed the database only if it's empty
            await seedDatabase();
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

// Seed the database with initial mock data if it's empty
async function seedDatabase() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('Seeding database with initial users...');
            // We need to handle password hashing here if we were using a real auth system.
            // For now, we'll store them as is from the mock data.
            await User.insertMany(MOCK_USERS);
        }

        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            console.log('Seeding database with initial categories...');
            await Category.insertMany(MOCK_CATEGORIES);
        }

        const menuItemCount = await MenuItem.countDocuments();
        if (menuItemCount === 0) {
            console.log('Seeding database with initial menu items...');
            await MenuItem.insertMany(MOCK_MENU_ITEMS);
        }
        
        const orderCount = await Order.countDocuments();
        if (orderCount === 0) {
            console.log('Seeding database with initial orders...');
            await Order.insertMany(MOCK_ORDERS);
        }
        
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}


export default connectToDatabase;
