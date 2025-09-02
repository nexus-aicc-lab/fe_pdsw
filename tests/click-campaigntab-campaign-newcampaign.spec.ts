import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/login.helper';

test('테넌트 노드에서 새 캠페인 클릭 시 새 캠페인 탭이 등록되는지 테스트', async ({ page }) => {
  // 로그인
  await loginAsAdmin(page);
  
  
  await page.waitForTimeout(1000);
  
  // 🎯 핵심 테스트: 테넌트 노드 → 새 캠페인 클릭 → 탭 생성 확인
  
  // 1. 캠페인 관리로 이동
  const campaignManagementButton = page.locator('button:has(span:text("캠페인 관리"))');
  await expect(campaignManagementButton).toBeVisible({ timeout: 5000 });
  await campaignManagementButton.click();
  await page.waitForTimeout(3000);
  
  
  // 2. 탭 컨테이너 확인
  const tabContainer = page.locator('div[data-droppable-tabs-container="true"]');
  await expect(tabContainer).toBeVisible();
  
  
  // 3. 새 캠페인 클릭 전 탭 개수 확인
  const initialTabCount = await tabContainer.locator('div[data-tab-id]').count();
  
  
  // 4. 테넌트 노드 찾기 (NEXUS_DEV 사용)
  const tenantNode = page.locator('div.folder-node').filter({ hasText: 'NEXUS_DEV' }).first();
  await expect(tenantNode).toBeVisible({ timeout: 10000 });
  
  
  // 5. 테넌트 노드 우클릭 (컨텍스트 메뉴)
  await tenantNode.click({ button: 'right' });
  await page.waitForTimeout(1000);
  
  
  // 6. 🎯 컨텍스트 메뉴에서만 새 캠페인 선택 (구체적인 선택자 사용)
  // 방법 1: role="menuitem"으로 찾기
  const newCampaignMenuItem = page.getByRole('menuitem', { name: '새 캠페인' });
  if (await newCampaignMenuItem.count() > 0) {
    await expect(newCampaignMenuItem).toBeVisible({ timeout: 5000 });
    await newCampaignMenuItem.click();
    
  } else {
    // 방법 2: 컨텍스트 메뉴 컨테이너 내에서 찾기
    const contextMenu = page.locator('[role="menu"], [data-radix-popper-content-wrapper]').first();
    const newCampaignInContext = contextMenu.getByText('새 캠페인');
    await expect(newCampaignInContext).toBeVisible({ timeout: 5000 });
    await newCampaignInContext.click();
    
  }
  
  await page.waitForTimeout(3000);
  
  // 7. 새 캠페인 탭이 추가되었는지 확인 (개수 비교)
  const afterTabCount = await tabContainer.locator('div[data-tab-id]').count();
  expect(afterTabCount).toBeGreaterThan(initialTabCount);
  
  
  // 8. 새 캠페인 탭이 실제로 존재하는지 확인 (탭 컨테이너 내에서만)
  const newCampaignTab = tabContainer.locator('div[data-tab-id]').filter({ hasText: '새 캠페인' });
  await expect(newCampaignTab).toBeVisible({ timeout: 10000 });
  
  
  // 9. 탭이 활성화된 상태인지 확인
  const tabText = newCampaignTab.locator('span').filter({ hasText: '새 캠페인' });
  await expect(tabText).toBeVisible();
  
  
  // 10. 탭 닫기 버튼 확인
  const closeButton = newCampaignTab.locator('button img[alt="닫기"]');
  await expect(closeButton).toBeVisible();
  
  
  
});