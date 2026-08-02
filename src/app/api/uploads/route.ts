import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Upload from "@/models/Upload";
import User from "@/models/User";
import { uploadMedia, deleteMedia, validateMagicBytes } from "@/utils/cloudinary";

// Allow up to 30s for large video uploads on Vercel serverless
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const dbUser = await User.findById(userId).select("subscription").lean();
    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile could not be found." },
        { status: 404 }
      );
    }

    const plan = dbUser.subscription?.plan || "Free";
    if (plan === "Free") {
      return NextResponse.json(
        { error: "Only premium subscribers (Bronze, Silver, Gold plans) can upload images and videos." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Invalid file format. Only images and videos are supported." },
        { status: 400 }
      );
    }

    // Plan tier file size limits
    const maxLimits: Record<string, number> = {
      Bronze: 5 * 1024 * 1024,
      Silver: 10 * 1024 * 1024,
      Gold: 20 * 1024 * 1024,
    };
    const maxAllowed = maxLimits[plan] || 5 * 1024 * 1024;

    if (file.size > maxAllowed) {
      return NextResponse.json(
        { error: `File size exceeds your ${plan} plan limit of ${maxAllowed / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Magic-Byte Header Validation (prevent renamed executable payload files)
    const isValidMagic = validateMagicBytes(buffer, file.type);
    if (!isValidMagic) {
      return NextResponse.json(
        { error: "File validation failed: raw binary headers do not match declared file extension." },
        { status: 400 }
      );
    }

    // Upload to Cloudinary (or dev local fallback)
    const uploadResult = await uploadMedia(buffer, file.name || "upload", file.type);

    await Upload.create({
      uploader: userId,
      filename: file.name || "upload",
      originalName: file.name || "upload",
      mimeType: file.type,
      size: file.size,
      url: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      associatedPost: null,
    });

    return NextResponse.json(
      {
        success: true,
        url: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        type: isImage ? "image" : "video",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during file upload." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { publicId } = await req.json();
    if (!publicId) {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }

    const deleted = await deleteMedia(publicId);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Deletion failed" }, { status: 500 });
  }
}
