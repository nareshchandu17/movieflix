import { NextResponse } from 'next/server';

export async function GET() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return NextResponse.json({
    cloudinary: {
      configured: !!(cloudName && apiKey && apiSecret),
      cloudName: cloudName ? '✅ Set' : '❌ Missing',
      apiKey: apiKey ? '✅ Set' : '❌ Missing', 
      apiSecret: apiSecret ? '✅ Set' : '❌ Missing',
    },
    message: 'Cloudinary configuration status'
  });
}
