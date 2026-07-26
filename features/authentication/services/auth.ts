/**
 * @file auth.ts
 * @description Core utility services for MovieFlix authentication.
 * Uses strict Google OAuth.
 */

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/features/authentication/models/User";
import Collection from "@/features/history/models/Collection";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    async signIn({ user }: any) {
      try {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const newUser = await User.create({
            googleId: user.id,
            name: user.name,
            email: user.email,
            avatar: user.image,
            onboardingCompleted: true,
            lastLogin: new Date(),
          });
          
          // Create default Watchlist collection for new user
          await Collection.create({
            userId: newUser._id,
            name: "Watchlist",
            icon: "📺",
            description: "Your personal watchlist",
            isDefault: true,
          });
          
          user.id = newUser._id.toString();
          user.onboardingCompleted = false;
        } else {
          existingUser.lastLogin = new Date();
          await existingUser.save();
          user.id = existingUser._id.toString();
          user.onboardingCompleted = existingUser.onboardingCompleted;
          user.role = existingUser.role || "user";
        }

        return true;
      } catch (error) {
        console.error("SIGNIN ERROR:", error);
        return false;
      }
    },

    async jwt({ token, user }: any) {
      if (user) {
        // Initial sign in
        token.email = user.email;
        token.id = user.id;
        token.onboardingCompleted = user.onboardingCompleted;
        token.role = user.role || "user";
        token.verifiedProfiles = []; 
      } else {
        // Subsequent requests
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).select('onboardingCompleted role');
          if (dbUser) {
            token.onboardingCompleted = dbUser.onboardingCompleted;
            token.role = dbUser.role || "user";
          }
        } catch (error) {
          console.error("Error refreshing onboarding status:", error);
        }
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.email = token.email;
        session.user.id = token.id;
        session.user.onboardingCompleted = token.onboardingCompleted;
        session.user.role = token.role || "user";
        session.user.verifiedProfiles = token.verifiedProfiles || [];
      }
      return session;
    },

    async redirect({ url, baseUrl }: any) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    // Retain default sign in behavior
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  logger: {
    error(code, ...message) {
      if (code === 'JWT_SESSION_ERROR') {
        return;
      }
      console.error(code, ...message);
    },
    warn(code, ...message) {
      console.warn(code, ...message);
    },
    debug(code, ...message) {}
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
