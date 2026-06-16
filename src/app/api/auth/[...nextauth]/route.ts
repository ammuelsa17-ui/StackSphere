import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// Export NextAuth handlers for both GET (to fetch session) and POST (to authenticate)
export { handler as GET, handler as POST };
