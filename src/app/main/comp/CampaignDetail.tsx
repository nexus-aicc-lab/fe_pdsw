// components/main/CampaignDetail.tsx
import { useMainStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CampaignDetail() {
  const selectedCampaign = useMainStore((state) => state.selectedCampaign);

  return (
    <Card>
      <CardHeader>
        <CardTitle>캠페인 상세정보</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">캠페인 ID</label>
            <input 
              type="text" 
              value={selectedCampaign?.campaign_id || ''} 
              className="mt-1 p-2 border rounded w-full" 
              readOnly 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">캠페인명</label>
            <input 
              type="text" 
              value={selectedCampaign?.campaign_name || ''} 
              className="mt-1 p-2 border rounded w-full" 
              readOnly 
            />
          </div>
          {/* ... 나머지 필드들 ... */}
        </div>
      </CardContent>
    </Card>
  );
}