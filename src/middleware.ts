import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next();

    // Security headers to mitigate common web vulnerabilities
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    return response;
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

// Paths to protect (guests will be redirected to /login)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/social/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login-history/:path*",
  ],
};
