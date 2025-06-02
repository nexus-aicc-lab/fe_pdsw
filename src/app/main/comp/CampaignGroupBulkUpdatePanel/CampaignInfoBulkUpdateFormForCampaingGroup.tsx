"use client";
import React from "react";

interface CampaignInfoBulkUpdateFormForCampaingGroupProps {
  groupId?: string | number;
  groupName?: string;
}

export function CampaignInfoBulkUpdateFormForCampaingGroup({
  groupId = "37",
  groupName = "037"
}: CampaignInfoBulkUpdateFormForCampaingGroupProps) {
  return (
    <div className="bg-gray-100 border-b border-gray-300">
      {/* 캠페인 정보 헤더 */}
      <div className="bg-gray-300 px-3 py-1.5 font-medium border-b border-gray-400">
        캠페인 정보
      </div>
      
      {/* 폼 내용 */}
      <div className="p-4 space-y-4">
        {/* 첫 번째 행 */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <label className="w-24 text-sm">그룹 아이디</label>
            <input
              type="text"
              value={groupId}
              readOnly
              className="border border-gray-300 px-2 py-1 w-32 bg-gray-100"
            />
          </div>
          
          <div className="flex items-center">
            <label className="w-16 text-sm">테넌트</label>
            <select className="border border-gray-300 px-2 py-1 w-32">
              <option value="">-</option>
            </select>
          </div>
          
          <div className="flex items-center grow">
            <label className="w-20 text-sm">그룹 이름</label>
            <input
              type="text"
              defaultValue={groupName}
              className="border border-gray-300 px-2 py-1 w-full"
            />
          </div>
        </div>
        
        {/* 두 번째 행 */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <label className="w-24 text-sm">다이얼모드</label>
            <select className="border border-gray-300 px-2 py-1 w-32">
              <option value="Power">Power</option>
              <option value="Preview">Preview</option>
              <option value="Progressive">Progressive</option>
            </select>
          </div>
          
          <div className="flex items-center grow">
            <label className="w-16 text-sm">스킬</label>
            <div className="flex w-full">
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 flex-1"
              />
              <button className="border border-gray-300 px-3 bg-gray-100">...</button>
            </div>
          </div>
        </div>
        
        {/* 세 번째 행 */}
        <div className="flex items-center">
          <label className="w-16 text-sm">설명</label>
          <input
            type="text"
            className="border border-gray-300 px-2 py-1 w-full"
          />
        </div>
      </div>
      
      {/* 작업 버튼 탭 */}
    </div>
  );
}