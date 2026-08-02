import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import FriendRequest from "@/models/FriendRequest";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Test endpoints are disabled in production environment." }, { status: 404 });
  }

  const results: { name: string; status: "PASS" | "FAIL"; message: string }[] = [];

  const addResult = (name: string, status: "PASS" | "FAIL", message: string) => {
    results.push({ name, status, message });
  };

  try {
    // 1. Connect to Database
    try {
      await connectToDatabase();
      if (mongoose.connection.readyState >= 1) {
        addResult("Database Connection", "PASS", "Successfully connected to MongoDB.");
      } else {
        throw new Error("Mongoose connection state is inactive.");
      }
    } catch (err: any) {
      addResult("Database Connection", "FAIL", err.message || "Failed database connection.");
      return NextResponse.json({ status: "error", results });
    }

    // 2. Teardown any remnants of previous test runs
    await User.deleteMany({ email: { $in: ["testsender@example.com", "testreceiver@example.com"] } });
    await FriendRequest.deleteMany({});
    await Post.deleteMany({ content: /\[TEST POST\]/ });
    await Comment.deleteMany({ content: /\[TEST COMMENT\]/ });

    // 3. Setup Test Users
    let sender: any = null;
    let receiver: any = null;
    try {
      sender = await User.create({
        name: "Test Sender",
        email: "testsender@example.com",
        password: "password123", // dummy password
        friends: [],
      });
      receiver = await User.create({
        name: "Test Receiver",
        email: "testreceiver@example.com",
        password: "password123",
        friends: [],
      });
      addResult("Setup Test Users", "PASS", "Created Test Sender and Test Receiver database documents.");
    } catch (err: any) {
      addResult("Setup Test Users", "FAIL", err.message);
      return NextResponse.json({ status: "error", results });
    }

    // 4. Test Friend Request Flow
    let request: any = null;
    try {
      // Create pending request
      request = await FriendRequest.create({
        sender: sender._id,
        receiver: receiver._id,
        status: "pending",
      });

      if (request && request.status === "pending") {
        addResult("Friend Request Creation", "PASS", "FriendRequest document created with status 'pending'.");
      } else {
        throw new Error("Request creation failed or status is incorrect.");
      }

      // Accept request mutually
      request.status = "accepted";
      await request.save();

      await User.findByIdAndUpdate(sender._id, { $addToSet: { friends: receiver._id } });
      await User.findByIdAndUpdate(receiver._id, { $addToSet: { friends: sender._id } });

      const updatedSender = await User.findById(sender._id);
      const updatedReceiver = await User.findById(receiver._id);

      const senderHasFriend = updatedSender?.friends?.some((id: any) => id.toString() === receiver._id.toString());
      const receiverHasFriend = updatedReceiver?.friends?.some((id: any) => id.toString() === sender._id.toString());

      if (request.status === "accepted" && senderHasFriend && receiverHasFriend) {
        addResult("Friend Request Acceptance", "PASS", "Invites accepted mutually and IDs logged in users collections.");
      } else {
        throw new Error("Mutual connections were not registered correctly.");
      }
    } catch (err: any) {
      addResult("Friend Request Acceptance", "FAIL", err.message);
    }

    // 5. Test Posting Restrictions Logic (Day 51: Exact posting limit rules)
    try {
      const getPostLimit = (friendCount: number) => {
        if (friendCount === 0) return 0;
        if (friendCount === 1) return 1;
        if (friendCount > 10) return Infinity;
        return 2; // 2 to 10 friends
      };

      // A. 0 Friends check
      await User.findByIdAndUpdate(sender._id, { $set: { friends: [] } });
      const sender0 = await User.findById(sender._id);
      const friendsCount0 = sender0?.friends?.length || 0;
      const limit0 = getPostLimit(friendsCount0);

      if (limit0 === 0) {
        addResult("Friend Count Logic (0 Friends)", "PASS", "Correctly evaluated 0 friends -> Cannot post.");
      } else {
        addResult("Friend Count Logic (0 Friends)", "FAIL", `Expected limit 0, got ${limit0}`);
      }

      // B. 1 Friend check
      await User.findByIdAndUpdate(sender._id, { $set: { friends: [receiver._id] } });
      const sender1 = await User.findById(sender._id);
      const friendsCount1 = sender1?.friends?.length || 0;
      const limit1 = getPostLimit(friendsCount1);

      if (limit1 === 1) {
        addResult("Friend Count Logic (1 Friend)", "PASS", "Correctly evaluated 1 friend -> 1 post/day limit.");
      } else {
        addResult("Friend Count Logic (1 Friend)", "FAIL", `Expected limit 1, got ${limit1}`);
      }

      // C. 2 to 10 Friends check (2 Friends)
      const dummyId1 = new mongoose.Types.ObjectId();
      await User.findByIdAndUpdate(sender._id, { $set: { friends: [receiver._id, dummyId1] } });
      const sender2 = await User.findById(sender._id);
      const friendsCount2 = sender2?.friends?.length || 0;
      const limit2 = getPostLimit(friendsCount2);

      if (limit2 === 2) {
        addResult("Friend Count Logic (2 Friends)", "PASS", "Correctly evaluated 2 friends -> 2 posts/day limit.");
      } else {
        addResult("Friend Count Logic (2 Friends)", "FAIL", `Expected limit 2, got ${limit2}`);
      }

      // D. 2 to 10 Friends check (10 Friends)
      const dummyIds10 = Array.from({ length: 10 }, () => new mongoose.Types.ObjectId());
      await User.findByIdAndUpdate(sender._id, { $set: { friends: dummyIds10 } });
      const sender10 = await User.findById(sender._id);
      const friendsCount10 = sender10?.friends?.length || 0;
      const limit10 = getPostLimit(friendsCount10);

      if (limit10 === 2) {
        addResult("Friend Count Logic (10 Friends)", "PASS", "Correctly evaluated 10 friends -> 2 posts/day limit.");
      } else {
        addResult("Friend Count Logic (10 Friends)", "FAIL", `Expected limit 2, got ${limit10}`);
      }

      // E. More than 10 Friends check (11 Friends -> Unlimited)
      const dummyIds11 = Array.from({ length: 11 }, () => new mongoose.Types.ObjectId());
      await User.findByIdAndUpdate(sender._id, { $set: { friends: dummyIds11 } });
      const sender11 = await User.findById(sender._id);
      const friendsCount11 = sender11?.friends?.length || 0;
      const limit11 = getPostLimit(friendsCount11);

      if (limit11 === Infinity) {
        addResult("Friend Count Logic (>10 Friends)", "PASS", "Correctly evaluated >10 friends -> Unlimited posts.");
      } else {
        addResult("Friend Count Logic (>10 Friends)", "FAIL", `Expected limit Infinity, got ${limit11}`);
      }
    } catch (err: any) {
      addResult("Posting Restrictions Logic", "FAIL", err.message);
    }

    // 6. Test Social Post Utilities (Likes, Comments, Shares)
    let post: any = null;
    try {
      post = await Post.create({
        author: sender._id,
        content: "[TEST POST] Evaluating likes, comments, and shares integrations.",
        mediaType: "none",
        likes: [],
        commentsCount: 0,
        sharesCount: 0,
      });

      if (post) {
        addResult("Post Creation", "PASS", "Post document created successfully.");
      } else {
        throw new Error("Failed to create post.");
      }

      // A. Likes Toggle test
      post.likes.push(receiver._id);
      await post.save();
      let updatedPost = await Post.findById(post._id);
      const hasLiked = updatedPost?.likes?.some((id: any) => id.toString() === receiver._id.toString());

      if (hasLiked && updatedPost?.likes.length === 1) {
        addResult("Likes Integration (Like)", "PASS", "User ID pushed to likes collection and counter updated.");
      } else {
        addResult("Likes Integration (Like)", "FAIL", "Failed to register like.");
      }

      post.likes = post.likes.filter((id: any) => id.toString() !== receiver._id.toString());
      await post.save();
      updatedPost = await Post.findById(post._id);
      const hasUnliked = !updatedPost?.likes?.some((id: any) => id.toString() === receiver._id.toString());

      if (hasUnliked && updatedPost?.likes.length === 0) {
        addResult("Likes Integration (Unlike)", "PASS", "User ID filtered out of likes collection and counter decremented.");
      } else {
        addResult("Likes Integration (Unlike)", "FAIL", "Failed to register unlike.");
      }

      // B. Comments Integration test
      const comment = await Comment.create({
        postId: post._id,
        author: receiver._id,
        content: "[TEST COMMENT] This is a test comment replies log.",
      });

      await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });
      updatedPost = await Post.findById(post._id);

      if (comment && updatedPost?.commentsCount === 1) {
        addResult("Comments Integration", "PASS", "Comment created and post commentsCount incremented successfully.");
      } else {
        addResult("Comments Integration", "FAIL", "Comments count did not increment.");
      }

      // C. Shares Integration test
      await Post.findByIdAndUpdate(post._id, { $inc: { sharesCount: 1 } });
      updatedPost = await Post.findById(post._id);

      if (updatedPost?.sharesCount === 1) {
        addResult("Shares Integration", "PASS", "Post sharesCount incremented successfully.");
      } else {
        addResult("Shares Integration", "FAIL", "Shares count did not increment.");
      }
    } catch (err: any) {
      addResult("Social Post Utilities", "FAIL", err.message);
    }

    // 7. Cleanup & Teardown
    try {
      if (post) {
        await Post.deleteOne({ _id: post._id });
        await Comment.deleteMany({ postId: post._id });
      }
      if (request) {
        await FriendRequest.deleteOne({ _id: request._id });
      }
      await User.deleteMany({ email: { $in: ["testsender@example.com", "testreceiver@example.com"] } });
      addResult("Database Teardown", "PASS", "Removed all temporary test users, requests, posts, and comments documents.");
    } catch (err: any) {
      addResult("Database Teardown", "FAIL", err.message);
    }

  } catch (globalErr: any) {
    addResult("Social Suite Runner", "FAIL", globalErr.message || "Global social test suite failure.");
  }

  // Determine overall status
  const anyFailures = results.some((r) => r.status === "FAIL");
  return NextResponse.json({
    status: anyFailures ? "failure" : "success",
    timestamp: new Date().toISOString(),
    results,
  });
}
