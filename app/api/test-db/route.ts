import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";

export async function GET() {
  try {
    console.log("🧪 Testing database connection...");
    
    // Check environment
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI missing");
      return NextResponse.json({ 
        error: "MONGODB_URI not configured",
        env: {
          MONGODB_URI: !!process.env.MONGODB_URI,
          NODE_ENV: process.env.NODE_ENV
        }
      }, { status: 500 });
    }
    
    console.log("🔌 Attempting database connection...");
    await dbConnect();
    console.log("✅ Database connected successfully");
    
    // Test a simple query
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({ 
      success: true,
      message: "Database connection successful",
      collections: collections.map(c => c.name),
      env: {
        MONGODB_URI: process.env.MONGODB_URI?.substring(0, 20) + "...",
        NODE_ENV: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error("❌ Database test failed:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Database connection failed",
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        MONGODB_URI: !!process.env.MONGODB_URI,
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
