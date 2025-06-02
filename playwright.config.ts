// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // 🔄 순차 실행 설정 (로그인 안정성을 위해)
  fullyParallel: false,  // 병렬 실행 비활성화
  workers: 1,           // 항상 순차 실행 (CI든 로컬이든)
  
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,  // 로컬에서도 1번 재시도

  // ⏱️ 타임아웃 설정
  timeout: 90000,       // 각 테스트 90초 타임아웃 (60초→90초 증가)
  expect: {
    timeout: 15000      // expect 타임아웃 15초 (10초→15초 증가)
  },

  // 📊 보고서 설정
  reporter: [
    ['html', { open: 'always' }],  // HTML 보고서 항상 열기
    ['list']                       // 콘솔 출력도 유지
  ],

  use: {
    // 🌐 기본 URL 설정
    baseURL: 'http://localhost:3000',
    
    // 🎬 디버깅 설정
    trace: 'on-first-retry',
    headless: false,  // 브라우저 항상 보이기
    
    // 📸 스크린샷과 비디오
    screenshot: 'only-on-failure',  // 실패 시에만 스크린샷
    video: 'retain-on-failure',     // 실패 시에만 비디오 저장
    
    // 🖥️ 뷰포트 설정
    viewport: { width: 1280, height: 720 },
    
    // 🔒 네트워크 설정
    ignoreHTTPSErrors: true,
    
    // 🐌 안정성을 위한 추가 설정
    actionTimeout: 30000,           // 개별 액션 타임아웃 30초
    navigationTimeout: 30000,       // 페이지 네비게이션 타임아웃 30초
    
    // 🔄 재시도 설정
    launchOptions: {
      slowMo: 100,                  // 각 액션 사이 100ms 지연
    }
  },

  // 🦊 Firefox만 사용
  projects: [
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox 특화 설정
        launchOptions: {
          firefoxUserPrefs: {
            'dom.disable_beforeunload': true,  // beforeunload 이벤트 비활성화
            'dom.max_script_run_time': 60,     // 스크립트 실행 시간 연장
          }
        }
      },
    },
  ],

  // 🎯 전역 설정
  globalSetup: undefined,  // 필요시 전역 설정 파일 추가
  globalTeardown: undefined,

  // 🖥️ 로컬 개발 서버 설정 (필요시 - 주석 해제)
  // webServer: {
  //   command: 'npm run dev',
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  // },
});