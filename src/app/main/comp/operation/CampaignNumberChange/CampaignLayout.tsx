import React, { useState, useMemo, useEffect } from 'react';
import DataGrid from "react-data-grid";
import { MainDataResponse } from '@/features/auth/types/mainIndex';
import { useMainStore, useCampainManagerStore, useAuthStore } from '@/store';
import CampaignModal from '../CampaignModal';
import { useApiForCallingNumber } from '@/features/campaignManager/hooks/useApiForCallingNumber';

import { CommonButton } from "@/components/shared/CommonButton";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { useApiForCallingNumberUpdate } from '@/features/campaignManager/hooks/useApiForCallingNumberUpdate';
import { useApiForCallingNumberInsert } from '@/features/campaignManager/hooks/useApiForCallingNumberInsert';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useApiForCallingNumberDelete } from '@/features/campaignManager/hooks/useApiForCallingNumberDelete';
import OnlyNumberInput from '@/components/shared/OnlyNumberInput';
import { useOperationStore } from '../store/OperationStore';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';

type GridRow = MainDataResponse & {
  calling_number: string;
};

const errorMessage = {
  isOpen: false,
  message: '',
  title: '로그인',
  type: '2',
};

function CampaignLayout() {
  const { tenant_id } = useAuthStore();
  const { campaigns, setSelectedCampaign } = useMainStore();
  const { callingNumbers, setCallingNumbers } = useCampainManagerStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<GridRow | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedCampaignName, setSelectedCampaignName] = useState('');
  const [selectedCallingNumber, setSelectedCallingNumber] = useState('');
  const [isNewMode, setIsNewMode] = useState(false); 

  const { operationCampaignId, setOperationCampaignId, operationCampaignName, setOperationCampaignName } = useOperationStore();
  const router = useRouter();

  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: '알림',
    type: '2',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirm = (message: string, onConfirm: () => void) => { // 취소 버튼 있음
    setAlertState({
      isOpen: true,
      message,
      title: '확인',
      type: '1',
      onConfirm: () => {
        onConfirm();
        closeAlert();
      },
      onCancel: closeAlert
    });
  };

  const showAlert = (message: string) => { // 취소 버튼 없음
    setAlertState({
      isOpen: true,
      message,
      title: '알림',
      type: '2',
      onConfirm: closeAlert,
      onCancel: () => {}
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  // 발신번호 조회
  const { mutate: fetchCallingNumbers } = useApiForCallingNumber({
    onSuccess: (data) => {
      // 데이터 유효성 검사 추가
      if (data && data.result_data && Array.isArray(data.result_data)) {
        setCallingNumbers(data.result_data);
      } else {
        // 빈 데이터나 잘못된 형식의 데이터가 왔을 때 빈 배열로 설정
        setCallingNumbers([]);
      }
    },
    onError: (error) => {
      // 에러 발생 시 callingNumbers를 빈 배열로 설정
      setCallingNumbers([]);
      // showAlert('발신번호 조회 중 오류가 발생했습니다: ' + data.message);
      
      ServerErrorCheck('발신번호 조회', error.message);
    }
  });

  //캠페인 발신번호 추가 api 호출
  const { mutate: fetchCallingNumberInsert } = useApiForCallingNumberInsert({
    onSuccess: (data) => {
      fetchCallingNumbers({
        session_key: '',
        tenant_id: tenant_id,
      });
      // 신규 모드 해제하고 선택 상태 유지
      setIsNewMode(false);
      showAlert('새로운 발신번호가 성공적으로 저장되었습니다.');
    },
    onError: (error) => {
      ServerErrorCheck('발신번호 추가', error.message);
    }
  });

  // 발신번호 수정
  const { mutate: fetchCallingNumberUpdate } = useApiForCallingNumberUpdate({
    onSuccess: (data) => {
      fetchCallingNumbers({
        session_key: '',
        tenant_id: tenant_id,
      });
      // 신규 모드 해제하고 선택 상태 유지
      setIsNewMode(false);
      showAlert('발신번호가 성공적으로 수정되었습니다.');
    },
    onError: (error) => {
      ServerErrorCheck('발신번호 수정', error.message);
    }
  });

  // 발신번호 삭제
  const { mutate: fetchCallingNumberDelete } = useApiForCallingNumberDelete({
    onSuccess: (data) => {
      if (data.result_code == 0 ) {
        fetchCallingNumbers({
          session_key: '',
          tenant_id: tenant_id,
        });
      }
    },
    onError: (error) => {
      ServerErrorCheck('발신번호 삭제', error.message);
    }
  });

  // 컴포넌트 마운트 시 발신번호 조회  ######
  useEffect(() => {
    fetchCallingNumbers({
      session_key: '',
      tenant_id: tenant_id,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 키보드 이벤트 리스너 추가
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 개선 요구사항(신규버튼만 등록) 에 따른 주석처리
      // if (event.key === 'ArrowDown') {
      //   handleNew();
      // }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 캠페인 조회 아이디를 유지하는 조건문
    if(operationCampaignId !== null && operationCampaignId &&
      operationCampaignName !== null && operationCampaignName
     ){
      setSelectedCampaignId(operationCampaignId.toString());
      setSelectedCampaignName(operationCampaignName);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // 목록 새로고침 후 현재 선택된 캠페인 정보를 유지하는 useEffect 추가
  useEffect(() => {
    // callingNumbers가 업데이트되고 selectedCampaignId가 있을 때
    if (selectedCampaignId && !isNewMode) {
      const campaignIdNum = Number(selectedCampaignId);
      
      // 새로운 목록에서 현재 선택된 캠페인 찾기
      const updatedCallingNumber = callingNumbers.find(
        num => num.campaign_id === campaignIdNum
      );
      
      if (updatedCallingNumber) {
        // 발신번호 업데이트
        setSelectedCallingNumber(updatedCallingNumber.calling_number);
        
        // 해당 행을 그리드에서 선택 상태로 유지
        const campaign = campaigns.find(c => c.campaign_id === campaignIdNum);
        if (campaign) {
          setSelectedRow({
            ...campaign,
            calling_number: updatedCallingNumber.calling_number
          });
        }
      }
    }
  }, [callingNumbers, selectedCampaignId, isNewMode, campaigns]);

  // 발신번호 업데이트 함수
  const updateCallingNumber = (campaignId: number) => {
    const callingNumber = callingNumbers.find(
      num => num.campaign_id === campaignId
    );
    setSelectedCallingNumber(callingNumber?.calling_number || '');
  };

  // 그리드 열 정의
  const columns = useMemo(() => [
    {
      key: 'campaign_id',
      name: '캠페인 아이디',
    },
    {
      key: 'campaign_name',
      name: '캠페인 이름',
    },
    {
      key: 'calling_number',
      name: '발신번호',
    }
  ], []);

  // 그리드 행 데이터 생성
  const rows = useMemo(() => {
    // campaigns나 callingNumbers가 없거나 빈 배열인 경우 빈 배열 반환
    if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
      return [];
    }
    
    // callingNumbers가 없는 경우 빈 발신번호로 처리
    const safeCallingNumbers = Array.isArray(callingNumbers) ? callingNumbers : [];
    
    return campaigns.map(campaign => {
      // campaign이 유효한지 확인
      if (!campaign || typeof campaign !== 'object') return null;
      
      // callingNumbers에서 캠페인 ID에 해당하는 발신번호 찾기
      const callingNumber = safeCallingNumbers.find(
        num => num && campaign && num.campaign_id === campaign.campaign_id
      );
      return {
        ...campaign,
        calling_number: callingNumber?.calling_number || ''
      };
    })
    .filter(Boolean) // null 값 제거
    .filter((row): row is GridRow => row !== null && row.calling_number !== '') // 발신번호가 있는 행만 필터링
    .sort((a, b) => Number(a.campaign_id) - Number(b.campaign_id)); // #### 오름차순 정리를 위한 2차 sort    
  }, [campaigns, callingNumbers]);

  // 그리드 셀 클릭 핸들러
  const handleCellClick = (args: { row: GridRow }) => {
    setSelectedRow(args.row);
    setSelectedCampaign(args.row);
    setSelectedCampaignId(args.row.campaign_id.toString());
    setSelectedCampaignName(args.row.campaign_name);
    setSelectedCallingNumber(args.row.calling_number || '');
    setOperationCampaignName(args.row.campaign_name);
    setOperationCampaignId(args.row.campaign_id);
    setIsNewMode(false); // 그리드 선택 시 신규 모드 해제
  };

  const getRowClass = (row: GridRow) => {
    return selectedRow?.campaign_id === row.campaign_id ? 'bg-[#FFFAEE]' : ''; 
  };

  // 모달에서 캠페인 선택 시 호출되는 핸들러
  // 캠페인 아이디와 이름을 받아서 상태 업데이트 및 발신번호 조회
  const handleModalSelect = (campaignId: string, campaignName: string) => {
    const campaignIdNum = Number(campaignId);
  
    // 선택한 캠페인 정보 찾기
    const campaign = campaigns.find(c => c.campaign_id === campaignIdNum);
    if (!campaign) {
      return;
    }
  
    const callingNumber =
      callingNumbers.find(num => num.campaign_id === campaignIdNum)?.calling_number || '';
  
    const campaignWithCallingNumber: GridRow = {
      ...campaign,
      calling_number: callingNumber,
    };
  
    // 상태 업데이트
    setSelectedCampaignId(campaignId);
    setSelectedCampaignName(campaignName);
    setSelectedCallingNumber(callingNumber);
    setSelectedRow(campaignWithCallingNumber);
    setSelectedCampaign(campaign);
  
    // 모달 닫기
    setIsModalOpen(false);
  };
  

  // 발신번호 저장 버튼 핸들러
  const handleSave = () => {
    if (!selectedCampaignId) {
      showAlert('대상캠페인을 선택해주세요.')
      return;
    }

    if (!selectedCallingNumber || selectedCallingNumber.trim().length === 0) {
      showAlert('발신번호를 입력해주세요.')
      return;
    }

    const isNumber = /^[0-9]+$/.test(selectedCallingNumber);

    if (!isNumber) {
      showAlert('발신번호는 숫자로만 입력해주세요.')
      return;
    }

    // 발신번호가 이미 존재하는지 확인
    const existingCallingNumber = callingNumbers.find(num => num.campaign_id === Number(selectedCampaignId));
    const saveRequest = {
      campaign_id: Number(selectedCampaignId),
      calling_number: selectedCallingNumber,
    };

    if (existingCallingNumber) {
      fetchCallingNumberUpdate(saveRequest);
      // showAlert은 mutate의 onSuccess에서 처리
    } else {
      fetchCallingNumberInsert(saveRequest);
      // showAlert은 mutate의 onSuccess에서 처리
    }
  };

  const handleDelete = () => {
    // 선택된 캠페인이 없을 경우 알림
    if (!selectedCampaignId || selectedCampaignId.trim() === '') {
      showAlert('삭제할 발신번호의 캠페인을 먼저 선택해주세요.');
      return;
    }
  
    // 발신번호가 없는 경우 알림 ==> 삭제인데 발신번호 검사할필요가 없음
    // if (!selectedCallingNumber || selectedCallingNumber.trim() === '') {
    //   showAlert('선택한 캠페인에 등록된 발신번호가 없습니다.');
    //   return;
    // }
  
    // 삭제 확인 알림
    showConfirm(
      `선택된 캠페인 [${selectedCampaignName}]의 발신번호를 삭제하시겠습니까? \n\n ※주의: 삭제시 데이터베이스에서 완전 삭제됩니다. \n다시 한번 확인해 주시고 삭제해 주세요.`,
      () => {
        // 확인 버튼 클릭 시 실행될 함수
        fetchCallingNumberDelete(
          {
            campaign_id: Number(selectedCampaignId),
            calling_number: selectedCallingNumber
          }, 
          {
            onSuccess: (data) => {
              if (data.result_code !== 0 ) {
                showAlert('에러사항에 대해서 관리자에게 문의 하세요.');
              }else {
                showAlert('발신번호가 성공적으로 삭제되었습니다.');
                // 삭제 후 데이터 초기화
                setSelectedRow(null);
                setSelectedCampaign(null);
                setSelectedCampaignId('');
                setSelectedCampaignName('');
                setSelectedCallingNumber('');
                setIsNewMode(true); // 삭제 후 신규 모드로 변경
              }
              
            }
          }
        );
      }
    );
  };

  // 신규 버튼 핸들러
  const handleNew = () => {
    setSelectedRow(null);
    setSelectedCampaign(null);
    setSelectedCampaignId('');
    setSelectedCampaignName('');
    setSelectedCallingNumber('');
    setIsNewMode(true); // 신규 모드 활성화
  };

  // 필드 비활성화 여부를 결정하는 함수
  const isCampaignFieldDisabled = () => {
    // 신규 모드가 아니면 캠페인 필드 비활성화
    return !isNewMode;
  };

  const isCallingNumberDisabled = () => {
    // 캠페인이 선택되지 않았으면 발신번호 필드 비활성화
    return !selectedCampaignId;
  };

  return (
    <div className="flex gap-8">
      {/* 왼쪽 그리드 */}
      <div className="w-[580px]">
        <div className='grid-custom-wrap h-[230px]'>
          <DataGrid<GridRow>
            columns={columns}
            rows={rows}
            className="grid-custom"
            onCellClick={handleCellClick}
            rowKeyGetter={(row) => row.campaign_id}
            selectedRows={selectedRow ? new Set([selectedRow.campaign_id]) : new Set()}
            rowHeight={30}
            headerRowHeight={30}
            rowClass={getRowClass} 
            enableVirtualization={false}
          />
        </div>
      </div>

      {/* 오른쪽 섹션 */}
      <div className="w-[513px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label className="w-[5rem] min-w-[5rem]">대상 캠페인</Label>
            <CustomInput 
              type="text" 
              value={selectedCampaignId}
              readOnly
              disabled={isCampaignFieldDisabled()}
              // className="w-[140px]"
              isFullWidth={true}
            />
            <CommonButton 
              variant="outline" 
              size="sm"
              onClick={() => setIsModalOpen(true)}
              // disabled={isCampaignFieldDisabled()}
            >
              캠페인 조회
            </CommonButton>
            <CustomInput 
              type="text" 
              value={selectedCampaignName}
              readOnly 
              disabled={isCampaignFieldDisabled()}
              className=""
            />
          </div>

          {/* 발신번호 영역 */}
          <div className="flex items-center gap-2">
            <Label className="w-[5rem] min-w-[5rem]">발신번호</Label>

            <CustomInput
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={selectedCallingNumber}
                  onChange={(e) => {
                      setSelectedCallingNumber(e.target.value); // 숫자만 허용
                  }}
                  maxLength={11}
              />

          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-2 pt-4">
            <CommonButton onClick={() => setIsModalOpen(true)}>
              신규
            </CommonButton>
            <CommonButton onClick={handleSave}>
              저장
            </CommonButton>
            <CommonButton onClick={handleDelete}>
              삭제
            </CommonButton>
          </div>

          {/* 안내 텍스트 */}
          <div className="mt-[20px] text-sm">
            <ul className='space-y-1'>
              <li>• 캠페인 별로 발신번호를 설정할 수 있습니다.</li>
              <li>• 발신번호를 설정하시려면 신규 버튼을 클릭해 주세요.</li>
              <li>• 해당 캠페인이 중지 상태에서 발신번호 변경, 발신번호 삭제가 가능합니다.</li>
              <li>• 발신번호는 실제 사용이 가능한 번호를 입력해야만 정상적인 발신이 됩니다.</li>
            </ul>
            <p className='mt-[20px]'>※ 변경된 정보는 캠페인 재 시작 시 반영됩니다 .</p>
          </div>
        </div>
      </div>

      {/* Campaign Modal */}
      <CampaignModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSelect={handleModalSelect}
      />
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        onClose={alertState.onConfirm}
        onCancel={alertState.onCancel}
      />
    </div>
  );
}

export default CampaignLayout;