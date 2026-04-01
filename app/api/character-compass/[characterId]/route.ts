import { NextRequest, NextResponse } from "next/server";
import { getCharacterCompassData } from "@/lib/characterEngine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    const { characterId } = await params;
    if (!characterId) {
      return NextResponse.json({ error: "Character ID is required" }, { status: 400 });
    }

    const data = await getCharacterCompassData(characterId);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Character compass fetch failed:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}
