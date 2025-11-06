// This file runs on the server as part of a Vercel Serverless Function.
// It is not part of the client-side bundle.

import { promises as fs } from 'fs';
import path from 'path';
import { User, Category, MenuItem, Order } from '../types';
import { MOCK_USERS, MOCK_CATEGORIES, MOCK_MENU_ITEMS, MOCK_ORDERS } from '../constants';

// Vercel provides a writable /tmp directory for serverless functions
const DB_PATH = path.join('/tmp', 'gourmetgo_db.json');

export interface Database {
    users: User[];
    categories: Category[];
    menuItems: MenuItem[];
    orders: Order[];
}

let dbCache: Database | null = null;

export async function readDb(): Promise<Database> {
    // Use a simple in-memory cache to avoid reading from disk on every request
    if (dbCache) {
        return dbCache;
    }

    try {
        const dbJson = await fs.readFile(DB_PATH, 'utf-8');
        dbCache = JSON.parse(dbJson);
        return dbCache as Database;
    } catch (error) {
        // If the file doesn't exist, initialize it with mock data
        console.log('No database file found in /tmp, initializing with mock data.');
        const initialDb: Database = {
            users: JSON.parse(JSON.stringify(MOCK_USERS)),
            categories: JSON.parse(JSON.stringify(MOCK_CATEGORIES)),
            menuItems: JSON.parse(JSON.stringify(MOCK_MENU_ITEMS)),
            orders: JSON.parse(JSON.stringify(MOCK_ORDERS)),
        };
        // Persist the initial database
        await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2));
        dbCache = initialDb;
        return initialDb;
    }
}

export async function writeDb(data: Database): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    // Invalidate the cache whenever we write
    dbCache = JSON.parse(JSON.stringify(data));
}