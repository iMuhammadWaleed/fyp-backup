// This file runs on the server as part of a Vercel Serverless Function.

import mongoose from 'mongoose';
import { User, Category, MenuItem, Order } from './models';
import { MOCK_USERS, MOCK_CATEGORIES, MOCK_MENU_ITEMS, MOCK_ORDERS } from '../constants';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local or your Vercel project settings.');
}

// Mongoose connection caching to improve performance on serverless functions
// FIX: Use `globalThis` which is standard across JS environments.
let cached = (globalThis as any).mongoose;

if (!cached) {
    // FIX: Use `globalThis` which is standard across JS environments.
    cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
      cached.conn = await cached.promise;
  } catch (e) {
      cached.promise = null;
      throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
