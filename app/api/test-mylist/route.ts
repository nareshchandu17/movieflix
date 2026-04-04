import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";

export async function GET() {
  try {
    console.log("🧪 Testing MyList database connection...");
    
    console.log("🔌 Attempting database connection...");
    await dbConnect();
    console.log("✅ Database connected successfully");
    
    // Test a simple query
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({ 
      success: true,
      message: "MyList database connection successful",
      collections: collections.map(c => c.name),
      connection: "dbConnect from @/lib/db/mongodb"
    });
    
  } catch (error) {
    console.error("❌ MyList database test failed:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Database connection failed",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
