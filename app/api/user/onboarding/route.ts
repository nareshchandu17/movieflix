import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { username, dob, phone, interests, moods } = await req.json();

    // Validate required fields
    if (!username || !dob) {
      return NextResponse.json(
        { message: "Username and date of birth are required" },
        { status: 400 }
      );
    }

    // Validate interests (minimum 3)
    if (!interests || interests.length < 3) {
      return NextResponse.json(
        { message: "Please select at least 3 interests" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if username is already taken
    const existingUsername = await User.findOne({ 
      username, 
      _id: { $ne: session.user.id } 
    });
    
    if (existingUsername) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 400 }
      );
    }

    // Update user with onboarding data
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        username,
        dob,
        phone: phone || null,
        interests,
        moods,
        onboardingCompleted: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: "Onboarding completed successfully",
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          onboardingCompleted: updatedUser.onboardingCompleted,
        },
        // Trigger session update on client
        updateSession: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Onboarding POST error:", error);
    return NextResponse.json(
      { message: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select('username email dob phone interests moods onboardingCompleted');

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error("Onboarding GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch onboarding data" },
      { status: 500 }
    );
  }
}
