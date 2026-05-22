/**
 * @file mongodb.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  // Use fallback if not found, to prevent crash in dev
  console.warn('MONGODB_URI not found, using fallback for development');
}

let cached = (global as any).mongoose || { conn: null, promise: null };

if (!(global as any).mongoose) {
  (global as any).mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = MONGODB_URI || 'mongodb://localhost:27017/MovieFlix';
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(uri, opts).then((m) => {
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
