// src/app/api/auth/set-session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { session_key } = await request.json();
    
    if (!session_key) {
      return NextResponse.json(
        { error: 'Session key is required' },
        { status: 400 }
      );
    }

    (await cookies()).set('session_key', session_key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24시간
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // console.error('Error setting session:', error);
    return NextResponse.json(
      { error: 'Failed to set session' },
      { status: 500 }
    );
  }
}