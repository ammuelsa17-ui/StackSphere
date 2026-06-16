import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

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
