import WatchGroup from "@/models/WatchGroup";
import MemberStreak from "@/models/MemberStreak";
import GroupActivity from "@/models/GroupActivity";
import { getGeminiService } from "./geminiService";

/**
 * Scans active groups and generates nudges for lagging members.
 */
export async function generateNudges(groupId: string) {
  const group = await WatchGroup.findById(groupId);
  if (!group) return;

  const streaks = await MemberStreak.find({ groupId }).populate("userId", "name");
  const laggingMembers = streaks.filter(s => s.episodesWatchedThisWeek < group.weeklyGoal);

  if (laggingMembers.length === 0) return;

  const gemini = getGeminiService();
  
  for (const member of laggingMembers) {
    // Determine context (How far are we into the week?)
    const daysLeft = 7 - Math.floor((new Date().getTime() - member.weekStart.getTime()) / (1000 * 3600 * 24));
    
    if (daysLeft <= 2) {
      // High pressure nudge
      const nudgeMessage = `Hey ${(member.userId as any).name}, your crew is counting on you! Only ${daysLeft} days left to hit your goal. 🍿`;
      
      await new GroupActivity({
        groupId,
        type: "nudge",
        message: nudgeMessage,
        data: { targetUserId: member.userId }
      }).save();
    }
  }
}
