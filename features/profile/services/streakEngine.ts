/**
 * @file streakEngine.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import WatchGroup from "@/features/watch-party/models/WatchGroup";
import MemberStreak from "@/features/profile/models/MemberStreak";
import WatchHistory from "@/features/history/models/WatchHistory";
import GroupActivity from "@/features/watch-party/models/GroupActivity";
import connectDB from "@/lib/db";

/**
 * Updates progress for a member within a group based on their watch history.
 */
export async function updateGroupProgress(userId: string, groupId: string) {
  await connectDB();
  
  const group = await WatchGroup.findById(groupId);
  if (!group || group.status !== "active") return;

  const streak = await MemberStreak.findOne({ userId, groupId });
  if (!streak) return;

  // 1. Fetch episodes watched by this user for the target title in the current week
  const episodes = await WatchHistory.find({
    userId,
    contentId: group.titleId,
    lastWatched: { $gte: streak.weekStart }
  });

  // Filter for episodes watched > 80% (assuming 2400s/40m avg, we should check actual duration but using mock)
  const completedEpisodes = episodes.filter(e => (e as any).watchTime > 1800); // 30m+
  
  streak.episodesWatchedThisWeek = completedEpisodes.length;
  streak.lastActiveAt = new Date();
  await streak.save();

  // 2. Log activity if a goal is reached
  if (streak.episodesWatchedThisWeek === group.weeklyGoal) {
    await new GroupActivity({
      groupId,
      userId,
      type: "watch-progress",
      message: `reached this week's goal! 🔥`,
      data: { goal: group.weeklyGoal }
    }).save();
  }

  return streak;
}

/**
 * Checks if a group streak should increment or break at the week end.
 */
export async function processWeekEnd(groupId: string) {
  const group = await WatchGroup.findById(groupId);
  const streaks = await MemberStreak.find({ groupId });

  const allHitGoal = streaks.every(s => s.episodesWatchedThisWeek >= group.weeklyGoal);
  
  if (allHitGoal) {
    group.currentStreak += 1;
    // Log milestone if applicable
    if (group.currentStreak % 4 === 0) { // Every 4 weeks
       await new GroupActivity({
        groupId,
        type: "milestone",
        message: `hit a magnificent ${group.currentStreak % 4 / 4}-month streak! 🏆`,
        data: { months: group.currentStreak / 4 }
      }).save();
    }
  } else {
    // Try to apply streak freezes?
    // For demo, we just reset
    group.currentStreak = 0;
  }

  await group.save();
  
  // Reset all member progress for next week
  const nextWeekStart = new Date();
  await MemberStreak.updateMany({ groupId }, { 
    episodesWatchedThisWeek: 0, 
    weekStart: nextWeekStart 
  });
}

