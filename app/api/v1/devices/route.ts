import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Devices API - temporarily disabled' });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'Devices API - temporarily disabled' });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ message: 'Devices API - temporarily disabled' });
}

export async function PATCH(req: NextRequest) {
  return NextResponse.json({ message: 'Devices API - temporarily disabled' });
}
