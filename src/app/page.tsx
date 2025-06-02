// src/app/page.tsx
import { redirect } from 'next/navigation'

// 이후 메인 페이지에 대쉬 보드가 추가 될수도 있을것 같아 이렇게 구성
export default function MainPage() {
  redirect('/main')
}