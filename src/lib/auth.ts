import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import LoginHistory from "@/models/LoginHistory";
import { parseBrowser, parseOS, parseDeviceType } from "@/utils/userAgent";
import { sanitizeString, validateEmail } from "@/utils/validation";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "OTP Code", type: "text" },
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
        
        // Find the user and explicitly select the hidden password field
        const user = await User.findOne({ email: emailClean }).select("+password +verificationCode +verificationCodeExpires");

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Compare the password with the hashed password in the database
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

        // Mobile login window check (blocked outside 10:00 AM - 1:00 PM)
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
        if (browser === "Chrome") {
          const code = credentials?.code ? String(credentials.code).trim() : "";
          if (!code) {
            // Generate OTP code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);
            
            user.verificationCode = verificationCode;
            user.verificationCodeExpires = verificationExpiry;
            await user.save();
            
            console.log(`[MOCK EMAIL CHALLENGE] Sent OTP code "${verificationCode}" to email "${user.email}"`);
            throw new Error("OTP_REQUIRED");
          } else {
            // Validate code
            const codeMatches = user.verificationCode === code;
            const codeActive = user.verificationCodeExpires && user.verificationCodeExpires > new Date();
            
            if (!codeMatches || !codeActive) {
              throw new Error("Invalid or expired OTP code.");
            }
            
            // Clear verification fields
            user.verificationCode = "";
            user.verificationCodeExpires = null;
            await user.save();
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
  secret: process.env.NEXTAUTH_SECRET, // Secret key used to encrypt the JWT session cookie
};
