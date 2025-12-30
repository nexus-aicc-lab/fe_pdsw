// src/app/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// 이후 메인 페이지에 대쉬 보드가 추가 될수도 있을것 같아 이렇게 구성
export default async function MainPage() {
  // 쿠키에서 session_key 가져오기
  const sessionKey = (await cookies()).get('session_key')?.value;

  if (!sessionKey) {
    redirect('/login'); // 세션 없으면 로그인으로
  }
  redirect('/main');  // 세션 있으면 메인으로
}