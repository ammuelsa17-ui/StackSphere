import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import LoginHistory from "@/models/LoginHistory";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const results: { name: string; status: "PASS" | "FAIL"; message: string }[] = [];

  const addResult = (name: string, status: "PASS" | "FAIL", message: string) => {
    results.push({ name, status, message });
  };

  try {
    // ----------------------------------------------------
    // Test 1: Database Connection Check
    // ----------------------------------------------------
    try {
      await connectToDatabase();
      if (mongoose.connection.readyState >= 1) {
        addResult("Database Connection", "PASS", "Successfully connected to MongoDB.");
      } else {
        throw new Error("Mongoose connection state is inactive.");
      }
    } catch (err: any) {
      addResult("Database Connection", "FAIL", err.message || "Failed to connect to MongoDB.");
      return NextResponse.json({ status: "error", results });
    }

    // ----------------------------------------------------
    // Cleanup any remnants of previous test runs
    // ----------------------------------------------------
    await User.deleteOne({ email: "testauth@example.com" });
    await LoginHistory.deleteMany({ email: "testauth@example.com" });

    // ----------------------------------------------------
    // Test 2: Registration Validation (Empty Payload)
    // ----------------------------------------------------
    try {
      const req = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const response = await registerHandler(req);
      const data = await response.json();

      if (response.status === 400 && data.error) {
        addResult("Registration Validation (Empty)", "PASS", `Rejected empty fields correctly: "${data.error}"`);
      } else {
        addResult("Registration Validation (Empty)", "FAIL", `Expected status 400, got ${response.status}. Msg: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      addResult("Registration Validation (Empty)", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // Test 3: Registration Validation (Invalid Email)
    // ----------------------------------------------------
    try {
      const req = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Auth",
          email: "invalidemailformat",
          password: "password123",
        }),
      });
      const response = await registerHandler(req);
      const data = await response.json();

      if (response.status === 400 && data.error && data.error.includes("email")) {
        addResult("Registration Validation (Format)", "PASS", `Rejected invalid email format correctly: "${data.error}"`);
      } else {
        addResult("Registration Validation (Format)", "FAIL", `Expected validation failure, got status ${response.status}. Msg: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      addResult("Registration Validation (Format)", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // Test 4: Valid User Registration
    // ----------------------------------------------------
    let createdUser: any = null;
    try {
      const req = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Auth User",
          email: "testauth@example.com",
          password: "password123",
        }),
      });
      const response = await registerHandler(req);
      const data = await response.json();

      if (response.status === 201 && data.user) {
        addResult("User Registration", "PASS", "Test user registered successfully with HTTP 201.");
        
        // Verify in DB directly that password is hashed
        createdUser = await User.findOne({ email: "testauth@example.com" }).select("+password");
        if (createdUser && createdUser.password !== "password123" && createdUser.password.startsWith("$2")) {
          addResult("Password Encryption", "PASS", "User password encrypted successfully using bcrypt.");
        } else {
          addResult("Password Encryption", "FAIL", "Password was not stored, or stored in plaintext/incorrect hash format.");
        }
      } else {
        addResult("User Registration", "FAIL", `Expected HTTP 201, got ${response.status}. Response: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      addResult("User Registration", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // Test 5: Duplicate Registration Check
    // ----------------------------------------------------
    try {
      const req = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Duplicate User",
          email: "testauth@example.com",
          password: "password456",
        }),
      });
      const response = await registerHandler(req);
      const data = await response.json();

      if (response.status === 400 && data.error && (data.error.includes("already registered") || data.error.includes("already exists"))) {
        addResult("Duplicate Email Check", "PASS", `Rejected duplicate email successfully: "${data.error}"`);
      } else {
        addResult("Duplicate Email Check", "FAIL", `Expected status 400, got ${response.status}. Msg: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      addResult("Duplicate Email Check", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // Test 6: NextAuth Credentials Authorization (Wrong Password)
    // ----------------------------------------------------
    const credentialsProvider = authOptions.providers.find((p) => p.id === "credentials");
    if (!credentialsProvider || typeof (credentialsProvider as any).authorize !== "function") {
      addResult("NextAuth Provider Setup", "FAIL", "NextAuth credentials provider authorize callback missing.");
    } else {
      const authorize = credentialsProvider.options?.authorize || (credentialsProvider as any).authorize;

      try {
        await authorize(
          { email: "testauth@example.com", password: "wrongpassword" },
          null
        );
        addResult("NextAuth Authorize (Invalid Credentials)", "FAIL", "Expected invalid password error, but authorize succeeded.");
      } catch (err: any) {
        if (err.message && err.message.toLowerCase().includes("invalid")) {
          addResult("NextAuth Authorize (Invalid Credentials)", "PASS", `Successfully rejected wrong password: "${err.message}"`);
        } else {
          addResult("NextAuth Authorize (Invalid Credentials)", "FAIL", `Authorize failed with unexpected error: "${err.message}"`);
        }
      }

      // ----------------------------------------------------
      // Test 7: NextAuth Credentials Authorization (Success + Metadata)
      // ----------------------------------------------------
      let authenticatedUser: any = null;
      try {
        const mockReq = {
          headers: {
            get: (key: string) => {
              if (key === "user-agent") return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
              if (key === "x-forwarded-for") return "192.168.4.45";
              return null;
            },
          },
        };

        authenticatedUser = await authorize(
          { email: "testauth@example.com", password: "password123" },
          mockReq as any
        );

        if (
          authenticatedUser &&
          authenticatedUser.email === "testauth@example.com" &&
          authenticatedUser.ipAddress === "192.168.4.45" &&
          authenticatedUser.userAgent.includes("Chrome")
        ) {
          addResult("NextAuth Authorize (Success)", "PASS", "Validated credentials and captured user-agent/IP address headers.");
        } else {
          addResult("NextAuth Authorize (Success)", "FAIL", `Returned user: ${JSON.stringify(authenticatedUser)}`);
        }
      } catch (err: any) {
        addResult("NextAuth Authorize (Success)", "FAIL", err.message);
      }

      // ----------------------------------------------------
      // Test 8: NextAuth SignIn Callback & LoginHistory Logger
      // ----------------------------------------------------
      if (authenticatedUser && authOptions.callbacks?.signIn) {
        try {
          const signInCallback = authOptions.callbacks.signIn;
          const allowed = await signInCallback({
            user: authenticatedUser,
            account: { provider: "credentials" } as any,
            profile: {} as any,
            email: {} as any,
            credentials: {} as any,
          });

          if (allowed === true) {
            // Check that a LoginHistory document was created in MongoDB
            const log = await LoginHistory.findOne({ email: "testauth@example.com" });

            if (
              log &&
              log.ipAddress === "192.168.4.45" &&
              log.browser === "Chrome" &&
              log.os === "Windows" &&
              log.deviceType === "Desktop"
            ) {
              addResult(
                "Login History Tracking",
                "PASS",
                `Login log created: browser=${log.browser}, os=${log.os}, device=${log.deviceType}, IP=${log.ipAddress}`
              );
            } else {
              addResult(
                "Login History Tracking",
                "FAIL",
                `Expected parsed log document, got: ${JSON.stringify(log)}`
              );
            }
          } else {
            addResult("Login History Tracking", "FAIL", "signIn callback rejected login attempt.");
          }
        } catch (err: any) {
          addResult("Login History Tracking", "FAIL", err.message);
        }
      } else {
        addResult("Login History Tracking", "FAIL", "Skipped: Success authorization or signIn callback not found.");
      }
    }

    // ----------------------------------------------------
    // Test 9: Profile Details Update & Mongoose Validation
    // ----------------------------------------------------
    if (createdUser) {
      try {
        // Simulate profile update logic
        const updated = await User.findByIdAndUpdate(
          createdUser._id,
          { name: "Updated Test Name", phoneNumber: "+91 9999988888" },
          { new: true, runValidators: true }
        );

        if (updated && updated.name === "Updated Test Name" && updated.phoneNumber === "+91 9999988888") {
          addResult("Profile Database Update", "PASS", "Updated user name and phone number successfully in MongoDB.");
        } else {
          addResult("Profile Database Update", "FAIL", `Fields did not save correctly: ${JSON.stringify(updated)}`);
        }

        // Test empty name validation
        try {
          await User.findByIdAndUpdate(
            createdUser._id,
            { name: "" },
            { new: true, runValidators: true }
          );
          addResult("Profile Model Validation (Name)", "FAIL", "Expected empty name update to throw Validation Error, but it succeeded.");
        } catch (err: any) {
          if (err.name === "ValidationError" || err.message.includes("Name is required")) {
            addResult("Profile Model Validation (Name)", "PASS", `Successfully rejected empty name update: "${err.message}"`);
          } else {
            addResult("Profile Model Validation (Name)", "FAIL", `Unexpected validation error: ${err.message}`);
          }
        }
      } catch (err: any) {
        addResult("Profile Database Update", "FAIL", err.message);
      }
    } else {
      addResult("Profile Database Update", "FAIL", "Skipped: Test user was not successfully registered.");
    }

    // ----------------------------------------------------
    // Test 10: Teardown Cleanup
    // ----------------------------------------------------
    try {
      const userDelete = await User.deleteOne({ email: "testauth@example.com" });
      const logDelete = await LoginHistory.deleteMany({ email: "testauth@example.com" });

      if (userDelete.deletedCount > 0) {
        addResult("Database Teardown", "PASS", "Cleaned up temporary user and login log documents.");
      } else {
        addResult("Database Teardown", "FAIL", `Cleanup delete count was 0: userDeleted=${userDelete.deletedCount}, logsDeleted=${logDelete.deletedCount}`);
      }
    } catch (err: any) {
      addResult("Database Teardown", "FAIL", err.message);
    }

  } catch (globalErr: any) {
    addResult("Test Suite Runner", "FAIL", globalErr.message || "Global test suite failure.");
  }

  // Determine overall status
  const anyFailures = results.some((r) => r.status === "FAIL");
  return NextResponse.json({
    status: anyFailures ? "failure" : "success",
    timestamp: new Date().toISOString(),
    results,
  });
}
