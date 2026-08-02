/**
 * Cloudinary Media Storage Utility.
 * Validates magic-byte signatures and dispatches uploads to Cloudinary when configured,
 * falling back to local storage in explicit development environments.
 */

import fs from "fs/promises";
import path from "path";

interface UploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: "image" | "video";
  format: string;
  bytes: number;
}

/**
 * Validates raw file buffer magic-byte headers to prevent fake MIME extensions.
 */
export function validateMagicBytes(buffer: Buffer, declaredMimeType: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  const hexHeader = buffer.subarray(0, 8).toString("hex").toUpperCase();

  // JPEG: FF D8 FF
  if (declaredMimeType === "image/jpeg") {
    return hexHeader.startsWith("FFD8FF");
  }

  // PNG: 89 50 4E 47
  if (declaredMimeType === "image/png") {
    return hexHeader.startsWith("89504E47");
  }

  // GIF: 47 49 46 38
  if (declaredMimeType === "image/gif") {
    return hexHeader.startsWith("47494638");
  }

  // WebP: 52 49 46 46 (RIFF)
  if (declaredMimeType === "image/webp") {
    return hexHeader.startsWith("52494646");
  }

  // MP4 / Video: 00 00 00 .. 66 74 79 70 (ftyp)
  if (declaredMimeType === "video/mp4") {
    return hexHeader.includes("66747970") || hexHeader.startsWith("000000");
  }

  // WebM: 1A 45 DF A3
  if (declaredMimeType === "video/webm") {
    return hexHeader.startsWith("1A45DFA3");
  }

  return false;
}

export async function uploadMedia(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  const isProduction = process.env.NODE_ENV === "production";
  const cloudinaryUrl = process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME;

  const resourceType: "image" | "video" = mimeType.startsWith("video/") ? "video" : "image";
  const format = mimeType.split("/")[1] || "png";
  const bytes = buffer.length;

  // Real Cloudinary Upload if SDK/environment variables present
  if (cloudinaryUrl) {
    let cloudinaryModule: any = null;
    try {
      cloudinaryModule = require("cloudinary").v2;
    } catch (err) {
      cloudinaryModule = null;
    }

    if (cloudinaryModule) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinaryModule.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: "stacksphere_uploads",
            public_id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          },
          (error: any, result: any) => {
            if (error) {
              return reject(new Error(`Cloudinary upload failed: ${error.message}`));
            }
            resolve({
              secureUrl: result.secure_url,
              publicId: result.public_id,
              resourceType,
              format: result.format || format,
              bytes: result.bytes || bytes,
            });
          }
        );
        uploadStream.end(buffer);
      });
    }
  }

  // Production Enforcement Check
  if (isProduction && !cloudinaryUrl) {
    throw new Error(
      "Media Upload Failed: Cloudinary environment variables (CLOUDINARY_URL) are required in production."
    );
  }

  // Explicit Development Fallback (Local Disk)
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}_${fileName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, uniqueName), buffer);

  return {
    secureUrl: `/uploads/${uniqueName}`,
    publicId: `local_${uniqueName}`,
    resourceType,
    format,
    bytes,
  };
}

export async function deleteMedia(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  if (publicId.startsWith("local_")) {
    const filename = publicId.replace("local_", "");
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    try {
      await fs.unlink(filePath);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Cloudinary Deletion
  const cloudinaryUrl = process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudinaryUrl) {
    try {
      const cloudinaryModule = require("cloudinary").v2;
      await cloudinaryModule.uploader.destroy(publicId);
      return true;
    } catch (err) {
      console.warn("Cloudinary asset deletion error:", err);
      return false;
    }
  }

  return true;
}
