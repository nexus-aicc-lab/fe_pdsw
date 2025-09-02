import React, { useState, useEffect, useCallback } from "react";
import TitleWrap from "@/components/shared/TitleWrap";
import CustomAlert from "@/components/shared/layout/CustomAlert";

export interface ColumnSetProps {
  isOpen: boolean;
  onConfirm: (data: ColumnSettingItem[]) => void;
  onClose: () => void;
  columns: ColumnSettingItem[];
}

export interface ColumnSettingItem {
  key: string;
  name: string;
  renderCell?: any;
  width?: number;
}

const HeaderColumn : ColumnSettingItem[] = [
  { key: 'campId', name: '캠페인아이디',renderCell: ({ row }: { row: { level?: number,campId?: number } }) => (row.level === 3 ? row.campId : '')},
  { key: 'campaignName', name: '캠페인이름',renderCell: ({ row }: { row: { level?: number,campaignName?: string } }) => (row.level === 3 ? row.campaignName : '')},
  { key: 'strFlag', name: '발신구분',renderCell: ({ row }: { row: { level?: number,strFlag?: string } }) => (row.level === 3 ? row.strFlag : '')},
  { key: 'startFlag', name: '시작구분'},
  { key: 'endFlag', name: '완료구분'},
  { key: 'progressRate', name: '진행률(%)',renderCell: ({ row }: { row: { level?: number,progressRate?: number } }) => (row.level === 3 ? `${row.progressRate}%` : '')},
  { key: 'successRateList', name: '리스트 대비 성공률(%)',renderCell: ({ row }: { row: { level?: number,successRateList?: number } }) => (row.level === 3 ? `${row.successRateList}%` : '')},
  { key: 'totLstCnt', name: '총 리스트 건수',renderCell: ({ row }: { row: { level?: number,totLstCnt?: number } }) => (row.level === 3 ? row.totLstCnt : '')},
  { key: 'nonTTCT', name: '순수발신 건수',renderCell: ({ row }: { row: { level?: number,nonTTCT?: number } }) => (row.level === 3 ? row.nonTTCT : '')},
  { key: 'nonSendCount', name: '미발신 건수',renderCell: ({ row }: { row: { level?: number,nonSendCount?: number } }) => (row.level === 3 ? row.nonSendCount : '')},
  { key: 'successRateSend', name: '발신 대비 성공률(%)',renderCell: ({ row }: { row: { level?: number,successRateSend?: number } }) => (row.level === 3 ? `${row.successRateSend}%` : '')},
  { key: 'totDialCnt', name: '총 발신 건수',renderCell: ({ row }: { row: { level?: number,totDialCnt?: number } }) => (row.level === 3 ? row.totDialCnt : '')},
  { key: 'dialAttemptCnt', name: '발신 시도 건수',renderCell: ({ row }: { row: { level?: number,dialAttemptCnt?: number } }) => (row.level === 3 ? row.dialAttemptCnt : '')},
  { key: 'scct', name: '발신 성공 건수',renderCell: ({ row }: { row: { level?: number,scct?: number } }) => (row.level === 3 ? row.scct : '')},
  { key: 'failSendCount', name: '발신 실패 건수',renderCell: ({ row }: { row: { level?: number,failSendCount?: number } }) => (row.level === 3 ? row.failSendCount : '')},
  { key: 'overDial', name: '대기 상담사 없음',renderCell: ({ row }: { row: { level?: number,overDial?: number } }) => (row.level === 3 ? row.overDial : '')},
  { key: 'agentConnect', name: '상담사 연결',renderCell: ({ row }: { row: { level?: number,agentConnect?: number } }) => (row.level === 3 ? row.agentConnect : '')},
  { key: 'abct', name: '상담사 연결 실패',renderCell: ({ row }: { row: { level?: number,abct?: number } }) => (row.level === 3 ? row.abct : '')},
  { key: 'agentNoAnswerCnt', name: '상담사 무응답',renderCell: ({ row }: { row: { level?: number,agentNoAnswerCnt?: number } }) => (row.level === 3 ? row.agentNoAnswerCnt : '')},
  { key: 'agentBusyCnt', name: '상담사 통화중',renderCell: ({ row }: { row: { level?: number,agentBusyCnt?: number } }) => (row.level === 3 ? row.agentBusyCnt : '')},
  { key: 'agentDropCnt', name: '상담사 바로 끊음',renderCell: ({ row }: { row: { level?: number,agentDropCnt?: number } }) => (row.level === 3 ? row.agentDropCnt : '')},
  { key: 'customerDropCnt', name: '고객 포기',renderCell: ({ row }: { row: { level?: number,customerDropCnt?: number } }) => (row.level === 3 ? row.customerDropCnt : '')},
  { key: 'nonServiceCnt', name: '고객 최대 대기시간 초과',renderCell: ({ row }: { row: { level?: number,nonServiceCnt?: number } }) => (row.level === 3 ? row.nonServiceCnt : '')},
  { key: 'noAgentCnt', name: '멘트 청취후 상담사 연결안함',renderCell: ({ row }: { row: { level?: number,noAgentCnt?: number } }) => (row.level === 3 ? row.noAgentCnt : '')},
  { key: 'buct', name: '통화중 실패',renderCell: ({ row }: { row: { level?: number,buct?: number } }) => (row.level === 3 ? row.buct : '')},
  { key: 'nact', name: '무응답 실패',renderCell: ({ row }: { row: { level?: number,nact?: number } }) => (row.level === 3 ? row.nact : '')},
  { key: 'fact', name: '팩스/모뎀 실패',renderCell: ({ row }: { row: { level?: number,fact?: number } }) => (row.level === 3 ? row.fact : '')},
  { key: 'etct', name: '기타 실패',renderCell: ({ row }: { row: { level?: number,etct?: number } }) => (row.level === 3 ? row.etct : '')},
  { key: 'tect', name: '전화번호 오류 실패',renderCell: ({ row }: { row: { level?: number,tect?: number } }) => (row.level === 3 ? row.tect : '')},
  { key: 'lineStopCnt', name: '회선 오류 실패',renderCell: ({ row }: { row: { level?: number,lineStopCnt?: number } }) => (row.level === 3 ? row.lineStopCnt : '')},
  { key: 'customerOnHookCnt', name: '고객 바로 끊음 실패',renderCell: ({ row }: { row: { level?: number,customerOnHookCnt?: number } }) => (row.level === 3 ? row.customerOnHookCnt : '')},
  { key: 'detectSilenceCnt', name: '통화음 없음 실패',renderCell: ({ row }: { row: { level?: number,detectSilenceCnt?: number } }) => (row.level === 3 ? row.detectSilenceCnt : '')},
  { key: 'dialToneSilence', name: '다이얼톤 없음 실패',renderCell: ({ row }: { row: { level?: number,dialToneSilence?: number } }) => (row.level === 3 ? row.dialToneSilence : '')},
  { key: 'acct', name: '기계음 실패',renderCell: ({ row }: { row: { level?: number,acct?: number } }) => (row.level === 3 ? row.acct : '')},
  { key: 'nogblockTime', name: '스케쥴 대기(발신가능)',renderCell: ({ row }: { row: { level?: number,nogblockTime?: number } }) => (row.level === 3 ? row.nogblockTime : '')},
  { key: 'blackList', name: '블랙리스트',renderCell: ({ row }: { row: { level?: number,blackList?: number } }) => (row.level === 3 ? row.blackList : '')},
  { key: 'nogdeleteGL', name: '실시간 리스트 삭제',renderCell: ({ row }: { row: { level?: number,nogdeleteGL?: number } }) => (row.level === 3 ? row.nogdeleteGL : '')},
  { key: 'nogtimeContradictory', name: '스케쥴 설정 실패',renderCell: ({ row }: { row: { level?: number,nogtimeContradictory?: number } }) => (row.level === 3 ? row.nogtimeContradictory : '')},
  { key: 'nogtimeOutCallback', name: '콜백 타임아웃',renderCell: ({ row }: { row: { level?: number,nogtimeOutCallback?: number } }) => (row.level === 3 ? row.nogtimeOutCallback : '')},
  { key: 'nogautoPopNotDial', name: '팝업후 상담사 미발신 선택',renderCell: ({ row }: { row: { level?: number,nogautoPopNotDial?: number } }) => (row.level === 3 ? row.nogautoPopNotDial : '')},
  { key: 'nogautoPopNoAnswer', name: '팝업후 발신 여부 미선택',renderCell: ({ row }: { row: { level?: number,nogautoPopNoAnswer?: number } }) => (row.level === 3 ? row.nogautoPopNoAnswer : '')},
  { key: 'nogautoPopNoReady', name: '팝업후 상담사 상태 변경',renderCell: ({ row }: { row: { level?: number,nogautoPopNoReady?: number } }) => (row.level === 3 ? row.nogautoPopNoReady : '')},
  { key: 'nogautoPopFailMode', name: '팝업후 상담사 모드 변경',renderCell: ({ row }: { row: { level?: number,nogautoPopFailMode?: number } }) => (row.level === 3 ? row.nogautoPopFailMode : '')},
  { key: 'nogautoDialNoReady', name: '발신 확인전 상담사 상태 변경',renderCell: ({ row }: { row: { level?: number,nogautoDialNoReady?: number } }) => (row.level === 3 ? row.nogautoDialNoReady : '')},
  { key: 'nogautoDialFailMode', name: '발신 확인전 상담사 모드 변경',renderCell: ({ row }: { row: { level?: number,nogautoDialFailMode?: number } }) => (row.level === 3 ? row.nogautoDialFailMode : '')},
  { key: 'nogautoNoEmployeeId', name: '지정 상담사 정보 미입력',renderCell: ({ row }: { row: { level?: number,nogautoNoEmployeeId?: number } }) => (row.level === 3 ? row.nogautoNoEmployeeId : '')}
];

export const defaultColumnsData: ColumnSettingItem[] = [
  { key: 'strFlag', name: '발신구분', width: 100,renderCell: ({ row }: { row: { level?: number,strFlag?: string } }) => (row.level === 3 ? row.strFlag : '')},
  { key: 'startFlag', name: '시작구분'},
  { key: 'endFlag', name: '완료구분'},
  { key: 'progressRate', name: '진행률(%)',renderCell: ({ row }: { row: { level?: number,progressRate?: number } }) => (row.level === 3 ? `${row.progressRate}%` : '')},
  { key: 'successRateList', name: '리스트 대비 성공률(%)',renderCell: ({ row }: { row: { level?: number,successRateList?: number } }) => (row.level === 3 ? `${row.successRateList}%` : '')},
  { key: 'totLstCnt', name: '총 리스트 건수',renderCell: ({ row }: { row: { level?: number,totLstCnt?: number } }) => (row.level === 3 ? row.totLstCnt : '')},
  { key: 'nonTTCT', name: '순수발신 건수',renderCell: ({ row }: { row: { level?: number,nonTTCT?: number } }) => (row.level === 3 ? row.nonTTCT : '')},
  { key: 'nonSendCount', name: '미발신 건수',renderCell: ({ row }: { row: { level?: number,nonSendCount?: number } }) => (row.level === 3 ? row.nonSendCount : '')},
  { key: 'successRateSend', name: '발신 대비 성공률(%)',renderCell: ({ row }: { row: { level?: number,successRateSend?: number } }) => (row.level === 3 ? `${row.successRateSend}%` : '')},
  { key: 'totDialCnt', name: '총 발신 건수',renderCell: ({ row }: { row: { level?: number,totDialCnt?: number } }) => (row.level === 3 ? row.totDialCnt : '')},
  { key: 'dialAttemptCnt', name: '발신 시도 건수',renderCell: ({ row }: { row: { level?: number,dialAttemptCnt?: number } }) => (row.level === 3 ? row.dialAttemptCnt : '')},
  { key: 'scct', name: '발신 성공 건수',renderCell: ({ row }: { row: { level?: number,scct?: number } }) => (row.level === 3 ? row.scct : '')},
  { key: 'failSendCount', name: '발신 실패 건수',renderCell: ({ row }: { row: { level?: number,failSendCount?: number } }) => (row.level === 3 ? row.failSendCount : '')},
]

const DEFAULT_SELECTED_KEYS = [
  'senderType', 'start_flag', '완료구분', '진행률', '리스트대비성공률', 
  '총리스트건수', '순수발신건수', '미발신건수', '발신대비성공률', '총발신건수',
  'dialAttempt', 'dialSuccess', 'dialFail'
];

const ColumnSet: React.FC<ColumnSetProps> = ({ isOpen, onConfirm, onClose, columns }) => {
  // 전체 컬럼 목록
  const [allColumns, setAllColumns] = useState<ColumnSettingItem[]>(HeaderColumn);
  
  // 선택된 컬럼 목록 (오른쪽)
  const [rightItems, setRightItems] = useState<ColumnSettingItem[]>([]);
  
  // 선택된 항목
  const [selectedLeftKey, setSelectedLeftKey] = useState<string | null>(null);
  const [selectedRightIndex, setSelectedRightIndex] = useState<number | null>(null);
  
  // console.log("선택 상태:", { selectedLeftKey, selectedRightIndex });

  // 초기 데이터 설정
  useEffect(() => {
    if (isOpen) {
      
      // 기본 선택된 항목 (오른쪽에 표시)
      // const selectedItems = allColumns.filter(col => columns.some(data => data.key === col.key));
      setRightItems(columns);
      
      // 선택 상태 초기화
      setSelectedLeftKey(null);
      setSelectedRightIndex(null);
      
      // console.log("초기 데이터 설정 완료");
    }
  }, [isOpen, columns]);

  // 왼쪽 항목 선택 핸들러
  const handleLeftItemClick = useCallback((e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 이미 오른쪽에 있는 항목인지 확인
    const isInRightList = rightItems.some(item => item.key === key);
    
    if (!isInRightList) {
      // 이미 선택된 항목이면 선택 해제, 아니면 선택
      setSelectedLeftKey(selectedLeftKey === key ? null : key);
      // 오른쪽 선택 해제
      setSelectedRightIndex(null);
    }
  }, [rightItems, selectedLeftKey]);

  // 오른쪽 항목 선택 핸들러
  const handleRightItemClick = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 이미 선택된 항목이면 선택 해제, 아니면 선택
    setSelectedRightIndex(selectedRightIndex === index ? null : index);
    // 왼쪽 선택 해제
    setSelectedLeftKey(null);
  }, [selectedRightIndex]);

  // 왼쪽에서 오른쪽으로 항목 이동
  const handleMoveToRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedLeftKey) {
      // 선택된 왼쪽 항목 찾기
      const selectedItem = allColumns.find(col => col.key === selectedLeftKey);
      
      if (selectedItem) {
        // 이미 오른쪽에 있는지 확인
        const isAlreadyInRight = rightItems.some(item => item.key === selectedItem.key);
        
        if (!isAlreadyInRight) {
          // 오른쪽에 추가
          setRightItems([...rightItems, selectedItem]);
        }
        
        // 선택 상태 초기화
        setSelectedLeftKey(null);
      }
    }
  }, [allColumns, rightItems, selectedLeftKey]);

  // 오른쪽에서 왼쪽으로 항목 이동 (제거)
  const handleMoveToLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedRightIndex !== null && defaultColumnsData.filter(data => data.key === rightItems[selectedRightIndex].key).length === 0) {
      // 선택된 항목 제거
      const newRightItems = [...rightItems];
      const removedItem = newRightItems.splice(selectedRightIndex, 1)[0];
      setRightItems(newRightItems);
      
      
      // 선택 상태 초기화
      setSelectedRightIndex(null);
    }
  }, [rightItems, selectedRightIndex]);

  // 오른쪽 항목을 위로 이동
  const handleMoveUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedRightIndex !== null && selectedRightIndex > 0) {
      const newRightItems = [...rightItems];
      
      // 선택된 항목과 위 항목 교환
      const temp = newRightItems[selectedRightIndex];
      newRightItems[selectedRightIndex] = newRightItems[selectedRightIndex - 1];
      newRightItems[selectedRightIndex - 1] = temp;
      
      setRightItems(newRightItems);
      setSelectedRightIndex(selectedRightIndex - 1);
      
    }
  }, [rightItems, selectedRightIndex]);

  // 오른쪽 항목을 아래로 이동
  const handleMoveDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedRightIndex !== null && selectedRightIndex < rightItems.length - 1) {
      const newRightItems = [...rightItems];
      
      // 선택된 항목과 아래 항목 교환
      const temp = newRightItems[selectedRightIndex];
      newRightItems[selectedRightIndex] = newRightItems[selectedRightIndex + 1];
      newRightItems[selectedRightIndex + 1] = temp;
      
      setRightItems(newRightItems);
      setSelectedRightIndex(selectedRightIndex + 1);
      
    }
  }, [rightItems, selectedRightIndex]);

  // 기본 설정 적용
  const handleDefaultSetting = () => {
    // 기본 선택된 항목 (오른쪽에 표시)
    setRightItems(defaultColumnsData);
    
    // 선택 상태 초기화
    setSelectedLeftKey(null);
    setSelectedRightIndex(null);    
  };

  // 확인 버튼 클릭
  const handleConfirm = () => {
    onConfirm(rightItems);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="w-full" onClick={(e) => e.stopPropagation()}>
      <div className="flex w-full gap-[20px]">
        <div className="flex gap-[20px] flex-1" onClick={(e) => e.stopPropagation()}>
           {/* 왼쪽 컬럼 목록 (모든 컬럼) */}
          <div className="w-full">
              <TitleWrap
                title="전체컬럼"
              />
              <div className="border rounded h-[478px] overflow-y-auto">
                {allColumns.map((item) => {
                  // 이미 오른쪽에 있는지 확인
                  const isInRightList = rightItems.some(rightItem => rightItem.key === item.key);
                  
                  return (
                    <div 
                      key={item.key}
                      onClick={(e) => handleLeftItemClick(e, item.key)}
                      className={`
                        py-1 px-2 cursor-pointer 
                        ${selectedLeftKey === item.key && !isInRightList ? "bg-[#FFFAEE]" : ""} 
                        ${isInRightList ? "text-gray-400" : "hover:bg-[#FFFAEE]"}
                      `}
                      role="button"
                      tabIndex={0}
                      data-key={item.key}
                      data-testid={`left-item-${item.key}`}
                    >
                      {item.name}
                    </div>
                  );
                })}
              </div>
          </div>
            {/* 가운데 화살표 */}
            <div className="w-[40px] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleMoveToRight}
                className={`
                  w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full 
                  flex items-center justify-center mb-2 
                  ${!selectedLeftKey || rightItems.some(item => item.key === selectedLeftKey) ? "opacity-50 cursor-not-allowed" : ""}
                `}
                disabled={!selectedLeftKey || rightItems.some(item => item.key === selectedLeftKey)}
                data-testid="move-right-button"
              >
                →
              </button>
              <button
                type="button"
                onClick={handleMoveToLeft}
                className={`
                  w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full 
                  flex items-center justify-center 
                  ${selectedRightIndex === null ? "opacity-50 cursor-not-allowed" : ""}
                `}
                disabled={selectedRightIndex === null}
                data-testid="move-left-button"
              >
                ←
              </button>
            </div>
        </div>
        
        <div className="flex gap-[20px] flex-1" onClick={(e) => e.stopPropagation()}>
          {/* 오른쪽 컬럼 목록 (선택된 항목) */}
          <div className="w-full">
            <TitleWrap
                title="선택된 컬럼"
                buttons={[
                  { label: "기본설정", 
                    onClick: () => handleDefaultSetting(), 
                    variant: "secondary" },
                ]}
              />
              <div className="border rounded h-[478px] overflow-y-auto">
                {rightItems.map((item, index) => (
                  <div 
                    key={`right-${item.key}-${index}`}
                    onClick={(e) => handleRightItemClick(e, index)}
                    className={`
                      py-1 px-2 cursor-pointer 
                      ${selectedRightIndex === index ? "bg-[#FFFAEE]" : "hover:bg-[#FFFAEE]"}
                    `}
                    role="button"
                    tabIndex={0}
                    data-index={index}
                    data-testid={`right-item-${index}`}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div> 
             {/* 위아래버튼 */}
            <div className="flex flex-col items-center gap-2 min-w-[22px] justify-center">
              <button
                type="button"
                onClick={handleMoveUp}
                className={`
                  w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full 
                  flex items-center justify-center 
                  ${selectedRightIndex === null || selectedRightIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}
                `}
                disabled={selectedRightIndex === null || selectedRightIndex === 0}
                data-testid="move-up-button"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={handleMoveDown}
                className={`
                  w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full 
                  flex items-center justify-center
                  ${selectedRightIndex === null || selectedRightIndex === rightItems.length - 1 ? "opacity-50 cursor-not-allowed" : ""}
                `}
                disabled={selectedRightIndex === null || selectedRightIndex === rightItems.length - 1}
                data-testid="move-down-button"
              >
                ↓
              </button>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <CustomAlert
      isOpen={isOpen}
      title="칼럼설정"
      message={modalContent}
      type="1"
      onClose={handleConfirm}
      onCancel={onClose}
      width="max-w-modal-lm"
    />
  );
};

export default ColumnSet;