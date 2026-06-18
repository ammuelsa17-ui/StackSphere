import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import LoginHistory from "@/models/LoginHistory";
import { parseBrowser, parseOS, parseDeviceType } from "@/utils/userAgent";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        // Connect to MongoDB
        await connectToDatabase();
        
        // Find the user and explicitly select the hidden password field
        const user = await User.findOne({ email: credentials.email }).select("+password");

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
