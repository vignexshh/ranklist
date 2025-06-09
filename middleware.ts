import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ token, req }) {
      console.log("TOKEN in middleware:", token);
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    // Protected routes only
    "/rank/:path*", 
    // "/closing-rank/:path*",
    "/pending-payment/:path*",
    // Add more protected routes here as needed
  ],
};
