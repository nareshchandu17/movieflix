import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a video buffer/file to Cloudinary and generates a thumbnail automatically.
 * @param fileBuffer The video file buffer or base64 string
 * @param folder The folder to upload to (default: reaction_clips)
 */
export async function uploadReactionVideo(
  fileBuffer: Buffer | string,
  folder: string = "reaction_clips"
) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error("Cloudinary cloud name is not configured");
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error("Cloudinary API key is not configured");
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary API secret is not configured");
    }

    console.log("Starting Cloudinary upload to folder:", folder);

    const options = {
      resource_type: "video" as const,
      folder: folder,
      transformation: [
        { width: 1280, height: 720, crop: "limit" }, // Normalize size
        { quality: "auto", fetch_format: "auto" }
      ],
      // Generate a thumbnail at the 1-second mark or first frame
      eager: [
        { 
          width: 640, 
          height: 360, 
          crop: "pad", 
          format: "jpg", 
          resource_type: "image",
          start_offset: "1"
        }
      ],
      eager_async: false
    };

    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload stream error:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload successful:", result?.public_id);
            resolve(result);
          }
        }
      );
      
      if (Buffer.isBuffer(fileBuffer)) {
          uploadStream.end(fileBuffer);
      } else {
          // If it's a string (e.g. base64), we use to upload method instead
          cloudinary.uploader.upload(fileBuffer, options).then(resolve).catch(reject);
      }
    });

    const result = uploadResponse as any;

    if (!result || !result.secure_url) {
      throw new Error("Invalid upload response from Cloudinary");
    }

    return {
      videoUrl: result.secure_url,
      thumbnailUrl: result.eager?.[0]?.secure_url || result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
      duration: result.duration,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (error instanceof Error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
    throw new Error("Failed to upload video to Cloudinary");
  }
}

export default cloudinary;
