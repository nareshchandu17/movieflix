import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Invoice } from "@/models/Invoice";
import connectDB from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { id } = await params;
    const invoice = await Invoice.findOne({ _id: id, userId: session.user.id });

    if (!invoice) return NextResponse.json({ error: "INVOICE_NOT_FOUND" }, { status: 404 });

    // Minimal working response with data
    // PDF generation would typically involve a library like 'jspdf' or 'pdfkit' 
    // but the requirement is "no UI logic inside" and "minimal working code".
    return NextResponse.json({ 
      success: true, 
      invoice: {
        id: invoice._id,
        amount: invoice.amount,
        plan: invoice.plan,
        date: invoice.date,
        transactionId: invoice.transactionId
      }
    });

  } catch (err) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
