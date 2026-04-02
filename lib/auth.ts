import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "./db";
import User from "@/models/User";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
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
            onboardingCompleted: true, // New users no longer need to complete onboarding
            lastLogin: new Date(),
          });
          user.id = newUser._id.toString();
          user.onboardingCompleted = false;
        } else {
          existingUser.lastLogin = new Date();
          await existingUser.save();
          user.id = existingUser._id.toString();
          user.onboardingCompleted = existingUser.onboardingCompleted;
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
      } else {
        // Subsequent requests - refresh onboarding status from database
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).select('onboardingCompleted');
          if (dbUser) {
            token.onboardingCompleted = dbUser.onboardingCompleted;
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
      }
      return session;
    },

    async redirect({ url, baseUrl }: any) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    // Retain default sign in behavior
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
