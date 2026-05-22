/**
 * @file auth-v2.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import * as jwt from 'jsonwebtoken';

export const AuthManager = {
  verifyToken: (token: string) => {
    try {
      if (!process.env.NEXTAUTH_SECRET) {
        console.warn('NEXTAUTH_SECRET not set for WebSocket authentication');
        return null;
      }
      return jwt.verify(token, process.env.NEXTAUTH_SECRET) as any;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
};
