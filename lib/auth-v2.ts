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
