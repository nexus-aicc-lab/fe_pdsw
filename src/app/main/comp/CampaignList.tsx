// components/main/CampaignList.tsx
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { useMainStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CampaignList() {
  const { campaigns, totalCount, setSelectedCampaign } = useMainStore();
  
  const handleRowClick = (campaign: MainDataResponse) => {
    setSelectedCampaign(campaign);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>캠페인 목록 (총 {totalCount}건)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">No.</th>
                <th className="border p-2 text-left">캠페인 ID</th>
                <th className="border p-2 text-left">캠페인명</th>
                <th className="border p-2 text-left">설명</th>
                <th className="border p-2 text-left">테넌트 ID</th>
                <th className="border p-2 text-left">생성일</th>
                <th className="border p-2 text-left">수정일</th>
                <th className="border p-2 text-left">상태</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, index) => (
                <tr 
                  key={campaign.campaign_id}
                  onClick={() => handleRowClick(campaign)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{campaign.campaign_id}</td>
                  <td className="border p-2">{campaign.campaign_name}</td>
                  <td className="border p-2">{campaign.campaign_desc}</td>
                  <td className="border p-2">{campaign.tenant_id}</td>
                  <td className="border p-2">{new Date(campaign.creation_time).toLocaleString()}</td>
                  <td className="border p-2">{new Date(campaign.update_time).toLocaleString()}</td>
                  <td className="border p-2">{campaign.start_flag ? '진행중' : '대기'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}