import CommonButton from "@/components/shared/CommonButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { Label } from "@/components/ui/label";
import { useApiForSystemCallBackTimeSetting, useApiForSystemCallBackTimeUpdate } from "@/features/preferences/hooks/useApiForSystemCallBackTimeSetting";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { SystemCallBackTimeUpdateRequest } from "@/features/preferences/types/SystemPreferences";
import { useApiForCallLimitSettingList } from "@/features/preferences/hooks/useApiForCallLimitSetting";
import { useMainStore } from "@/store";
import CustomAlert from "@/components/shared/layout/CustomAlert";
import ServerErrorCheck from "@/components/providers/ServerErrorCheck";

interface SystemCallBackTimeData {
    use_flag : number; // 0: 미사용, 1: 사용
    init_hour? : string; // "01" string
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


const SystemCallBackTimeSetting = () => {

    const router = useRouter();

    const [alertState, setAlertState] = useState({
        isOpen: false,
        message: '',
        title: '알림',
        type: '1',
        onConfirm: () => {},
        onCancel: () => {}
    });

    const showAlert = (message: string) => {
        setAlertState({
            isOpen: true,
            message,
            title: '알림',
            type: '2',
            onConfirm: closeAlert,
            onCancel: () => {}
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

    // response_data
    // use_flag -- 필수 값 0: 미사용, 1: 사용 number
    // init_time -- "01" string

    // request_data
    // init_flag  -- 필수 값 number
    // init_hour -- 옵셔널값  init_flag 가 1이면 보내야하고, 0이면 안보낸다 string

    const { tenants } = useMainStore();

    const [selectSystemCallBackTime, setSelectSystemCallBackTime] = useState<string>(''); // 시스템 콜백 리스트 초기화 시간 설정  
    const [systemCallBackTimeData, setSystemCallBackTimeData] = useState<SystemCallBackTimeData>(); // response 시스템 콜백 리스트 초기화 시간 설정 데이터
    const [allLimitSettings, setAllLimitSettings] = useState<LimitSettingItem[]>([]);
    const [timeArray, setTimeArray] = useState<string[]>([]);

    // 시스템 콜백 리스트 초기화 시간 설정 리스트
    const systemCallBackTimeList = ['미사용', '0시', '1시', '2시', '3시', '4시', '5시', '6시', '7시', '8시', '9시',
        '10시', '11시', '12시', '13시', '14시', '15시', '16시', '17시', '18시', '19시', '20시', '21시', '22시', '23시'];
    
    // 예약콜 제한건수 조회
      const { mutate: fetchCallLimitSettingList } = useApiForCallLimitSettingList({
        onSuccess: (data) => {

            setAllLimitSettings(data.result_data); 
            setTimeArray(
                allLimitSettings
                .filter((element) => element.daily_init_time !== null) // daily_init_time이 null인 항목만 필터링
                .map((element) => element.daily_init_time ?? "") // null 값을 빈 문자열로 변환
            );
            
        }, onError: (error) => {
          ServerErrorCheck('예약콜 제한건수 조회', error.message);
        }
      });


    // 콜백 리스트 초기화 시각 조회
    const { mutate: fetchSystemCallBackTime } = useApiForSystemCallBackTimeSetting({
        onSuccess: (data) => {

            const { use_flag, init_hour } = data.result_data;

            const formattedHour = use_flag === 0
                ? '미사용'
                : parseInt(init_hour ?? '0').toString() + '시'; // "0100" -> "1시"

            setSystemCallBackTimeData(data.result_data);
            setSelectSystemCallBackTime(formattedHour);
            // setSystemCallBackTimeData(data.result_data); // 시스템 콜백 리스트 초기화 시간 설정
            // setSelectSystemCallBackTime(data.result_data?.use_flag === 0 ? '미사용' : data.result_data.init_hour || ''); // 시스템 콜백 리스트 초기화 시간 설정
        },
        onError: (error) => {     
            ServerErrorCheck('콜백 리스트 초기화 시간 조회', error.message);
        }
    }); // end of useApiForSystemCallBackTimeSetting


    // 콜백 리스트 초기화 시간 수정
    const { mutate: updateSystemCallBackTime } = useApiForSystemCallBackTimeUpdate({
        onSuccess: (data) => {
            if (data.result_code === 0) {
                showAlert('수정되었습니다.');
                fetchSystemCallBackTime(); // 수정 후 다시 조회
                fetchCallLimitSettingList({
                    tenant_id_array: tenants.map(tenant => tenant.tenant_id)
                });
            } else {
                showAlert(`수정 실패: ${data.result_msg}`);
            }
        },
        onError: (error) => {      
            ServerErrorCheck('콜백 리스트 초기화 시간 수정', error.message);
        }
    }); // end of useApiForSystemCallBackTimeUpdate


    useEffect(() => {
        fetchSystemCallBackTime();
        fetchCallLimitSettingList({
            tenant_id_array: tenants.map(tenant => tenant.tenant_id)
        });

        // console.log('TimeArray : ', timeArray);

        
    }, []);

    
    // 시스템 콜백 리스트 초기화 시간 설정 상태 업데이트
    const handleSystemCallBackTimeChange = (value: string) => {
        // console.log('Selected value:', value);
        setSelectSystemCallBackTime(value);
    }; // end of handleSystemCallBackTimeChange

    const confirmAsync = (message: string): Promise<boolean> => {
        return new Promise((resolve) => {
          showConfirm(
            message,
            () => resolve(true), // 확인 버튼 클릭 시 true 반환
          );
        });
    };

    // 선택한 시스템 콜백 리스트 초기화 시간을 설정
    const handleSystemCallBackTimeSave = async () => {

        if(selectSystemCallBackTime === null || selectSystemCallBackTime.trim() === '') {
            showAlert('시간을 선택해주세요.');
            return;
        }
        // init_flag 값 설정
        const use_flag = selectSystemCallBackTime === '미사용' ? 0 : 1;

        // selectSystemCallBackTime가 0시부터 9시까지는 "0"을 더해서 00, 01, 02, ... 형식으로 변환하고 10, 11.. 으론 그대로
        const isUsingTime = selectSystemCallBackTime.trim() !== "미사용";
        const formattedTime = isUsingTime
        ? selectSystemCallBackTime.replace("시", "").padStart(2, "0")
        : null;
        
        let checkTime = true;

        if (formattedTime && timeArray.length > 0) {
            const isEarlierOnly = timeArray.every((element) => {
                return element < `${formattedTime}00`;
            });

            if(!isEarlierOnly){
                checkTime = false;
                checkTime = await confirmAsync(
                    '현재 설정 되어있는 캠페인의 리스트 마감시각이 선택한 시간보다 이전시각입니다. 그래도 설정하시겠습니까?'
                );
            }
        }
        
        if(checkTime){
            // 요청 데이터 생성
            const requestData: SystemCallBackTimeUpdateRequest = {
                use_flag,
                ...(use_flag === 1 && { init_hour: formattedTime ?? "00" }), // init_flag가 1일 때만 init_hour 포함
            };
            // console.log('Request Data:', requestData);
            updateSystemCallBackTime(requestData); // API 호출
        }

    }; // end of handleSystemCallBackTimeSave

    
    return (

        <div className="flex gap-3">
            <div className="w-[580px]">
                <div className='pt-3 flex items-center gap-3'>
                <Label className="w-[15rem] min-w-[15rem]">콜백 리스트 초기화 시각 설정</Label>
                    <Select
                    value={selectSystemCallBackTime} // "01" -> "1시" 
                    onValueChange={handleSystemCallBackTimeChange}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="시간설정" />
                        </SelectTrigger>
                        <SelectContent style={{ maxHeight: '300px', overflowY: 'auto' }}> 
                            {systemCallBackTimeList.map(time => (
                                <SelectItem 
                                    key={time} 
                                    value={time === '미사용' ? '미사용' : time} // "미사용"은 그대로 사용하고, 나머지는 "시"를 제거한 값으로 설정
                                >
                                    {time}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <CommonButton onClick={()=>handleSystemCallBackTimeSave()}>적용</CommonButton>
                </div>
            </div>
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

export default SystemCallBackTimeSetting;