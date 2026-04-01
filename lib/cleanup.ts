import { connectDB } from "@/lib/db";
import OTP from "@/models/OTP";

/**
 * Cleanup expired OTPs
 * This function should be run periodically (e.g., every hour)
 */
export async function cleanupExpiredOTPs() {
  try {
    await connectDB();
    
    // Delete OTPs that have expired
    const result = await OTP.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
    
    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up expired OTPs:", error);
    return 0;
  }
}

/**
 * Cleanup old OTPs (older than 24 hours)
 * This function should be run daily
 */
export async function cleanupOldOTPs() {
  try {
    await connectDB();
    
    // Delete OTPs older than 24 hours
    const result = await OTP.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    
    console.log(`Cleaned up ${result.deletedCount} old OTPs`);
    
    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up old OTPs:", error);
    return 0;
  }
}

/**
 * Get OTP statistics for monitoring
 */
export async function getOTPStats() {
  try {
    await connectDB();
    
    const totalOTPs = await OTP.countDocuments();
    const activeOTPs = await OTP.countDocuments({
      expiresAt: { $gt: new Date() },
      isVerified: false,
      isUsed: false,
    });
    const verifiedOTPs = await OTP.countDocuments({ isVerified: true });
    const usedOTPs = await OTP.countDocuments({ isUsed: true });
    
    return {
      totalOTPs,
      activeOTPs,
      verifiedOTPs,
      usedOTPs,
    };
  } catch (error) {
    console.error("Error getting OTP stats:", error);
    return null;
  }
}

export default {
  cleanupExpiredOTPs,
  cleanupOldOTPs,
  getOTPStats,
};
