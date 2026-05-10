import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Subscription from "@/models/Subscription";
import { PLANS } from "@/types/payment";
import connectDB from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const newPlanId = searchParams.get("planId");

    const sub = await Subscription.findOne({ userId: session.user.id, status: "active" });
    if (!sub) return NextResponse.json({ error: "NO_ACTIVE_SUBSCRIPTION" }, { status: 404 });

    const currentPlan = PLANS.find(p => p.id === sub.planId);
    const newPlan = PLANS.find(p => p.id === newPlanId);

    if (!currentPlan) return NextResponse.json({ error: "CURRENT_PLAN_NOT_FOUND" }, { status: 404 });
    if (!newPlan) return NextResponse.json({ error: "INVALID_PLAN" }, { status: 400 });

    const today = new Date();
    const endDate = new Date(sub.currentPeriodEnd);
    const totalDays = 30; // Approximation for simplicity
    const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const currentPrice = sub.billingCycle === "annually" ? currentPlan.annualPrice : currentPlan.monthlyPrice;
    const newPriceBase = sub.billingCycle === "annually" ? newPlan.annualPrice : newPlan.monthlyPrice;

    const dailyCost = currentPrice / totalDays;
    const credit = remainingDays * dailyCost;
    const finalPrice = Math.max(0, newPriceBase - credit);

    return NextResponse.json({ 
      success: true, 
      credit, 
      newPrice: finalPrice,
      remainingDays 
    });

  } catch (err) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
