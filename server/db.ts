import mongoose from 'mongoose';

// Mongoose connection caching to improve performance
let cached = (globalThis as any).mongoose;

if (!cached) {
    cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("New database connection established.");
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