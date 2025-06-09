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
  matcher: [ "/rank/:path*", 
    "/closing-rank/:path*",
    "/pending-payment/:path*",
],
};
