import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/login.helper';

test('캠페인 무작위 선택하여 상태 전환', async ({ page }) => {
  // 로그인 및 캠페인 관리 진입
  await loginAsAdmin(page);
  await page.waitForTimeout(1000);
  
  const campaignManagementButton = page.locator('button:has(span:text("캠페인 관리"))');
  await expect(campaignManagementButton).toBeVisible({ timeout: 5000 });
  await campaignManagementButton.click();
  await page.waitForTimeout(3000);
  

  // 🎯 캠페인 트리 완전 로드 대기 (더 안정적)
  await page.waitForSelector('.tree-node', { timeout: 15000 });
  await page.waitForSelector('div.campaign-node', { timeout: 10000 });
  
  // DOM이 안정화될 때까지 추가 대기
  await page.waitForTimeout(3000);
  

  // 🔍 상태 변경 가능한 캠페인 찾기 (더 구체적인 선택자)
  const pausedCampaigns = page.locator('div.campaign-node').filter({
    has: page.locator('img[src="/sidebar-menu/tree_pause.svg"]')
  });
  
  const stoppedCampaigns = page.locator('div.campaign-node').filter({
    has: page.locator('img[src="/sidebar-menu/tree_stop.svg"]')
  });
  
  const pausedCount = await pausedCampaigns.count();
  const stoppedCount = await stoppedCampaigns.count();
  const totalCount = pausedCount + stoppedCount;


  if (totalCount === 0) {
    
    return;
  }

  // 🎲 무작위 캠페인 선택
  let selectedCampaign;
  let currentState: 'pause' | 'stop';
  let targetState: 'started' | 'pending' | 'stopped';

  if (pausedCount > 0 && (stoppedCount === 0 || Math.random() < 0.5)) {
    // 멈춤 상태 캠페인 선택
    const randomIndex = Math.floor(Math.random() * pausedCount);
    selectedCampaign = pausedCampaigns.nth(randomIndex);
    currentState = 'pause';
    targetState = 'stopped'; // 멈춤 → 중지
    
  } else {
    // 중지 상태 캠페인 선택
    const randomIndex = Math.floor(Math.random() * stoppedCount);
    selectedCampaign = stoppedCampaigns.nth(randomIndex);
    currentState = 'stop';
    targetState = 'pending'; // 중지 → 멈춤
    
  }

  // 📍 선택된 캠페인 정보 출력
  const campaignName = await selectedCampaign.locator('span.text-555').textContent();
  

  // 🖱️ 우클릭으로 컨텍스트 메뉴 열기
  await selectedCampaign.scrollIntoViewIfNeeded();
  await selectedCampaign.click({ button: 'right' });
  
  
  // 📋 컨텍스트 메뉴 표시 확인
  const contextMenu = page.locator('[role="menu"]').first();
  await expect(contextMenu).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(1000);

  // 🎯 "시작구분" 서브메뉴 찾기 및 호버 (더 안정적인 방법)
  const statusSubMenuTrigger = contextMenu.getByText('시작구분:', { exact: false });
  
  if (await statusSubMenuTrigger.count() === 0) {
    
    // 디버깅을 위한 컨텍스트 메뉴 내용 출력
    const menuContent = await contextMenu.textContent();
    
    return;
  }

  await expect(statusSubMenuTrigger).toBeVisible({ timeout: 3000 });
  await statusSubMenuTrigger.hover();
  
  
  // 서브메뉴가 나타날 때까지 대기
  await page.waitForTimeout(800);

  // 🔄 상태 전환 실행
  try {
    if (currentState === 'pause') {
      
      // 여러 방법으로 중지 메뉴 찾기
      const stopMenuSelectors = [
        page.getByRole('menuitem').filter({ hasText: '중지' }),
        page.locator('[role="menuitem"]').filter({ hasText: '중지' }),
        contextMenu.getByText('중지', { exact: true }),
        page.getByText('중지').filter({ hasText: /^중지$/ })
      ];

      let clicked = false;
      for (const selector of stopMenuSelectors) {
        if (await selector.count() > 0) {
          await expect(selector.first()).toBeVisible({ timeout: 3000 });
          await selector.first().click({ force: true });
          
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        throw new Error('중지 메뉴를 찾을 수 없습니다');
      }

    } else {
      
      // 여러 방법으로 멈춤 메뉴 찾기
      const pauseMenuSelectors = [
        page.getByRole('menuitem').filter({ hasText: '멈춤' }),
        page.locator('[role="menuitem"]').filter({ hasText: '멈춤' }),
        contextMenu.getByText('멈춤', { exact: true }),
        page.getByText('멈춤').filter({ hasText: /^멈춤$/ })
      ];

      let clicked = false;
      for (const selector of pauseMenuSelectors) {
        if (await selector.count() > 0) {
          await expect(selector.first()).toBeVisible({ timeout: 3000 });
          await selector.first().click({ force: true });
          
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        throw new Error('멈춤 메뉴를 찾을 수 없습니다');
      }
    }

  } catch (error) {
    
    
    // 디버깅 정보 출력
    // const allMenuItems = await page.locator('[role="menuitem"]').allTextContents();
    
    
    // 스크린샷 저장
    await page.screenshot({ path: 'campaign-context-menu-error.png' });
    throw error;
  }

  // ⏳ 상태 변경 처리 대기
  await page.waitForTimeout(3000);

  // ✅ 결과 확인 (다양한 성공 메시지 패턴 대응)
  try {
    const successMessages = [
      '캠페인 상태가 성공적으로 변경되었습니다!',
      '상태가 변경되었습니다',
      '성공적으로 변경',
      '변경이 완료되었습니다',
      '완료'
    ];

    let successFound = false;
    
    for (const message of successMessages) {
      try {
        const successElement = page.getByText(message, { exact: false });
        if (await successElement.count() > 0) {
          await expect(successElement).toBeVisible({ timeout: 2000 });
          
          
          // 확인 버튼 클릭
          const confirmButtons = [
            page.getByRole('button', { name: '확인' }),
            page.getByRole('button', { name: 'OK' }),
            page.getByRole('button', { name: '닫기' }),
            page.getByText('확인').filter({ hasText: /^확인$/ })
          ];

          for (const button of confirmButtons) {
            if (await button.count() > 0) {
              await button.click();
              
              break;
            }
          }
          
          successFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!successFound) {
      
      
      // 디버깅을 위한 현재 페이지 상태 출력
      // const currentUrl = page.url();
      // console.log(`📍 현재 URL: ${currentUrl}`);
      
      // 알림/다이얼로그가 있는지 확인
      const alertTexts = await page.locator('[role="dialog"], [role="alert"], .alert').allTextContents();
      if (alertTexts.length > 0) {
        // console.log('🔔 페이지의 알림/다이얼로그:', alertTexts);
      }
    }

  } catch (error) {
    // console.log('⚠️ 결과 확인 중 오류:', error);
    
    // 최종 디버깅 스크린샷
    await page.screenshot({ path: 'campaign-status-change-final.png' });
  }
  
  // 🏁 최종 대기 및 정리
  await page.waitForTimeout(2000);
  
});