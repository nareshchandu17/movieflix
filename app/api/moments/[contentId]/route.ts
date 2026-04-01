import { NextRequest, NextResponse } from "next/server";
import MomentRegistry from "@/models/MomentRegistry";
import connectDB from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    await connectDB();
    const { contentId } = await params;
    const moments = await MomentRegistry.find({ contentId });
    return NextResponse.json(moments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
