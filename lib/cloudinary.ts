/**
 * @file cloudinary.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary config
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

/**
 * Uploads a video buffer or base64 data URI to Cloudinary with maximum reliability.
 * @param fileInput The video file as a Buffer or a base64 data URI string
 * @param folder The folder to upload to (default: reaction_clips)
 */
export async function uploadReactionVideo(
  fileInput: Buffer | string,
  folder: string = "reaction_clips"
) {
  configureCloudinary();

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials are not configured");
  }

  const uploadOptions: any = {
    resource_type: "video",
    folder,
    // We removed eager transformations during upload to maximize reliability.
    // Cloudinary can generate thumbnails on-the-fly via URL transformations.
  };

  try {
    let result: any;

    if (Buffer.isBuffer(fileInput)) {
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, uploadResult) => {
            if (error) reject(error);
            else resolve(uploadResult);
          }
        );
        stream.end(fileInput);
      });
    } else {
      // Direct upload for data URI string
      result = await cloudinary.uploader.upload(fileInput, uploadOptions);
    }

    if (!result || !result.secure_url) {
      throw new Error("No secure_url returned from Cloudinary");
    }

    // Cloudinary automatically provides a poster image if you change the extension to .jpg
    // This is much more reliable than eager generation during upload.
    const thumbnailUrl = result.secure_url.replace(/\.[^/.]+$/, ".jpg");

    return {
      videoUrl: result.secure_url,
      thumbnailUrl,
      duration: result.duration || 0,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error("[Cloudinary] Upload Error:", error);
    const message = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
    throw new Error(`Cloudinary upload failed: ${message}`);
  }
}

export default cloudinary;
