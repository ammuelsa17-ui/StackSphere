import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  try {
    // 1. Get the current active session
    const session = await getServerSession(authOptions);

    // 2. Reject if the user is unauthenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    // 3. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // 4. Validate file existence
    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    // 5. Validate file type (image or video)
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Invalid file format. Only images and videos are supported." },
        { status: 400 }
      );
    }

    // 6. Enforce file size limits
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 20 * 1024 * 1024; // 20MB

    if (isImage && file.size > maxImageSize) {
      return NextResponse.json(
        { error: "Image size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    if (isVideo && file.size > maxVideoSize) {
      return NextResponse.json(
        { error: "Video size exceeds the 20MB limit." },
        { status: 400 }
      );
    }

    // 7. Generate a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || "upload";
    const extension = originalName.split(".").pop() || (isImage ? "png" : "mp4");
    const uniqueFilename = `upload-${Date.now()}-${Math.floor(
      Math.random() * 100000
    )}.${extension}`;

    // 8. Save the file to public/uploads/ directory
    const publicDirectory = join(process.cwd(), "public", "uploads");
    const filePath = join(publicDirectory, uniqueFilename);
    
    await writeFile(filePath, buffer);

    // 9. Respond with the saved URL path
    return NextResponse.json(
      {
        success: true,
        url: `/uploads/${uniqueFilename}`,
        type: isImage ? "image" : "video",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during file upload." },
      { status: 500 }
    );
  }
}
