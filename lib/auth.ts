/**
 * @file auth.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "./db";
import User from "@/models/User";
import type { AuthOptions } from "next-auth";
import { PasswordSecurity, TokenSecurity, DataLeakPrevention, LoginSecurity } from "./auth-security";
import { SecurityUtils } from "./security-v2";

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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = credentials.email as string;
          const password = credentials.password as string;

          // Check rate limiting
          const rateLimitCheck = LoginSecurity.recordAttempt(email, false);
          if (!rateLimitCheck.canAttempt) {
            DataLeakPrevention.safeLog('warn', `Login rate limit exceeded`, { email });
            throw new Error(`Account locked. Try again in ${Math.ceil((rateLimitCheck.lockoutRemaining || 0) / 60000)} minutes.`);
          }

          await connectDB();
          const user = await User.findOne({ email }).select('+password +twoFactorEnabled +twoFactorSecret');

          if (!user) {
            throw new Error("Invalid email or password");
          }

          // For OAuth users without password
          if (!user.password) {
            throw new Error("This account uses Google sign-in. Please use Google to sign in.");
          }

          // Verify password
          const isValidPassword = await PasswordSecurity.verifyPassword(password, user.password);
          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          // Check if 2FA is enabled
          if (user.twoFactorEnabled) {
            // Return user without session, requiring 2FA verification
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              requiresTwoFactor: true,
              twoFactorSecret: user.twoFactorSecret,
            };
          }

          // Record successful login
          LoginSecurity.recordAttempt(email, true);

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          // Return sanitized user data
          return DataLeakPrevention.sanitizeUserData(user.toObject());

        } catch (error) {
          DataLeakPrevention.safeLog('error', 'Authentication error', {
            email: credentials?.email,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          throw error;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
          // Profile selection is now forced by the absence of session cookies
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
        token.verifiedProfiles = []; // Track PIN-verified profiles in the session
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
        session.user.verifiedProfiles = token.verifiedProfiles || []; // Expose to client
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
  
  logger: {
    error(code, ...message) {
      // Suppress harmless JWT_SESSION_ERROR commonly caused by cross-contamination
      // of localhost cookies from other NextAuth projects or changed secrets.
      if (code === 'JWT_SESSION_ERROR') {
        return;
      }
      console.error(code, ...message);
    },
    warn(code, ...message) {
      console.warn(code, ...message);
    },
    debug(code, ...message) {
      console.debug(code, ...message);
    }
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
