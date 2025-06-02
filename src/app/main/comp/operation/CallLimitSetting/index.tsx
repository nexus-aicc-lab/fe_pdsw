
import React, { useState, useMemo, useEffect } from 'react';
import DataGrid from "react-data-grid";
import { CommonButton } from "@/components/shared/CommonButton";
import { CustomInput } from "@/components/shared/CustomInput";
import { Label } from "@/components/ui/label";
import CampaignModal from '../CampaignModal';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { useMainStore, useTabStore } from '@/store';
import {
  useApiForCallLimitSettingCreate,
  useApiForCallLimitSettingDelete,
  useApiForCallLimitSettingList,
  useApiForCallLimitSettingUpdate
} from '@/features/preferences/hooks/useApiForCallLimitSetting';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import CustomInputForTime from '@/components/shared/CustomInputForTime';
import { useApiForSystemCallBackTimeSetting } from '@/features/preferences/hooks/useApiForSystemCallBackTimeSetting';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';

interface Row {
  campaign_id: string;
  campaign_name: string;
  limit_number: string;
  daily_init_flag : string,
  daily_init_time : string
}

interface LimitSettingItem {
  campaign_id: number;
  tenant_id: number;
  call_kind: number;
  call_timeout: number;
  max_call: number;
  // max_criteria: number;
  daily_init_flag?: number; // 추가된 필드
  daily_init_time?: string; // 추가된 필드

}

const errorMessage = {
  isOpen: false,
  message: '',
  title: '로그인',
  type: '2',
};

const CampaignSettings = () => {
  const { tenants, campaigns } = useMainStore();
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignId, setCampaignId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [limitCount, setLimitCount] = useState('');

  const [dailyInitFlag, setDailyInitFlag] = useState(0); // ✅ 추가
  const [dailyInitTime, setDailyInitTime] = useState<string | null>(null); // ✅ 추가

  const [limitSettings, setLimitSettings] = useState<LimitSettingItem[]>([]);
  const [isNewMode, setIsNewMode] = useState(false); // 신규 모드 상태 추가
  const router = useRouter();
  const { activeTabId, openedTabs } = useTabStore()

  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: '알림',
    type: '1',
    onConfirm: () => { },
    onCancel: () => { }
  });

  const showAlert = (message: string) => {
    setAlertState({
      isOpen: true,
      message,
      title: '알림',
      type: '2',
      onConfirm: closeAlert,
      onCancel: () => { }
    });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
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

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };


  // 시간 변환 함수
  const formatTime = (time: string | number | null | undefined): string => {
    if (!time) return "미사용";
  
    const timeStr = time.toString().padStart(4, '0'); // '900' → '0900'
  
    const hours = timeStr.slice(0, 2);
    const minutes = timeStr.slice(2, 4);
  
    return `${hours}:${minutes}`;
  };

  // 예약콜 제한건수 조회
  const { mutate: fetchCallLimitSettingList } = useApiForCallLimitSettingList({
    onSuccess: (data) => {
      setLimitSettings(data.result_data);
      setIsNewMode(false); // 데이터 로드 시 신규 모드 해제
    }, onError: (error) => {
      ServerErrorCheck('예약콜 제한건수 조회', error.message);
    }
  });

  // 제한건수 추가 API 
  const { mutate: createCallLimitSetting } = useApiForCallLimitSettingCreate({
    onSuccess: (data) => {
      if (data.result_code === -1) {
        // -9053 메시지 표시
        showAlert('리스트 등록 건수를 초과하였습니다.');
      } else {

        // 저장 성공 후 리스트를 새로 가져오기
        fetchCallLimitSettingList({
          tenant_id_array: tenants.map(tenant => tenant.tenant_id)
        });

        // 신규 모드는 해제하지만, 선택 상태는 유지
        setIsNewMode(false);

        // 저장 성공 메시지 표시
        showAlert('저장되었습니다.');
      }
    },
    onError: (error) => {
      ServerErrorCheck('예약콜 제한건수 추가', error.message);
    }
  });

  // 제한건수 수정 API
  const { mutate: updateCallLimitSetting } = useApiForCallLimitSettingUpdate({
    onSuccess: (data) => {
      if (data.result_code === -1) {
        // -9053 메시지 표시
        showAlert('리스트 등록 건수를 초과하였습니다.');
      } else {
        fetchCallLimitSettingList({
          tenant_id_array: tenants.map(tenant => tenant.tenant_id)
        });
        setIsNewMode(false); // 수정 후 신규 모드 해제
        showAlert('수정되었습니다.');
      }
    },
    onError: (error) => {
      ServerErrorCheck('예약콜 제한건수 수정', error.message);
    }
  });

  // 제한건수 삭제 API
  const { mutate: deleteCallLimitSetting } = useApiForCallLimitSettingDelete({
    onSuccess: () => {
      fetchCallLimitSettingList({
        tenant_id_array: tenants.map(tenant => tenant.tenant_id)
      });
      setIsNewMode(false); // 삭제 후 신규 모드 해제
    },
    onError: (error) => {
      ServerErrorCheck('예약콜 제한건수 삭제', error.message);
    }
  });

  // 예약콜 제한건수 조회 API 호출 후 선택된 캠페인ID에 해당하는 항목을 찾아서 선택 상태 업데이트
  const updateSelectionAfterAPICall = () => {
    // limitSettings에서 선택된 캠페인 ID에 해당하는 항목 찾기
    const updatedSetting = limitSettings.find(
      setting => setting.campaign_id === Number(campaignId)
    );
    
    // 찾은 항목이 있을 경우 선택 상태 업데이트
    if (updatedSetting) {
      const campaign = campaigns?.find(
        camp => camp.campaign_id === updatedSetting.campaign_id
      );

      // 찾은 데이터로 선택 상태 업데이트
      setSelectedRow({
        campaign_id: updatedSetting.campaign_id.toString(),
        campaign_name: campaign?.campaign_name || '',
        limit_number: updatedSetting.max_call.toString(),
        daily_init_flag : updatedSetting.daily_init_flag === 1 ? "사용" : "미사용",
        daily_init_time : updatedSetting.daily_init_time != null ? formatTime(updatedSetting.daily_init_time) : "미사용"
      });

      // 제한건수도 최신 데이터로 업데이트
      setLimitCount(updatedSetting.max_call.toString());

      // todo3: 
      setDailyInitFlag(updatedSetting.daily_init_flag ?? 0);
      setDailyInitTime(updatedSetting.daily_init_time ?? null);


    }
  };

  const [systemCallBackTimeData, setSystemCallBackTimeData] = useState<string>(); // response 시스템 콜백 리스트 초기화 시간 설정 데이터

  // 콜백 리스트 초기화 시각 조회
  const { mutate: fetchSystemCallBackTime } = useApiForSystemCallBackTimeSetting({
    onSuccess: (data) => {

        const { use_flag, init_hour } = data.result_data;

        const formattedHour = use_flag === 0
            ? '미사용'
            : parseInt(init_hour ?? '0').toString() + '시'; // "0100" -> "1시"

        setSystemCallBackTimeData(formattedHour);
        
        // setSystemCallBackTimeData(data.result_data); // 시스템 콜백 리스트 초기화 시간 설정
        // setSelectSystemCallBackTime(data.result_data?.use_flag === 0 ? '미사용' : data.result_data.init_hour || ''); // 시스템 콜백 리스트 초기화 시간 설정
    },
    onError: (error) => {     
        ServerErrorCheck('콜백 리스트 초기화 시각 조회', error.message);
    }
  }); // end of useApiForSystemCallBackTimeSetting

  useEffect(() => {
    if (campaignId && !isNewMode) {
      updateSelectionAfterAPICall();
    }
    fetchSystemCallBackTime();
  }, [limitSettings]);

  useEffect(() => {
    fetchCallLimitSettingList({
      tenant_id_array: tenants.map(tenant => tenant.tenant_id)
    });
    // 초기 로딩 시 신규 모드 비활성화
    setIsNewMode(false);
    fetchSystemCallBackTime();
  }, [fetchCallLimitSettingList, tenants])

  const columns = useMemo(() => [
    { key: 'campaign_id', name: '캠페인 아이디' , width: 120 },
    { key: 'campaign_name', name: '캠페인 이름' , width: 150},
    { key: 'limit_number', name: '제한건수' , width: 120},
    { key: 'daily_init_flag', name: '일별 초기화', width: 100 },
    { key: 'daily_init_time', name: '마감 초기화 시각'}
  ], []);

  // 그리드에 표시할 데이터
  const rows = useMemo(() =>
    limitSettings?.map(setting => {
      const campaign = campaigns?.find(
        camp => camp.campaign_id === setting.campaign_id
      );
      return {
        campaign_id: setting.campaign_id.toString(),
        campaign_name: campaign?.campaign_name || '',
        limit_number: setting.max_call.toString(),
        daily_init_flag : setting.daily_init_flag === 1 ? "사용" : "미사용",
        daily_init_time : setting.daily_init_time !== null ? formatTime(setting.daily_init_time) : "미사용"

      };
    }) || [] // 기본값으로 빈 배열 설정
    , [limitSettings, campaigns]);


  // 저장 버튼 클릭 시 호출되는 함수
  // 캠페인 아이디, 캠페인 이름, 제한건수 모두 입력되어야 저장 가능
  const handleSave = async () => {
    if (!campaignId || !campaignName || !limitCount) {
      showAlert('모든 필드를 입력해주세요.');
      return;
    }

    // 선택된 캠페인의 tenant_id 찾기
    const selectedCampaign = campaigns?.find(camp => camp.campaign_id === Number(campaignId));
    if (!selectedCampaign) {
      return;
    }

    const originTime = dailyInitTime !== null ? dailyInitTime.replace(":", "") : null;
    // "0000" 4자리 숫자

    // 들어온 4자리 시간 string(미사용이거나 null이거나 "19시" 같은것)을 변환하기
    const convertToHHmm = (timeStr: string): string | null => {
      
      if (timeStr === '미사용') return null;
      
      const match = timeStr.match(/^(\d{1,2})시$/);
      if (match) {
        const hour = match[1].padStart(2, '0');
        return `${hour}00`;
      }
      return null;
    };

    // 첫번째 인수(리스트 마감 시각) 와 두번째 인수(콜백 리스트 초기화 시각) 시간비교
    const isBefore = (targetTime: string, compareTime: string): boolean => {
      const target = convertToHHmm(targetTime);
      if (!target) return false; // '미사용' 등 예외 처리

      return target < compareTime;
    };  
    
    let checkCallBackTime = true; // showConfirm 닫기나 취소를 대비한 boolean 변수

    // showConfirm을 처리한후 이후 로직이 작동되도록 비동기처리
    const confirmAsync = (message: string): Promise<boolean> => {
      return new Promise((resolve) => {
        showConfirm(
          message,
          () => resolve(true), // 확인 버튼 클릭 시 true 반환
        );
      });
    };
    
    // 시간이 입력되었으며 입력된 시간이 콜백 리스트 초기화 시각과 비교한 결과
    if (originTime && isBefore(systemCallBackTimeData ?? "미사용", originTime)) {
      checkCallBackTime = false; // Cancel 처리를 위한 false 처리

      checkCallBackTime = await confirmAsync(
        `해당 시각은 콜백 리스트 초기화 시각보다 이후 시각입니다. 설정하시겠습니까?`
      );
    }
    
    if(checkCallBackTime){
      const saveData = {
        campaign_id: Number(campaignId),
        tenant_id: selectedCampaign.tenant_id,
        call_kind: 1,
        call_timeout: 0,
        max_call: Number(limitCount),
      
        daily_init_flag: dailyInitFlag,
        daily_init_time: dailyInitTime !== null ? dailyInitTime.replace(":", "") : null,
      };
  
      // console.log('saveData', saveData);
  
      if (selectedRow) { // selectRow 및 isNewMode 체크 추가
        if (selectedRow?.campaign_id !== null) {
          // 수정
          updateCallLimitSetting(saveData);
        } 
      }else {
        
        // 신규 등록
        createCallLimitSetting(saveData);
  
        // tofix 0416
        // showAlert은 mutate의 onSuccess에서 처리
      }
    } else {

      fetchCallLimitSettingList({
        tenant_id_array: tenants.map(tenant => tenant.tenant_id)
      });
    }  
  };

  

  // 삭제 버튼 클릭 시 호출되는 함수
  // 선택된 캠페인 아이디가 없을 경우 알림
  const handleDelete = () => {
    // 선택된 항목이 없을 경우 알림
    if (!campaignId || !selectedRow) {
      showAlert('삭제할 캠페인을 먼저 선택해주세요.');
      return;
    }

    // 선택된 캠페인의 tenant_id 찾기
    const selectedCampaign = campaigns?.find(camp => camp.campaign_id === Number(campaignId));
    if (!selectedCampaign) {
      showAlert('캠페인 정보를 찾을 수 없습니다.');
      return;
    }

    // 삭제 확인 알림
    showConfirm(
      `선택된 캠페인 [${selectedCampaign.campaign_name}]의 제한건수 설정을 삭제하시겠습니까? \n\n ※주의: 삭제시 데이터베이스에서 완전 삭제됩니다. \n다시 한번 확인해 주시고 삭제해 주세요.`,
      () => {
        // 확인 버튼 클릭 시 실행될 함수
        deleteCallLimitSetting(
          {
            campaign_id: Number(campaignId),
            tenant_id: selectedCampaign.tenant_id
          },
          {
            onSuccess: () => {
              // showAlert('제한건수 설정이 성공적으로 삭제되었습니다.');

              // 삭제 후 데이터 초기화
              setSelectedRow(null);
              setCampaignId('');
              setCampaignName('');
              setLimitCount('');
              setIsNewMode(false);

              // 데이터 목록 새로고침 - 이미 onSuccess에서 처리됨
            }
          }
        );
      }
    );
  }

  // 그리드 셀 클릭 시 호출되는 함수
  const handleCellClick = ({ row }: { row: Row }) => {
    
    setSelectedRow(row);
    setCampaignId(row.campaign_id);
    setCampaignName(row.campaign_name);
    setLimitCount(row.limit_number);
    setIsNewMode(true);
    limitSettings.forEach((item) => {
      if (item.campaign_id === Number(row.campaign_id)) {
        setDailyInitFlag(item.daily_init_flag ?? 0); // ✅
        setDailyInitTime(item.daily_init_time ?? null); // ✅
      }
    });
  };

  // 신규 버튼 클릭 시 호출되는 함수
  // 입력 필드 초기화 및 신규 모드 활성화
  const handleNew = () => {
    setSelectedRow(null);
    setCampaignId('');
    setCampaignName('');
    setLimitCount('');
    setDailyInitFlag(0); // ✅
    setDailyInitTime("0000"); // ✅
    setIsNewMode(true);
  };

  // 캠페인 선택 모달에서 캠페인 선택 시 호출되는 함수
  // 선택된 캠페인 아이디와 이름을 상태에 저장하고, 그리드 로우도 선택
  const handleCampaignSelect = (id: string, name: string) => {
    setCampaignId(id);
    setCampaignName(name);
    setIsNewMode(true);
    // 선택된 캠페인의 제한건수가 있는지 체크
    const matchingSetting = limitSettings.find(
      (item) => item.campaign_id === Number(id)
    );
    if (matchingSetting) {
      const limitStr = matchingSetting.max_call.toString();
      setLimitCount(limitStr);
      // 해당 캠페인이 이미 설정되어 있으면 그리드 로우도 선택
      setSelectedRow({
        campaign_id: id,
        campaign_name: name,
        limit_number: limitStr,
        daily_init_flag : matchingSetting.daily_init_flag === 1 ? "사용" : "미사용",
        daily_init_time : matchingSetting.daily_init_time != null ? formatTime(matchingSetting.daily_init_time) : "미사용"
        
      });
      setIsNewMode(false);
    } else {
      // 제한건수가 없으면 입력 필드와 그리드 선택 모두 초기화
      setLimitCount('');
      setSelectedRow(null);
      setIsNewMode(true);
    }
  };

  useEffect(() => {
    if (activeTabId === 8) {
      const tempData = openedTabs.filter(tab => tab.id === 8);
      if (tempData.length > 0 && tempData[0].campaignId && tempData[0].campaignName) {
        setCampaignId(tempData[0].campaignId);
        setCampaignName(tempData[0].campaignName);
      }
      if (limitSettings.length > 0 && tempData.length > 0) {
        const templimitSetting = limitSettings.filter(data => data.campaign_id === Number(tempData[0].campaignId));
        if (templimitSetting.length > 0) {
          setLimitCount(templimitSetting[0].max_call + '');

        }
      }
    }
  }, [activeTabId, openedTabs, limitSettings]);

  // 필드가 비활성화되어야 하는지 결정하는 함수
  const isFieldDisabled = () => {
    // 캠페인 아이디가 있으면 항상 입력 가능하게 설정
    if (campaignId) {
      return false;
    }
    // 선택된 행이 없고 신규 모드도 아니면 비활성화
    return !selectedRow && !isNewMode;
  };

  const getRowClass = (row: Row) => {
    return selectedRow?.campaign_id === row.campaign_id &&
      selectedRow?.limit_number === row.limit_number ? 'bg-[#FFFAEE]' : '';
  };

  


  return (
    <div className="flex gap-8">
      <div className="w-[580px]">
        <div className='grid-custom-wrap h-[230px]'>
          <DataGrid
            columns={columns}
            rows={rows}
            className="grid-custom"
            onCellClick={handleCellClick}
            rowKeyGetter={(row) => row.campaign_id + row.limit_number}
            selectedRows={selectedRow ? new Set<string>([selectedRow.campaign_id.toString()]) : new Set<string>()}
            rowHeight={30}
            headerRowHeight={30}
            rowClass={getRowClass}
            enableVirtualization={false}
          />
        </div>

        <div className="flex justify-end items-center pt-4">
            <Label className="w-[10rem] min-w-[10rem] flex items-center gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#333]">콜백 리스트 초기화 시각</Label>
            <CustomInput
              value={systemCallBackTimeData}
              readOnly
              className="w-[80px]"
              disabled={true}
            />
        </div>
      </div>

      <div className="w-[513px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label className="w-[5rem] min-w-[5rem]">캠페인 아이디</Label>
            <CustomInput
              value={campaignId}
              readOnly
              className="w-full"
              disabled={true}
            />
            <CommonButton
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              캠페인 조회
            </CommonButton>
          </div>

          <div className="flex items-center gap-2">
            <Label className="w-[5rem] min-w-[5rem]">캠페인 이름</Label>
            <CustomInput
              value={campaignName}
              readOnly
              className="w-full"
              disabled={true}
            />
          </div>

          {/* 제한 건수 */}
          <div className="flex items-center gap-2">
            <Label className="w-[5rem] min-w-[5rem]">제한건수</Label>
            <CustomInput
              value={limitCount}
              className="w-full"
              onChange={(e) => setLimitCount(e.target.value)}
              disabled={isFieldDisabled()}
              maxLength={10}
            />
          </div>

          {/* 일별 초기화 사용 여부 */}
          <div className="flex items-center gap-3 pt-1">
            <Label className="w-[5rem] min-w-[5rem]">일별 초기화</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#333]">
                <input
                  type="checkbox"
                  name="dailyInitFlag"
                  value={0}
                  checked={dailyInitFlag === 0}
                  onChange={() => setDailyInitFlag(0)}
                  disabled={isFieldDisabled()}
                />
                미사용
              </label>
              <label className="flex items-center gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#333]">
                <input
                  type="checkbox"
                  name="dailyInitFlag"
                  value={1}
                  checked={dailyInitFlag === 1}
                  onChange={() => setDailyInitFlag(1)}
                  disabled={isFieldDisabled()}
                />
                사용
              </label>
            </div>
          </div>

          {/* 하루 1회 초기화 여부 */}
          <div className="flex items-center gap-3 pt-1">
            <Label className="w-[5rem] min-w-[5rem]">리스트 삭제 <br></br> 마감 초기화</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#333]">
                <input
                  type="checkbox"
                  name="dailyInitTime"
                  value={0}
                  checked={dailyInitTime === null} // dailyInitTime이 null일 때 "미사용" 체크
                  onChange={() => setDailyInitTime(null)} // "미사용" 선택 시 dailyInitTime을 null로 설정
                  disabled={isFieldDisabled()} 
                />
                미사용
              </label>
              <label className="flex items-center gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#333]">
                <input
                  type="checkbox"
                  name="dailyInitTime"
                  value={1}
                  checked={dailyInitTime !== null} // dailyInitTime이 null이 아닐 때 "사용" 체크
                  onChange={() => setDailyInitTime("0000")} // "사용" 선택 시 기본값 설정
                  disabled={isFieldDisabled()}
                />
                사용
              </label>
            </div>
          </div>

          {/* 초기화 시각 입력 (dailyInitFlag === 1 일 때만 활성화) */}
          <div className="flex items-center gap-2 pt-1">
            <Label className="w-[5rem] min-w-[5rem]">리스트 마감 <br></br> 시각</Label>
            <CustomInputForTime
              value={dailyInitTime ?? " "}
              onChange={(value) => setDailyInitTime(value)}
              disabled={dailyInitTime === null} // dailyInitTime이 null이 아닐 때 비활성화
              className="w-[120px]"
            />


          </div>

          <div className="flex justify-end gap-2 pt-4">
            <CommonButton onClick={()=> setIsModalOpen(true)}>신규</CommonButton>
            <CommonButton onClick={handleSave}>저장</CommonButton>
            <CommonButton onClick={handleDelete}>삭제</CommonButton>
          </div>
          <div className="mt-[20px] text-sm">
            <ul className='space-y-1'>
              <li>• 필요 이상의 예약콜 / 콜백에 대한 제한이 필요한 경우</li>
              <li>&nbsp;&nbsp;&nbsp;입력 받을 콜 수를 제한 할 수 있습니다.</li>
              <li>• 리스트 마감 시각은 콜백 리스트 초기화 시각 전으로 설정하여야 합니다.</li>
            </ul>
          </div>
        </div>
      </div>

      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDailyInitFlag(0); 
          setDailyInitTime(null); 
          setIsNewMode(false);
        }}
        onSelect={handleCampaignSelect}
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
};

export default CampaignSettings;