// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('로그인 성공 후 메인 페이지 진입', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.getByPlaceholder('아이디를 입력하세요').fill('NEX21004');
  await page.getByPlaceholder('비밀번호를 입력하세요').fill('Nexus62402580@');

  await page.getByRole('button', { name: '로그인' }).click();

  await page.waitForURL('**/main');

  // ✅ '캠페인 그룹관리' 텍스트가 있는지 확인
  await expect(page.getByText('캠페인 그룹관리')).toBeVisible();

  // ✅ 우측 상단 ID 표시도 함께 체크
  await expect(page.getByText('NEX21004')).toBeVisible();
});
