import { NextRequest, NextResponse } from "next/server";
import MomentRegistry from "@/models/MomentRegistry";
import Movie from "@/models/Movie";
import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Find Interstellar for context
    const movie = await Movie.findOne({ title: "Interstellar" });
    if (!movie) return NextResponse.json({ error: "Interstellar not found" }, { status: 404 });

    const moments = [
      {
        contentId: movie._id.toString(),
        timestamp: 4200, // Docking sequence peak
        type: "action-peak",
        description: "The docking sequence begins - high tension!"
      },
      {
        contentId: movie._id.toString(),
        timestamp: 660, // Leaving Murph
        type: "romance", // Or 'emotional' but using current enum
        description: "Cooper drives away - emotional peak."
      },
      {
        contentId: movie._id.toString(),
        timestamp: 120, // Example Twist or Surprise
        type: "twist",
        description: "A sudden reveal early in the film."
      }
    ];

    await MomentRegistry.deleteMany({ contentId: movie._id.toString() });
    await MomentRegistry.insertMany(moments);

    return NextResponse.json({ 
      success: true, 
      count: moments.length,
      message: "Moment registry seeded for Interstellar!" 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
