// fe_pdsw_for_playwright\tests\campaign-management-click-test.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/login.helper';

test('캠페인 관리 탭 생성 테스트', async ({ page }) => {
  // 로그인
  await loginAsAdmin(page);
  console.log('✅ 로그인 완료');
  
  await page.waitForTimeout(1000);
  
  // 🎯 핵심 테스트: 캠페인 관리 클릭 → 탭 생성 확인
  
  // 1. 캠페인 관리 버튼 클릭
  const campaignButton = page.getByText('캠페인 관리');
  await expect(campaignButton).toBeVisible({ timeout: 5000 });
  await campaignButton.click();
  console.log('🖱️ 캠페인 관리 버튼 클릭');
  
  // 2. 캠페인 관리 탭이 등록되었는지 확인
  await page.waitForTimeout(2000);
  
  // 방법 1: role="tab" 으로 확인 (가장 확실)
  const tabByRole = page.getByRole('tab', { name: '캠페인 관리' });
  if (await tabByRole.count() > 0) {
    await expect(tabByRole).toBeVisible();
    console.log('✅ [role=tab] 캠페인 관리 탭 등록 확인');
    return;
  }
  
  // 방법 2: 탭이 2개 이상 있는지 확인 (버튼 1개 + 탭 1개)
  const campaignTexts = page.getByText('캠페인 관리');
  const count = await campaignTexts.count();
  expect(count).toBeGreaterThanOrEqual(2);
  console.log(`✅ 캠페인 관리 텍스트 ${count}개 확인 (버튼 + 탭)`);
  
  console.log('🎉 캠페인 관리 탭 생성 테스트 완료!');
});