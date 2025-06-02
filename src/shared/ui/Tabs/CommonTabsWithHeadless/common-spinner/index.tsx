// C:\nproject2\fe_pdsw_for_playwright\src\shared\ui\Tabs\CommonTabsWithHeadless\common-spinner\index.tsx
import React from 'react';
import { Settings } from 'lucide-react';

// 1. Settings 아이콘 (원래 요청)
const SettingsIcon = () => (
  <div className="flex items-center justify-center py-10">
    <Settings className="w-5 h-5 text-indigo-500 animate-spin mr-3" />
    <span className="text-sm text-gray-600">환경 설정 로딩 중...</span>
  </div>
);

// 2. 그라데이션 바 로더 (GitHub/Linear 스타일)
const GradientBarLoader = () => (
  <div className="flex flex-col items-center justify-center py-10 space-y-3">
    <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div className="w-full h-full bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 rounded-full animate-pulse transform scale-x-75 origin-left"></div>
    </div>
    <span className="text-sm text-gray-600">환경 설정 로딩 중...</span>
  </div>
);

// 3. 웨이브 도트 애니메이션 (Discord 스타일)
const WaveDotsLoader = () => (
  <div className="flex items-center justify-center py-10">
    <div className="flex space-x-1 mr-4">
      <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1400ms' }}></div>
      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1400ms' }}></div>
      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1400ms' }}></div>
      <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '600ms', animationDuration: '1400ms' }}></div>
    </div>
    <span className="text-sm text-gray-600">환경 설정 로딩 중...</span>
  </div>
);

// 4. 펄스 링 애니메이션 (모던 사이트 스타일)
const PulseRingLoader = () => (
  <div className="flex items-center justify-center py-10">
    <div className="relative mr-4">
      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
      <div className="absolute inset-0 w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-ping opacity-75"></div>
      <div className="absolute inset-1 w-4 h-4 rounded-full bg-white"></div>
    </div>
    <span className="text-sm text-gray-600">환경 설정 로딩 중...</span>
  </div>
);

// 5. 브리딩 도트 (Apple/Google 스타일)
const BreathingDotsLoader = () => (
  <div className="flex items-center justify-center py-10">
    <div className="flex space-x-2 mr-4">
      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 animate-pulse" style={{ animationDuration: '1s' }}></div>
      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.2s' }}></div>
      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.4s' }}></div>
    </div>
    <span className="text-sm text-gray-600">환경 설정 로딩 중...</span>
  </div>
);

// 6. 스피너 + 그라데이션 (트렌디한 조합)
const GradientSpinnerLoader = () => (
  <div className="flex items-center justify-center py-10">
    <div className="relative mr-4">
      <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>
      <div className="absolute inset-0 w-6 h-6 rounded-full border-2 border-transparent border-t-gradient-to-r from-violet-500 to-purple-500 animate-spin"
           style={{
             background: 'conic-gradient(from 0deg, transparent, #8b5cf6)',
             borderRadius: '50%',
             maskImage: 'radial-gradient(circle, transparent 40%, black 40%)',
             WebkitMaskImage: 'radial-gradient(circle, transparent 40%, black 40%)'
           }}>
      </div>
    </div>
    <span className="text-sm text-gray-600">환경 설정 로딩 중...</span>
  </div>
);

export default function TrendyLoadingUI() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h2 className="text-xl font-bold text-center mb-8">트렌디한 로딩 UI 베스트 5 🎨</h2>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
          <h3 className="font-semibold mb-3 text-indigo-700">1. Settings 아이콘 (원래 요청) ⚙️</h3>
          <SettingsIcon />
          <p className="text-xs text-gray-600 mt-2">의미적으로 완벽, 심플함</p>
        </div>

        <div className="border rounded-lg p-6 bg-gradient-to-br from-pink-50 to-indigo-50">
          <h3 className="font-semibold mb-3 text-purple-700">2. 그라데이션 바 (GitHub/Linear 스타일) 📊</h3>
          <GradientBarLoader />
          <p className="text-xs text-gray-600 mt-2">세련되고 진행률 느낌, 막대 그래프 스타일</p>
        </div>

        <div className="border rounded-lg p-6 bg-gradient-to-br from-cyan-50 to-pink-50">
          <h3 className="font-semibold mb-3 text-blue-700">3. 웨이브 도트 (Discord 스타일) 🌊</h3>
          <WaveDotsLoader />
          <p className="text-xs text-gray-600 mt-2">장난스럽고 귀여움, 무지개 색깔</p>
        </div>

        <div className="border rounded-lg p-6 bg-gradient-to-br from-emerald-50 to-cyan-50">
          <h3 className="font-semibold mb-3 text-emerald-700">4. 펄스 링 (모던 사이트 스타일) 💫</h3>
          <PulseRingLoader />
          <p className="text-xs text-gray-600 mt-2">고급스럽고 모던함</p>
        </div>

        <div className="border rounded-lg p-6 bg-gradient-to-br from-orange-50 to-rose-50">
          <h3 className="font-semibold mb-3 text-orange-700">5. 브리딩 도트 (Apple/Google 스타일) 🍎</h3>
          <BreathingDotsLoader />
          <p className="text-xs text-gray-600 mt-2">부드럽고 따뜻한 느낌</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
        <h3 className="font-semibold mb-3">🎯 추천 순서:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="font-medium text-purple-600">1위:</span>
            <span className="ml-2">그라데이션 바 - 막대 그래프 느낌 + 트렌디</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-blue-600">2위:</span>
            <span className="ml-2">웨이브 도트 - 장난스럽고 예쁜 색깔</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-emerald-600">3위:</span>
            <span className="ml-2">펄스 링 - 고급스러운 느낌</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-2">💻 실제 코드 (그라데이션 바):</h3>
        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
{`if (!isEnvLoaded) {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-3">
      <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 rounded-full animate-pulse transform scale-x-75 origin-left"></div>
      </div>
      <span className="text-sm text-gray-600">환경 설정 로딩 중...</span>
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
}