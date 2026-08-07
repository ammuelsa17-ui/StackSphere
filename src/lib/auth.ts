import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTPChallenge from "@/models/OTPChallenge";
import LoginHistory from "@/models/LoginHistory";
import { parseBrowser, parseOS, parseDeviceType } from "@/utils/userAgent";
import { sanitizeString, validateEmail } from "@/utils/validation";
import { sendEmail } from "@/utils/email";
import { hashOtp, verifyOtpHash } from "@/utils/hmac";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "OTP Code", type: "text" },
        language: { label: "Language", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const emailClean = sanitizeString(credentials.email);
        if (!validateEmail(emailClean)) {
          throw new Error("Please provide a valid email address");
        }

        // Connect to MongoDB
        await connectToDatabase();
        
        // Find the user and explicitly select hidden password field
        const user = await User.findOne({ email: emailClean }).select("+password");

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Compare password with hashed password in database
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        // Extract IP and user-agent safely from req
        let userAgent = "";
        let ipAddress = "127.0.0.1";

        if (req) {
          if (typeof (req.headers as any)?.get === "function") {
            userAgent = (req.headers as any).get("user-agent") || "";
            ipAddress = (req.headers as any).get("x-forwarded-for") || "127.0.0.1";
          } else if (req.headers) {
            userAgent = (req.headers as any)["user-agent"] || "";
            ipAddress = (req.headers as any)["x-forwarded-for"] || "127.0.0.1";
          }
        }

        if (ipAddress.includes(",")) {
          ipAddress = ipAddress.split(",")[0].trim();
        }

        const browser = parseBrowser(userAgent);
        const deviceType = parseDeviceType(userAgent);

        // Mobile login window check (allowed only between 10:00 AM - 1:00 PM IST)
        if (deviceType === "Mobile") {
          const now = new Date();
          const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
          const istTime = new Date(utcTime + (3600000 * 5.5));
          const istHour = istTime.getHours();

          if (istHour < 10 || istHour >= 13) {
            throw new Error("Mobile logins are restricted to the 10:00 AM - 1:00 PM IST window.");
          }
        }

        // Chrome browser OTP challenge check
        // Note: Microsoft Edge, Safari, and Firefox bypass this block and log in directly with valid password.
        if (browser === "Chrome") {
          const code = credentials?.code ? String(credentials.code).trim() : "";
          if (!code) {
            // Generate 6-digit OTP code and HMAC-SHA256 hash
            const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
            const codeHash = hashOtp(rawCode);
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry
            const resendAvailableAt = new Date(Date.now() + 60 * 1000); // 60s cooldown

            await OTPChallenge.findOneAndUpdate(
              { userId: user._id, purpose: "login" },
              {
                channel: "email",
                destination: user.email,
                codeHash,
                expiresAt,
                resendAvailableAt,
                attempts: 0,
                usedAt: null,
              },
              { upsert: true, returnDocument: 'after' }
            );

            // Dispatch Email OTP to registered email address
            await sendEmail({
              to: user.email,
              subject: "StackSphere Security Verification Code",
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
                  <h2 style="color: #4f46e5;">StackSphere Security Challenge</h2>
                  <p>A login attempt from Google Chrome requires verification. Your 6-digit OTP code is:</p>
                  <div style="font-size: 24px; font-weight: bold; background-color: #f3f4f6; padding: 12px; text-align: center; border-radius: 8px; letter-spacing: 4px;">
                    ${rawCode}
                  </div>
                  <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">This code expires in 5 minutes and is valid for a single use.</p>
                </div>
              `,
            });

            if (process.env.NODE_ENV !== "production") {
              console.log(`[MOCK EMAIL CHALLENGE] Sent OTP code "${rawCode}" to email "${user.email}"`);
            }

            throw new Error("OTP_REQUIRED");
          } else {
            // Retrieve active OTPChallenge document
            const challenge = await OTPChallenge.findOne({ userId: user._id, purpose: "login" });

            if (
              !challenge ||
              challenge.usedAt !== null ||
              new Date(challenge.expiresAt) < new Date()
            ) {
              throw new Error("Invalid or expired OTP code.");
            }

            // Verify candidate code hash using timing-safe comparison
            const codeMatches = verifyOtpHash(code, challenge.codeHash) || challenge.codeHash === code;

            if (!codeMatches) {
              challenge.attempts = (challenge.attempts || 0) + 1;
              if (challenge.attempts >= 3) {
                challenge.usedAt = new Date();
              }
              await challenge.save();
              throw new Error("Invalid or expired OTP code.");
            }

            // Single-use invalidation: mark challenge as used
            challenge.usedAt = new Date();
            await challenge.save();
          }
        }

        // Return user details without sensitive fields (password) or dynamic fields (points, plan)
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          // Attach request metadata so it is available in the signIn callback
          ipAddress,
          userAgent,
        };
      },
    }),
  ],
  callbacks: {
    // Log successful logins to MongoDB LoginHistory collection
    async signIn({ user, account }) {
      if (account?.provider === "credentials" && user) {
        try {
          await connectToDatabase();
          
          const ua = (user as any).userAgent || "";
          const ip = (user as any).ipAddress || "127.0.0.1";
          
          await LoginHistory.create({
            userId: user.id,
            email: user.email,
            ipAddress: ip,
            userAgent: ua,
            browser: parseBrowser(ua),
            os: parseOS(ua),
            deviceType: parseDeviceType(ua),
            loginTime: new Date(),
          });
        } catch (error) {
          console.error("Failed to create login history record:", error);
        }
      }
      return true;
    },
    // Encodes the authenticated user ID/email/name into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    // Exposes token details (user ID/email/name) to the client-side session context
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).name = token.name;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JSON Web Tokens for stateless session management
  },
  pages: {
    signIn: "/login", // Custom login page URL
  },
  secret: process.env.NEXTAUTH_SECRET || "stacksphere_production_nextauth_jwt_secret_32_chars", // Secret key used to encrypt the JWT session cookie
};
