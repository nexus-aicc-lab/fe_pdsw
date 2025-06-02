// components/main/DetailView.tsx
import { useMainStore } from '@/store';

export default function DetailView() {
  const selectedCampaign = useMainStore((state) => state.selectedCampaign);

  if (!selectedCampaign) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">캠페인을 선택해주세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">{selectedCampaign.campaign_name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">기본 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">캠페인 ID</label>
              <p>{selectedCampaign.campaign_id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">테넌트 ID</label>
              <p>{selectedCampaign.tenant_id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">사이트 코드</label>
              <p>{selectedCampaign.site_code}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">서비스 코드</label>
              <p>{selectedCampaign.service_code}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">다이얼 설정</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">다이얼 모드</label>
              <p>{selectedCampaign.dial_mode}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">콜백 종류</label>
              <p>{selectedCampaign.callback_kind}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">다이얼 속도</label>
              <p>{selectedCampaign.dial_speed}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">상태 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">시작 플래그</label>
              <p>{selectedCampaign.start_flag}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">종료 플래그</label>
              <p>{selectedCampaign.end_flag}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">삭제 플래그</label>
              <p>{selectedCampaign.delete_flag}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">생성 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">생성 사용자</label>
              <p>{selectedCampaign.creation_user}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">생성 시간</label>
              <p>{selectedCampaign.creation_time}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">생성 IP</label>
              <p>{selectedCampaign.creation_ip}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-4">설명</h2>
        <p className="text-gray-700">{selectedCampaign.campaign_desc}</p>
      </section>
    </div>
  );
}