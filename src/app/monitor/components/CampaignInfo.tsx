// CampaignInfo.tsx
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { CommonButton } from "@/components/shared/CommonButton";
import { CustomInput } from "@/components/shared/CustomInput";
import Image from "next/image";

interface Campaign {
  id: string;
  name: string;
  skills?: number[];
  endTime?: string;
}

interface CampaignInfoProps {
  currentCampaign?: Campaign;
  selectedCampaign: string;
  campaignStatus: string;
  callPacing: number;
  dialMode: number;
  campaigns: Campaign[];
  onCampaignSelect: (id: string) => void;
  onStatusChange: (status: string) => void;
  onCallPacingChange: (value: string) => void;
  onCallPacingApply: () => void;
  onCampaignEdit: () => void;
  onSkillEdit: () => void;
  onRebroadcastEdit: () => void;
}

const CampaignInfo = ({
  currentCampaign,
  selectedCampaign,
  campaignStatus,
  callPacing,
  dialMode,
  campaigns,
  onCampaignSelect,
  onStatusChange,
  onCallPacingChange,
  onCallPacingApply,
  onCampaignEdit,
  onSkillEdit,
  onRebroadcastEdit
}: CampaignInfoProps) => {
  return (
    <div>
      <div className='flex flex-col gap-2'>
        <div className='text-sm'>
          예상 종료 시간: {currentCampaign?.endTime || '00:00:00'}
        </div>
        <div className='flex justify-between items-center'>
          <Select value={selectedCampaign} onValueChange={onCampaignSelect}>
            <SelectTrigger className="w-40 w-use-140">
              <SelectValue placeholder=" "/>
            </SelectTrigger>
            <SelectContent style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CommonButton 
            variant="outline" 
            className='!border-[#A0A0A0] hover:bg-gray-50'
            onClick={onCampaignEdit}
          >
            수정
          </CommonButton>
        </div>
        <div className='flex justify-between items-center'>
          <div className='text-sm'>
            {campaignStatus}
          </div>
          <div className='flex gap-2'>
            <button type="button" onClick={() => onStatusChange('시작')} disabled={campaignStatus === '시작'}>
              <Image src="/sidebar-menu/tree_play.svg" alt="시작" width={16} height={16} />
            </button>
            <button type="button" onClick={() => onStatusChange('멈춤')} disabled={campaignStatus === '멈춤'}>
              <Image src="/sidebar-menu/tree_pause2.svg" alt="멈춤" width={16} height={16} />
            </button>
            <button type="button" onClick={() => onStatusChange('중지')} disabled={campaignStatus === '중지'}>
              <Image src="/sidebar-menu/tree_stop.svg" alt="중지" width={16} height={16} />
            </button>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <div className='text-sm'>
            캠페인 스킬: {currentCampaign?.skills?.join(',') || ''}
          </div>
          <CommonButton 
            variant="outline" 
            className='!border-[#A0A0A0]'
            onClick={onSkillEdit}
          >
            수정
          </CommonButton>
        </div>
        <div className='flex justify-between items-center'>
          <div className='flex gap-2 items-center'>
            <div className='text-sm whitespace-nowrap'>
              콜페이싱(%)
            </div>
            <CustomInput
              type="number"
              className="w-20"
              value={callPacing}
              onChange={(e) => onCallPacingChange(e.target.value)}
              min={0}
              disabled={!(dialMode === 2 || dialMode === 3)}
            />
          </div>
          <CommonButton 
            variant="outline" 
            className='!border-[#A0A0A0]'
            onClick={onCallPacingApply}
            disabled={!(dialMode === 2 || dialMode === 3)}
          >
            적용
          </CommonButton>
        </div>
        <div className='flex justify-between items-center'>
          <div className='text-sm'>
            재발신
          </div>
          <CommonButton 
            variant="outline" 
            className='!border-[#A0A0A0]'
            onClick={onRebroadcastEdit}
          >
            수정
          </CommonButton>
        </div>
      </div>
    </div>
  );
};

export default CampaignInfo;