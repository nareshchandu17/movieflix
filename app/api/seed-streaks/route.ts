import { NextRequest, NextResponse } from "next/server";
import WatchGroup from "@/models/WatchGroup";
import MemberStreak from "@/models/MemberStreak";
import GroupActivity from "@/models/GroupActivity";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // 1. Create/Find target users
    let alex = await User.findOne({ name: "Alex" });
    if (!alex) alex = await User.create({ name: "Alex", email: "alex@example.com", password: "password123" });
    
    let sarah = await User.findOne({ name: "Sarah" });
    if (!sarah) sarah = await User.create({ name: "Sarah", email: "sarah@example.com", password: "password123" });

    // 2. Create the Watch Group
    const group = await WatchGroup.create({
      name: "Tars' Team",
      titleId: "interstellar-123", // Dummy ID
      members: [
        { userId: alex._id, role: "creator" },
        { userId: sarah._id, role: "member" }
      ],
      weeklyGoal: 3,
      currentStreak: 12,
      status: "active"
    });

    // 3. Create Member Streaks
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 4); // 4 days ago

    await MemberStreak.create([
      { 
        userId: alex._id, 
        groupId: group._id, 
        episodesWatchedThisWeek: 3, 
        weekStart,
        currentPersonalStreak: 12
      },
      { 
        userId: sarah._id, 
        groupId: group._id, 
        episodesWatchedThisWeek: 1, 
        weekStart,
        currentPersonalStreak: 4,
        status: "critical" // Custom UI hint for demo
      }
    ]);

    // 4. Initial Activity
    await GroupActivity.create([
      {
        groupId: group._id,
        userId: alex._id,
        type: "watch-progress",
        message: "just watched E12 — 'No Time for Caution' 🎹"
      },
      {
        groupId: group._id,
        type: "nudge",
        message: "Group streak at risk! Sarah needs 2 more episodes. ⏰"
      }
    ]);

    return NextResponse.json({ 
      success: true, 
      groupId: group._id,
      message: "Watch group 'Tars' Team' seeded for Interstellar!" 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
