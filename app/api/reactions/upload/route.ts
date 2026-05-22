import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function getConfiguredCloudinary() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  const cloudinary = (await import('cloudinary')).v2;
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return cloudinary;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const cloudinary = await getConfiguredCloudinary();
    if (!cloudinary) {
      return NextResponse.json(
        { error: 'Video uploads require Cloudinary configuration' },
        { status: 503 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'MovieFlix/reactions',
          format: 'mp4',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(error || new Error('Cloudinary upload did not return a URL'));
            return;
          }

          resolve({ secure_url: result.secure_url });
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error: any) {
    console.error('[API /reactions/upload] Error:', error.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
