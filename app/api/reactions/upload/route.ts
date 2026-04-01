import { NextResponse } from 'next/server';
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// Check if Cloudinary is available
let useCloudinary = false;
let cloudinaryConfigured = false;

try {
  const cloudinary = require('cloudinary').v2;
  
  // Check if all required Cloudinary environment variables are set
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    useCloudinary = true;
    cloudinaryConfigured = true;
    console.log('✅ Cloudinary configured successfully for video uploads');
  } else {
    console.log('⚠️ Cloudinary credentials not found. Missing:', {
      cloudName: !!cloudName,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret
    });
    console.log('📁 Falling back to local storage');
  }
} catch (error) {
  console.log('❌ Cloudinary not available, using local storage:', error.message);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    let videoUrl: string;

    if (useCloudinary) {
      // Use Cloudinary if available
      console.log('🚀 Uploading video to Cloudinary...');
      const cloudinary = require('cloudinary').v2;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            resource_type: 'video', 
            folder: 'cineworld/reactions',
            format: 'mp4',
            quality: 'auto',
            fetch_format: 'auto'
          },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload failed:', error);
              reject(error);
            } else {
              console.log('✅ Cloudinary upload successful:', result?.public_id);
              resolve(result);
            }
          }
        );
        uploadStream.end(buffer);
      });

      videoUrl = (uploadResult as any).secure_url;
      console.log('📹 Video uploaded to Cloudinary:', videoUrl);
    } else {
      // Fallback to local storage
      console.log('📁 Using local storage fallback...');
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'reactions');
      await mkdir(uploadsDir, { recursive: true });

      const fileExtension = file.name.split('.').pop() || 'webm';
      const uniqueFilename = `${uuidv4()}.${fileExtension}`;
      const filePath = join(uploadsDir, uniqueFilename);

      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      videoUrl = `/uploads/reactions/${uniqueFilename}`;
      console.log('📹 Video saved locally:', videoUrl);
    }

    return NextResponse.json({ url: videoUrl });
  } catch (error: any) {
    console.error('[API /reactions/upload] Error:', error.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
