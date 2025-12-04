'use client'

import React, { useEffect, useState } from 'react'
import CampaignLayout from './CampaignNumberChange/CampaignLayout'
import EditDescription from './NumberEditDescription/EditDescription'
import CallLimitSetting from './CallLimitSetting'
import DistributionLimit from './DistributionLimit'
import SkillEdit from './SkillEdit'
import ChannelGroupSetting from './ChannelGroupSetting'
// import ConsultResultSetting from './ConsultResultSetting'
import SuspendView from './SuspendView'
import Image from 'next/image'
import { useAuthStore, useTabStore } from '@/store'
import SystemCallBackTimeSetting from './SystemCallBackTimeSetting'
import { useOperationStore } from './store/OperationStore'

// uniqueKey 속성 추가
interface OperationBoardProps {
  uniqueKey?: string; // 고유 인스턴스 식별용
}

export default function OperationBoard({ uniqueKey }: OperationBoardProps) {
  // 로컬 상태 (UI 표시용)
  const [localOpenSectionId, setLocalOpenSectionId] = useState<string>('');
  
  // 전역 상태 사용
  const { openSectionId, setOpenSectionId, lastActiveTabId, setActiveTab, clearOperationCampaign } = useOperationStore();
  
  const { activeTabId } = useTabStore();
  const { tenant_id } = useAuthStore();

  // 섹션 데이터를 배열로 정의
  const sections = [
    { id: 'section1', title: '캠페인별 발신번호 변경', component: CampaignLayout },
    { id: 'section2', title: '전화 번호별 설명 편집', component: EditDescription },
    { id: 'section3', title: '예약 콜 제한 설정', component: CallLimitSetting },
    { id: 'section8', title: '콜백 리스트 초기화 시각 설정', component: SystemCallBackTimeSetting },
    { id: 'section4', title: '분배 호수 제한 설정', component: DistributionLimit },
    { id: 'section5', title: '스킬 편집', component: SkillEdit },
    { id: 'section6', title: '채널 그룹 설정', component: ChannelGroupSetting },
    // { id: 'section6', title: '상담 결과 코드 설정', component: ConsultResultSetting },
    { id: 'section7', title: '서스펜드', component: SuspendView },
  ]

  // 컴포넌트 마운트 시 초기 섹션 설정
  useEffect(() => {

    if(lastActiveTabId){
      // 다른 탭 다녀왔을 때 유지용
      
      setLocalOpenSectionId(lastActiveTabId.toString());
    }
    else if (activeTabId) {
      // 탭이 처음 열릴 때 자동으로 해당 아코디언 메뉴 열기
      setActiveTab(activeTabId);
      
      // 로컬 상태에도 반영
      setLocalOpenSectionId(openSectionId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  useEffect(() => {
    if (activeTabId === 8) {
      setLocalOpenSectionId('section3');
      setActiveTab(activeTabId);
    } else if (activeTabId === 9) {
      setLocalOpenSectionId('section4');
      setActiveTab(activeTabId);
    }
  }, [activeTabId,setActiveTab]);

  // 전역 상태 변경 감지하여 로컬 상태 동기화
  useEffect(() => {
    setLocalOpenSectionId(openSectionId);
  }, [openSectionId]);

  // 토글 함수
  const toggleSection = (sectionId: string) => {
    const newSectionId = localOpenSectionId === sectionId ? '' : sectionId;
    
    setLocalOpenSectionId(newSectionId);
    setOpenSectionId(newSectionId);
    clearOperationCampaign();
  }

  return (
    <div className="divide-y accordion-wrap limit-width">
      {sections.filter((section) => {
        // tenant_id가 0이 아니고 section.id가 section8인 경우(SystemCallBackTimeSetting 컴포넌트) 제외
        if (tenant_id !== 0 && section.id === 'section8' && section.component === SystemCallBackTimeSetting) {
          return false;
        }
        return true;
      }).map((section) => (
        <div key={`${uniqueKey}-${section.id}`} className="accordion">
          <h2>
            <button
              type="button"
              className={`accordion-btn
                ${localOpenSectionId !== section.id ? 'border-b-0' : ''} 
                gap-[15px]`}
              onClick={() => toggleSection(section.id)}
              aria-expanded={localOpenSectionId === section.id}
            >
              <div className={`transform transition-transform duration-200 ${localOpenSectionId === section.id ? 'rotate-180' : ''}`}>
                <Image 
                  src="/chevron-down.svg"
                  alt="chevron"
                  width={10}
                  height={10}
                />
              </div>
              <span className='text-sm'>{section.title}</span>
            </button>
          </h2>
          <div
            className={`transition-[max-height,opacity] duration-200 ease-in-out overflow-hidden
              ${localOpenSectionId === section.id ? 'opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="py-[35px] px-[40px] border-t border-gray-200">
              {/* 컴포넌트를 조건부 렌더링 */}
              {localOpenSectionId === section.id && React.createElement(section.component)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}