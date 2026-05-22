/**
 * @file cookie-utils.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { NextResponse } from 'next/server';

export function clearProfileCookie(response?: NextResponse) {
  const res = response || NextResponse.next();
  res.cookies.delete('mf_active_profile');
  return res;
}

export function setProfileCookie(profileId: string, response?: NextResponse) {
  const res = response || NextResponse.next();
  res.cookies.set('mf_active_profile', profileId, { 
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res;
}
