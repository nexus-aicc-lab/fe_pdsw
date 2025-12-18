// src/app/page.tsx
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';

// 이후 메인 페이지에 대쉬 보드가 추가 될수도 있을것 같아 이렇게 구성
export default function MainPage() {
  // redirect('/main')
  const sessionKey = Cookies.get('session_key');

  if (!sessionKey) {
    redirect('/login'); // 세션 없으면 로그인으로
  } else {
    redirect('/main');  // 세션 있으면 메인으로
  }
}