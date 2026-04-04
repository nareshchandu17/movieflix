import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Action } from "@/lib/models/Action";

export async function GET() {
  try {
    console.log("🧪 Testing Action model...");
    
    await dbConnect();
    console.log("✅ Database connected");
    
    // Test if Action model exists and can be queried
    const count = await Action.countDocuments();
    const sample = await Action.findOne().lean();
    
    return NextResponse.json({ 
      success: true,
      message: "Action model working",
      count,
      sample: sample ? {
        id: sample.id,
        title: sample.title,
        hasPoster: !!sample.poster_path
      } : null
    });
    
  } catch (error) {
    console.error("❌ Action model test failed:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Action model test failed",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
