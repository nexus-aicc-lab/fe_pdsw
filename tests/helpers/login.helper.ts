// C:\nproject2\fe_pdsw_for_playwright\tests\helpers\login.helper.ts
import { Page, expect } from '@playwright/test';

/**
 * 기본 관리자로 로그인하는 헬퍼 함수
 * @param page - Playwright Page 객체
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.getByPlaceholder('아이디를 입력하세요').fill('NEX21004');
  await page.getByPlaceholder('비밀번호를 입력하세요').fill('Nexus62402580@');
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL('**/main');
  await expect(page.getByText('캠페인 관리')).toBeVisible();
  await page.waitForTimeout(1500);
}

/**
 * 사용자 정의 계정으로 로그인하는 헬퍼 함수
 * @param page - Playwright Page 객체
 * @param username - 사용자 아이디
 * @param password - 비밀번호
 */
export async function loginAs(page: Page, username: string, password: string) {
  await page.goto('http://localhost:3000/login');
  await page.getByPlaceholder('아이디를 입력하세요').fill(username);
  await page.getByPlaceholder('비밀번호를 입력하세요').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL('**/main');
  await expect(page.getByText('캠페인 관리')).toBeVisible();
  await page.waitForTimeout(1500);
}

/**
 * 로그인 후 캠페인 관리 메뉴로 이동하는 헬퍼 함수
 * @param page - Playwright Page 객체
 */
export async function loginAndGoToCampaignManagement(page: Page) {
  await loginAsAdmin(page);
  
  // 캠페인 관리 메뉴 클릭
  const campaignButton = page.locator('button:has(span:text("캠페인 관리"))');
  await campaignButton.click();
  await page.waitForTimeout(1500);
  
}