import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

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

    // 3. Parse and extract request body properties
    const body = await req.json();
    const { name, phoneNumber, avatarUrl } = body;

    // 4. Validate required name field
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required and cannot be empty." },
        { status: 400 }
      );
    }

    // 5. Connect to the database
    await connectToDatabase();

    // 6. Find and update the user document in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      (session.user as any).id,
      {
        name: name.trim(),
        phoneNumber: phoneNumber ? phoneNumber.trim() : "",
        avatarUrl: avatarUrl ? avatarUrl.trim() : "",
      },
      { new: true, runValidators: true } // Returns the modified document & checks model constraints
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User profile could not be found." },
        { status: 404 }
      );
    }

    // 7. Respond with the updated profile
    return NextResponse.json({
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);

    // Intercept Mongoose schema validation failures
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages[0] || "Validation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during the profile update." },
      { status: 500 }
    );
  }
}
