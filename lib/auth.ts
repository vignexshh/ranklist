import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
    

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET!,
    
    session:{
        strategy:"jwt",

    },

    callbacks: {
        async jwt({ token, account, user}) {
            if (account && user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.image = user.image;

           
            }

            return token;
        },
        async session({ session,  token}) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string
                session.user.image = token.picture as string
           
            }

            return session;

        },
    },
    pages:{
        signIn: "/login",
    }
}