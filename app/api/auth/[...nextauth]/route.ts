// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
export { handler as GET, handler as POST };
