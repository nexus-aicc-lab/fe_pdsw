import React from 'react'
import { CallSettingBulkUpdateFormForCampaingGroup } from './CallSettingBulkUpdateFormForCampaingGroup'
import { CampaignInfoBulkUpdateFormForCampaingGroup } from './CampaignInfoBulkUpdateFormForCampaingGroup';

interface Props {
  groupId?: string | number;
  groupName?: string;
}

const CampaignGroupBulkUpdatePanel: React.FC<Props> = ({ groupId, groupName }) => {
    // console.log("CampaignGroupBulkUpdatePanel !!!!!!!!!: ", groupId, groupName);
        
  return (
    <div className="w-full h-full flex flex-col border border-gray-300 bg-gray-100">
      {/* 패널 헤더 */}
      <div className="flex justify-between items-center bg-gray-300 px-3 py-1.5 border-b border-gray-400">
        <div className="font-medium">캠페인 그룹 일괄 수정 (groupId : {groupId} , groupName: {groupName})</div>
        <button className="px-1.5 hover:bg-gray-400 rounded">✕</button>
      </div>
      
      {/* 캠페인 정보 섹션 */}
      <div className="campaign-info-section">
        <CampaignInfoBulkUpdateFormForCampaingGroup 
          groupId={groupId} 
          groupName={groupName} 
        />
      </div>
      
      {/* 콜 설정 섹션 */}
      <div className="call-setting-section flex-1">
        <CallSettingBulkUpdateFormForCampaingGroup />
      </div>
      
      {/* 하단 버튼 */}
      <div className="flex justify-end gap-2 p-3 border-t border-gray-300">
        <button className="px-8 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700">확인</button>
        <button className="px-8 py-1.5 bg-gray-400 text-white rounded hover:bg-gray-500">취소</button>
      </div>
    </div>
  )
}

export default CampaignGroupBulkUpdatePanel