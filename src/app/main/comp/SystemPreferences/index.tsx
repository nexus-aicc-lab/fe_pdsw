import React, { useEffect, useMemo, useState } from 'react';
import TitleWrap from "@/components/shared/TitleWrap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import DataGrid, { CellClickArgs } from 'react-data-grid';
import { useAuthStore, useMainStore } from '@/store';
import { ChannelListDataResponse, DialingDeviceListDataResponse } from '@/features/preferences/types/SystemPreferences';
import { useApiForChannelList } from '@/features/preferences/hooks/useApiForChannelList';
import { useApiForChannelEdit } from '@/features/preferences/hooks/useApiForChannelEdit';
import { useApiForDialingDevice, useApiForDialingDeviceCreate, useApiForDialingDeviceDelete, useApiForDialingDeviceUpdate } from '@/features/preferences/hooks/useApiForDialingDevice';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEnvironmentStore } from '@/store/environmentStore';
import { useApiForSchedules } from '@/features/campaignManager/hooks/useApiForSchedules';
import { useApiForChannelGroupList } from '@/features/preferences/hooks/useApiForChannelGroup';
import ServerErrorCheck from '@/components/providers/ServerErrorCheck';
import { useSystemDeviceStore } from '@/store/systemDeviceStore';

interface EquipmentRow {
    device_id: string;
    channel_count: number;
    device_name: string;
    usage: string;
}

interface ChannelRow {
    channelNumber: number;
    channelName: string;
    mode: string;
    assignValue: number;
}

// 디바이스 상태 인터페이스 추가
interface DeviceStatus {
    device_id: string;
    device_status: "run" | "down";
}

interface updateChannel {
    channelNumber: number;
    mode: string;
}

const errorMessage = {
    isOpen: false,
    message: '',
    title: '로그인',
    type: '2',
};

const SystemPreferences = () => {
    const [refreshCycle, setRefreshCycle] = useState("");
    const [monitoringType, setMonitoringType] = useState("periodic");
    const [equipmentNumber, setEquipmentNumber] = useState("");
    const [equipmentName, setEquipmentName] = useState("");
    const [allocationMode, setAllocationMode] = useState("");
    const [allocationOutboundMode, setAllocationOutboundMode] = useState("");
    
    const [selectedDevice, setSelectedDevice] = useState<EquipmentRow | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<ChannelRow | null>(null);
    const [filteredChannels, setFilteredChannels] = useState<ChannelRow[]>([]);
    const [isEditable, setIsEditable] = useState(false);
    const [scheduleData, setScheduleData] = useState<any[]>([]);

    // 디바이스 상태를 저장할 상태 변수 추가
    const [deviceStatuses, setDeviceStatuses] = useState<Record<string, "run" | "down">>({});

    // 채널 할당 발신모드 일괄적용을 위한 상태 추가
    const [updatedChannelAssign, setUpdatedChannelAssign] = useState<updateChannel[]>([]);

    const {saveSelectDevice, setSaveSelectDevice } = useSystemDeviceStore();

    const { tenant_id, role_id } = useAuthStore();

    // useMainStore의 campaigns에서 가져오는 creation_time으로 채널 리스트의 값이 useEnvironmentStore에서 가져오는 환경설정에서 설정한 
    // showChannelCampaignDayScop 시간내에 만들어진것만 보이게 수정해야함.
    const { tenants, campaigns } = useMainStore();
    const { environmentData } = useEnvironmentStore();
    const [dialingDeviceList, setDialingDeviceList] = useState<DialingDeviceListDataResponse[]>([]);
    const [channelList, setChannelList] = useState<ChannelListDataResponse[]>([]);
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

    // Footer에서 발생하는 이벤트 수신을 위한 이벤트 리스너 추가
    useEffect(() => {
        // 장비 상태 변경 이벤트 수신 함수
        const handleDeviceStatusChange = (event: any) => {
            
            const { device_id, device_status } = event.detail;
            
            // 디바이스 상태 업데이트
            setDeviceStatuses(prev => ({
                ...prev,
                [device_id]: device_status
            }));
    
            // 선택된 디바이스가 변경된 디바이스와 동일하면 상태 갱신
            if (selectedDevice && selectedDevice.device_id === device_id) {
                setSelectedDevice(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        usage: device_status === "run" ? "사용" : "미사용"
                    };
                });
            }
        };
        
        // 이벤트 리스너 등록 (타입 캐스팅 추가)
        window.addEventListener('deviceStatusChange', handleDeviceStatusChange as EventListener);
        
        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            window.removeEventListener('deviceStatusChange', handleDeviceStatusChange as EventListener);
        };
    }, [selectedDevice]);

    // 장비 목록 조회
    const { mutate: fetchDialingDeviceList } = useApiForDialingDevice({
        onSuccess: (data) => {
            
            // 응답 데이터 구조 확인 및 예외 처리
            if (!data) {
                setDialingDeviceList([]);
                return;
            }
            
            if (!data.result_data) {
                setDialingDeviceList([]);
                return;
            }
            
            // result_data가 배열인지 확인
            if (!Array.isArray(data.result_data)) {
                setDialingDeviceList([]);
                return;
            }
            
            setDialingDeviceList(data.result_data);
            
            // 만약 조회된 장비목록이 있다면, 스토어에 저장된 이미 선택된 장비나, 첫번째 장비를 선택 상태로 설정하기
            if(data.result_data.length > 0) {

                if(saveSelectDevice){
                    const savedDevice = data.result_data.find(device => 
                        device && device.device_id && device.device_id.toString() === saveSelectDevice
                    );
                    
                    if (savedDevice) {
                        const deviceRow = {
                            device_id: savedDevice.device_id.toString(),
                            channel_count: savedDevice.channel_count,
                            device_name: savedDevice.device_name,
                            usage: getDeviceUsage(savedDevice.device_id)
                        };
                        setSelectedDevice(deviceRow);
                        setIsEditable(true);
                    }
                }else{

                    const firstRow = {
                        device_id : data.result_data[0].device_id.toString(),
                        channel_count : data.result_data[0].channel_count,
                        device_name : data.result_data[0].device_name,  
                        usage : getDeviceUsage(data.result_data[0].device_id)
                    }
                    setSelectedDevice(firstRow);
                }

            } // end of if 
            
            // 현재 저장된 장비를 찾아서 선택 상태로 설정
            if (!equipmentNumber) return;
            
            const currentDeviceId = equipmentNumber;
            const savedDevice = data.result_data.find(device => 
                device && device.device_id && device.device_id.toString() === currentDeviceId
            );
            
            if (savedDevice) {
                const deviceRow = {
                    device_id: savedDevice.device_id.toString(),
                    channel_count: savedDevice.channel_count,
                    device_name: savedDevice.device_name,
                    usage: getDeviceUsage(savedDevice.device_id)
                };
                setSelectedDevice(deviceRow);
                setIsEditable(true);
            }
        },
        onError: (error) => {      
            ServerErrorCheck('장비 목록 조회', error.message);
        }
    });

    // 채널 목록 조회
    const { mutate: fetchChannelList } = useApiForChannelList({
        onSuccess: (data) => {
            setChannelList(data.result_data);
        },onError: (error) => {      
            ServerErrorCheck('채널 목록 조회', error.message);
        }
    });

    // 채널 정보 수정 api 호출
    const { mutate: fetchChannelEdit } = useApiForChannelEdit({
        onSuccess: (data) => {
            fetchChannelList();
            fetchDialingDeviceList({
                tenant_id_array: tenant_id === 0 ?  tenants.map(tenant => tenant.tenant_id) : [tenant_id]
            });
        },onError: (error) => {
            ServerErrorCheck('채널 정보 수정', error.message);
        }
    });
    
    // 장비 신규 등록 API
    const { mutate: createDevice } = useApiForDialingDeviceCreate({
        onSuccess: (data) => {
            fetchChannelList();
            fetchDialingDeviceList({
                tenant_id_array: tenant_id === 0 ?  tenants.map(tenant => tenant.tenant_id) : [tenant_id]
            });
        },onError: (error) => {
            ServerErrorCheck('장비 신규 등록', error.message);
        }
    });

    // 장비 수정 API
    const { mutate: updateDevice } = useApiForDialingDeviceUpdate({
        onSuccess: (data) => {
            fetchChannelList();
            fetchDialingDeviceList({
                tenant_id_array: tenant_id === 0 ?  tenants.map(tenant => tenant.tenant_id) : [tenant_id]
            });
        },
        onError: (error) => {
            ServerErrorCheck('장비 수정', error.message);
        }
    });

    // 장비 삭제 API
    const { mutate: deleteDevice } = useApiForDialingDeviceDelete({
        onSuccess: (data) => {
            fetchChannelList();
            fetchDialingDeviceList({
                tenant_id_array: tenant_id === 0 ?  tenants.map(tenant => tenant.tenant_id) : [tenant_id]
            });
        },
        onError: (error) => {
            ServerErrorCheck('장비 삭제', error.message);
        }
    });

    // 스케줄 조회
    const { mutate: fetchSchedules } = useApiForSchedules({
        onSuccess: (data) => {
            // 스케줄 데이터 처리 및 저장
            if (data && data.result_data && Array.isArray(data.result_data)) {
                setScheduleData(data.result_data);
            }
        },
        onError: (error) => {
            ServerErrorCheck('스케줄 조회', error.message);
        }
    });

    // 채널 그룹 상태 추가
    const [channelGroupList, setChannelGroupList] = useState<any[]>([]);

    // 채널 그룹 조회
    const { mutate: fetchChannelGroupList } = useApiForChannelGroupList({
        onSuccess: (data) => {
            
            setChannelGroupList(data.result_data);
            
        }, 
        onError: (error) => {
            ServerErrorCheck('채널 그룹 조회', error.message);
        }
    });

    // 장비 목록 조회 시 테넌트 정보가 변경될 때마다 호출
    useEffect(() => {
        if (tenants && tenants.length > 0) {
            fetchDialingDeviceList({
                tenant_id_array: tenant_id === 0 ?  tenants.map(tenant => tenant.tenant_id) : [tenant_id]
            });
            fetchChannelList();
            
            fetchSchedules({
                tenant_id_array: tenants.map(tenant => tenant.tenant_id)
            });

            fetchChannelGroupList();
        } 
    }, [tenants]);

    // 장비의 사용여부를 확인하는 함수 (실시간 상태 반영)
    const getDeviceUsage = (deviceId: number): string => {
        const deviceIdStr = deviceId.toString();
        // 실시간 상태가 있으면 확인
        if (deviceIdStr in deviceStatuses) {
            if (deviceStatuses[deviceIdStr] === "run") {
                return "사용";
            } else if (deviceStatuses[deviceIdStr] === "down") {
                return "미사용";
            } else {
                return "미사용"; // null 또는 기타 값
            }
        }
        
        // 실시간 상태가 없으면 API에서 받은 초기 상태 확인
        if (!dialingDeviceList || !Array.isArray(dialingDeviceList)) {
            return "미사용";
        }
        
        const device = dialingDeviceList.find(d => d && d.device_id && d.device_id.toString() === deviceIdStr);
        if (device) {
            if (device.device_state === "run") {
                return "사용";
            } else if (device.device_state === "down") {
                return "미사용";
            } else {
                return "미사용"; // null 또는 기타 값
            }
        }
        
        // 그 외에는 미사용
        return "미사용";
    };

    // 할당 발신모드에 따른 채널 모드 반환
    const getChannelMode = (assignValue: number, assignKind: number): string => {
        if (assignKind === 1) {
            // 캠페인으로 할당일 때 기존 로직
            switch(assignValue) {
                case 2147483647:
                    return "모든 캠페인사용";
                case 0:
                    return "회선사용안함";
                default: {
                    // 수정: campaigns가 비어있지 않은지 확인
                    if (!campaigns || !Array.isArray(campaigns)) {
                        return "미할당";
                    }
                    
                    const campaign = campaigns.find(camp => camp && camp.campaign_id === assignValue);
                    if (campaign) {
                        return `ID[${campaign.campaign_id}] : ${campaign.campaign_name}`;
                    }
                    return "미할당";
                }
            }
        } else if (assignKind === 2) {
            // 발신모드로 할당일 때 새로운 로직
            switch(assignValue) {
                case 0:
                    return "회선사용안함";
                case 2147483647:
                    return "발신방법 모두사용";
                case 1:
                    return "Power Mode";
                case 2:
                    return "Progressive Mode";
                case 3:
                    return "Predictive Mode";
                case 5:
                    return "System Preview";
                default:
                    return "미할당";
            }
        } else if (assignKind === 3) {
            switch(assignValue) {
                case 0:
                    return "회선사용안함";
                case 2147483647:
                    return "모든 그룹아이디 사용";
                default:
                    // 수정: channelGroupList가 비어있지 않은지 확인
                    if(channelGroupList && Array.isArray(channelGroupList)) {
                        const group = channelGroupList.find(group => group && group.group_id === assignValue);
                        if (group) {
                            return `ID[${group.group_id}] : ${group.group_name}`;
                        }
                    }
                    return "미할당";
            }
        }
        return "미할당";
    };

    // 장비 목록 데이터 구성
    const equipmentRows = useMemo(() => {
        // dialingDeviceList가 없을 경우 빈 배열 반환
        if (!dialingDeviceList || !Array.isArray(dialingDeviceList) || dialingDeviceList.length === 0) {
            return [];
        }
        
        return dialingDeviceList.map(device => ({
            device_id: device.device_id.toString(),
            channel_count: device.channel_count,
            device_name: device.device_name,
            usage: getDeviceUsage(device.device_id)
        }));
    }, [dialingDeviceList, channelList, deviceStatuses]);

    // 장비 목록 데이터 구성
    const equipmentColumns = [
        { key: "device_id", name: "장비 번호" },
        { key: "channel_count", name: "채널 수" },
        { key: "device_name", name: "장비 이름" },
        { key: "usage", name: "사용 여부" }
    ];

    

    // 채널 목록 데이터 구성
    const channelColumns = [
        { key: "channelNumber", name: "채널 번호" },
        { key: "channelName", name: "채널 이름" },
        {
            key: "mode",
            name: "할당 발신모드",
            renderCell: ({ row }: { row: ChannelRow }) => (
              <div className="flex justify-center items-center w-full h-full">
                <select
                  value={row.mode}
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 전파 중단
                    handleChannelCellClick({ row } as CellClickArgs<ChannelRow>);// onCellClick 수동 호출
                  }}
                  onChange={(e) =>
                    handleModeChange(row.channelNumber, e.target.value)
                  }
                  className="p-1 text-sm w-full h-full bg-transparent focus:outline-none" // select 태그 투명하게해서 cell 스타일 적용하기
                  style={{
                    textAlign: "center",
                    padding: "0.25rem",
                    boxSizing: "border-box",
                  }}
                >
                  {getAllocationOutboundModeOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ),
          }
          
      ];

      // #################### 배열로 넣자 #######################

      // 채널 전체가 가야한다!!!! 채널 원본 전체데이터에서 수정된것만 수정해서 가야함!
      const handleModeChange = (channelNumber: number, newMode: string) => {
        
        setUpdatedChannelAssign((prevAssign) => {
            const updatedAssign = [...prevAssign];
            const channelIndex = updatedAssign.findIndex((assign) => assign.channelNumber === channelNumber);
        
            if (channelIndex !== -1) {
                updatedAssign[channelIndex].mode = newMode; // 기존 데이터 수정
            } else {
                updatedAssign.push({ channelNumber, mode: newMode }); // 새로운 데이터 추가
            }
        
            return updatedAssign;
        });
        
        // UI 업데이트를 위해 filteredChannels도 업데이트
        setFilteredChannels((prevChannels) =>
          prevChannels.map((channel) =>
            channel.channelNumber === channelNumber
              ? { ...channel, assignValue: parseInt(newMode), mode: newMode }
              : channel
          )
        );
      
    };

    // 장비 목록 클릭 핸들러
    const handleEquipmentCellClick = ({ row }: CellClickArgs<EquipmentRow>) => {
        if (row) {
            setSelectedDevice(row);
            setSaveSelectDevice(row.device_id);
        }
    };

    // 채널 목록 클릭 핸들러
    const handleChannelCellClick = ({ row }: CellClickArgs<ChannelRow>) => {
        if (row) {
            setSelectedChannel(row);
        }
    };

    // 장비 상세내역의 신규 버튼 클릭 핸들러
    const handleNewEquipment = () => {
        // dialingDeviceList 안전 검사 추가
        if (!dialingDeviceList || !Array.isArray(dialingDeviceList) || dialingDeviceList.length === 0) {
            // 장비가 없는 경우 첫 번호는 1로 설정
            setEquipmentNumber("1");
        } else {
            const deviceIds = dialingDeviceList
                .filter(device => device && device.device_id) // 유효한 device_id만 필터링
                .map(device => device.device_id)
                .sort((a, b) => a - b);
                
            const lastDeviceId = deviceIds.length > 0 ? deviceIds[deviceIds.length - 1] : 0;
            const newDeviceId = (lastDeviceId + 1).toString();
            setEquipmentNumber(newDeviceId);
        }
    
        setSelectedDevice(null);
        setEquipmentName("");
        setRefreshCycle("");
        setMonitoringType("periodic");
        setFilteredChannels([]);
        setSelectedChannel(null);
        setAllocationMode("");
        setAllocationOutboundMode("");
        setIsEditable(true);
    };
    

    // 장비 저장 핸들러 (신규/수정 공통 검증)
    const validateEquipmentData = () => {
        if (!equipmentNumber || !equipmentName || !refreshCycle) {
            showAlert('모든 필드를 입력해 주세요.');
            return false;
        }

        const channelCount = parseInt(refreshCycle);
        if (isNaN(channelCount) || channelCount <= 0) {
            showAlert('유효한 채널 수를 입력해 주세요.');
            return false;
        }

        return true;
    };

    // 장비 저장 핸들러
    const handleSaveEquipment = () => {
        if (!validateEquipmentData()) return;

        const saveRequest = {
            tenant_id: tenants[0].tenant_id,
            device_id: parseInt(equipmentNumber),
            device_name: equipmentName,
            channel_count: parseInt(refreshCycle)
        };

        const handleApiResponse = (response: any) => {
            if (response.result_code === -1) {
                showAlert('[LICENSE FULL] CIOD 접속 라이선스를 초과하였습니다.\n라이선스 문의 후 다시 시도하여 주십시오.');
                return;
            }
            
            if (selectedDevice) {
                showAlert('장비 정보가 성공적으로 수정되었습니다.');
            } else {
                showAlert('새로운 장비 정보가 성공적으로 저장되었습니다.');
            }
        };

        if (selectedDevice) {
            updateDevice(saveRequest, {
                onSuccess: handleApiResponse
            });
        } else {
            createDevice(saveRequest, {
                onSuccess: handleApiResponse
            });
        }
    };

    // 장비 삭제 핸들러
    const handleDeleteEquipment = () => {
        if (!selectedDevice) {
            showAlert('삭제할 장비를 먼저 선택해 주세요.');
            return;
        }

        showConfirm(
            `장비 [${selectedDevice.device_name}]을 삭제하시겠습니까? \n\n ※주의: 삭제 시 데이터베이스에서 완전 삭제됩니다. \n 다시 한 번 확인해 주시고 삭제해 주세요.`,
            () => {
                deleteDevice({
                    tenant_id: tenants[0].tenant_id,
                    device_id: parseInt(selectedDevice.device_id || "0")
                }, {
                    onSuccess: (data) => {
                        showAlert('장비 삭제 요청이 성공적으로 처리되었습니다.');
                        setSelectedDevice(null);
                        setEquipmentNumber("");
                        setEquipmentName("");
                        setRefreshCycle("");
                        setFilteredChannels([]);
                        setSelectedChannel(null);
                        setAllocationMode("");
                        setAllocationOutboundMode("");
                        setIsEditable(false);
                    }
                });
            }
        );
    };

    // 채널 수정 핸들러
    const handleChannelEdit = () => {
        if (!selectedDevice) return;

        // channelList 안전 검사 추가
        if (!channelList || !Array.isArray(channelList)) {
            showAlert('채널 정보를 불러올 수 없습니다.');
            return;
        }

        const deviceChannels = channelList.find(
            channel => channel && channel.device_id && 
            channel.device_id.toString() === selectedDevice.device_id
        );

        if (!deviceChannels) {
            showAlert('이 장비에 대한 채널 정보가 없습니다. 시스템 관리자에게 문의하세요.');
            return;
        }

        // 초기화된 채널 할당 배열 생성
        let updatedAssign = new Array(selectedDevice.channel_count).fill(0);

        // 할당모드가 변경되었는지 확인
        if (deviceChannels.assign_kind.toString() !== allocationMode) {
            // 할당모드가 변경된 경우 모든 채널을 0으로 초기화
            updatedAssign = new Array(selectedDevice.channel_count).fill(0);
        } else {
            // 기존 로직 유지: 기존 채널 데이터를 기반으로 업데이트
            updatedAssign = deviceChannels.channel_assign.map((assignValue) => assignValue);
        }

        // 변경된 부분만 반영
        updatedChannelAssign.forEach(({ channelNumber, mode }) => {
            if (channelNumber >= 0 && channelNumber < updatedAssign.length) {
                updatedAssign[channelNumber] = parseInt(mode);
            }
        });

        // 유효성 검사: updatedAssign 배열이 유효한지 확인
        if (!Array.isArray(updatedAssign) || updatedAssign.length !== selectedDevice.channel_count) {
            showAlert('채널 할당 정보가 올바르지 않습니다. 다시 시도해 주세요.');
            return;
        }

        // API 요청 데이터 생성
        const channelEditRequest = {
            device_id: parseInt(selectedDevice.device_id),
            assign_kind: parseInt(allocationMode),
            channel_count: selectedDevice.channel_count,
            channel_assign: updatedAssign,
        };

        // console.log("Channel Edit Request:", channelEditRequest);

        // API 호출
        fetchChannelEdit(channelEditRequest);
        showAlert('채널 정보가 성공적으로 수정되었습니다.');

        // 상태 업데이트
        setUpdatedChannelAssign([]);
    };

    // 할당 발신모드 옵션 생성
    const getAllocationOutboundModeOptions = () => {
        if (allocationMode === "1") {
          // 캠페인으로 할당일 때 기본 옵션
          const defaultOptions = [
            { value: "2147483647", label: "모든 캠페인사용" },
            { value: "0", label: "회선사용안함" },
          ];
          
          // campaigns가 비어있는지 확인
          if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
            return defaultOptions;
          }
          
          // 현재 날짜
          const currentDate = new Date();
          const dayScope = environmentData?.showChannelCampaignDayScop || 0; // 설정 값이 없으면 기본값 0
          
          // dayScope가 0이면 모든 캠페인 표시
          if (dayScope === 0) {
            const allCampaignOptions = campaigns.map(campaign => ({
              value: campaign.campaign_id.toString(),
              label: `ID[${campaign.campaign_id}] : ${campaign.campaign_name}`
            }));
            return [...defaultOptions, ...allCampaignOptions];
          }
          
          // scheduleData가 없으면 모든 캠페인 표시
          if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
            const allCampaignOptions = campaigns.map(campaign => ({
              value: campaign.campaign_id.toString(),
              label: `ID[${campaign.campaign_id}] : ${campaign.campaign_name}`
            }));
            return [...defaultOptions, ...allCampaignOptions];
          }
          
          // 캠페인 ID를 key로, end_date를 value로 맵 생성
          const campaignEndDateMap = new Map();
          
          // 스케줄 데이터에서 각 캠페인의 end_date 추출
          scheduleData.forEach(schedule => {
            if (schedule && schedule.campaign_id !== undefined && schedule.end_date) {
              const campaignId = typeof schedule.campaign_id === 'number' ? 
                schedule.campaign_id : parseInt(schedule.campaign_id);
              
              // YYYYMMDD 형식의 end_date를 Date 객체로 변환
              let endDateStr = schedule.end_date;
              
              // YYYYMMDD 형식을 YYYY-MM-DD 형식으로 변환
              if (endDateStr && endDateStr.length === 8) {
                endDateStr = `${endDateStr.substring(0, 4)}-${endDateStr.substring(4, 6)}-${endDateStr.substring(6, 8)}`;
              }
              
              campaignEndDateMap.set(campaignId, endDateStr);
            }
          });
          
          // 필터링: end_date가 현재 날짜 기준으로 showChannelCampaignDayScop 일 이내인 캠페인만 표시
          const filteredCampaigns = campaigns.filter(campaign => {
            // 캠페인 객체가 유효한지 확인
            if (!campaign || campaign.campaign_id === undefined) {
              return false;
            }
            
            // 캠페인에 대한 end_date 가져오기
            const endDateStr = campaignEndDateMap.get(campaign.campaign_id);
            
            // end_date가 없으면 포함 (이 부분이 수정됨)
            if (!endDateStr) {
              return true;
            }
            
            // 날짜 문자열을 Date 객체로 변환
            const endDate = new Date(endDateStr);
            
            // 유효한 날짜인지 확인
            if (isNaN(endDate.getTime())) {
              return true; // 날짜가 유효하지 않아도 포함 (이 부분도 수정됨)
            }
            
            // 현재 날짜와의 차이 계산 (밀리초 단위)
            const timeDiff = endDate.getTime() - currentDate.getTime();
            
            // 일 단위로 변환 (미래 날짜면 양수, 과거 날짜면 음수)
            const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
            
            // dayScope 이내인지 확인
            return dayDiff >= -dayScope;
          });
          
          // 필터링된 캠페인을 드롭다운 옵션으로 변환
          const campaignOptions = filteredCampaigns.map(campaign => ({
            value: campaign.campaign_id.toString(),
            label: `ID[${campaign.campaign_id}] : ${campaign.campaign_name}`
          }));
      
          return [...defaultOptions, ...campaignOptions];
        } else if (allocationMode === "2") {
            // 발신모드로 할당일 때 옵션 (변경 없음)
            return [
                { value: "0", label: "회선사용안함" },
                { value: "2147483647", label: "발신방법 모두사용" },
                { value: "1", label: "Power Mode" },
                { value: "2", label: "Progressive Mode" },
                { value: "3", label: "Predictive Mode" },
                { value: "5", label: "System Preview" }
            ];
        } else if (allocationMode === "3") {
            // 채널그룹으로 할당일 때 옵션 (변경 없음)
            return [
                { value: "0", label: "회선사용안함" },
                { value: "2147483647", label: "모든 그룹아이디 사용" },
                ...channelGroupList.map(group => ({
                    value: group.group_id.toString(),
                    label: `ID[${group.group_id}] : ${group.group_name}`
                }))
            ];
        }
        return [];
    };
    

    // 장비 목록용 rowClass 함수
    const getEquipmentRowClass = (row: EquipmentRow) => {
        return selectedDevice?.device_id === row.device_id ? 'bg-[#FFFAEE]' : '';
    };
    
    // 채널 목록용 rowClass 함수
    const getChannelRowClass = (row: ChannelRow) => {
        return selectedChannel?.channelNumber === row.channelNumber ? 'bg-[#FFFAEE]' : '';
    };

    // 장비 목록에서 선택된 장비가 변경될 때마다 채널 목록 업데이트
    useEffect(() => {
        if (selectedDevice) {
            setEquipmentNumber(selectedDevice.device_id);
            setEquipmentName(selectedDevice.device_name);
            setRefreshCycle(selectedDevice.channel_count.toString());
            setMonitoringType(selectedDevice.usage === "사용" ? "oneTime" : "periodic");
            setIsEditable(true);
            
            // 수정: channelList가 비어있지 않은지 확인
            if (channelList && Array.isArray(channelList)) {
                const selectedDeviceChannels = channelList.find(
                    channel => channel && channel.device_id && channel.device_id.toString() === selectedDevice.device_id
                );
    
                if (selectedDeviceChannels) {
                    const channels: ChannelRow[] = selectedDeviceChannels.channel_assign
                        .map((assignValue, index) => ({
                            channelNumber: index,
                            channelName: `Channel No.${index}`,
                            mode : assignValue.toString(),
                            // mode: getChannelMode(assignValue, selectedDeviceChannels.assign_kind),
                            assignValue: assignValue
                        }));
                        
                    setFilteredChannels(channels);
                    setAllocationMode(selectedDeviceChannels.assign_kind.toString());
                    
                    // 이전에 선택된 채널 번호 확인
                    const prevChannelNumber = selectedChannel?.channelNumber;
                    if (prevChannelNumber !== undefined) {
                        const existingChannel = channels.find(c => c.channelNumber === prevChannelNumber);
                        if (existingChannel) {
                            setSelectedChannel(existingChannel);
                            setAllocationOutboundMode(existingChannel.assignValue.toString());
                            return;
                        }
                    }
    
                    // 첫 번째 채널 선택
                    if (channels.length > 0) {
                        setSelectedChannel(channels[0]);
                        setAllocationOutboundMode(channels[0].assignValue.toString());
                    } else {
                        setSelectedChannel(null);
                        setAllocationOutboundMode("");
                    }
                } else {
                    setFilteredChannels([]);
                    setSelectedChannel(null);
                    setAllocationMode("");
                    setAllocationOutboundMode("");
                }
            } else {
                setFilteredChannels([]);
                setSelectedChannel(null);
                setAllocationMode("");
                setAllocationOutboundMode("");
            }

            setUpdatedChannelAssign([]); // 수정된 데이터 초기화
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDevice, channelList]);

    // 채널 선택 시 상세 정보 업데이트
    useEffect(() => {
        // console.log("campaigns", campaigns);
        if (selectedChannel) {
            setAllocationOutboundMode(selectedChannel.assignValue.toString());
        }
    }, [selectedChannel]);

    
    // 장비 할당모드 변경시 채널목록 초기화
    useEffect(() => {
        if (selectedDevice && channelList) {
          const deviceChannels = channelList.find(
            (channel) => channel.device_id.toString() === selectedDevice.device_id
          );

        //   console.log("장비 할당모드 변경시 deviceChannels", deviceChannels);
        //   console.log("장비 할당모드 변경시 allocationMode", allocationMode);
      
          if (deviceChannels && deviceChannels.assign_kind !== parseInt(allocationMode)) {
            // 장비의 할당모드와 다른걸 선택했을경우에는 기존 채널정보를 초기화
            const currentAssignKind = parseInt(allocationMode);

            const channels: ChannelRow[] = deviceChannels.channel_assign.map((assignValue, index) => ({
                channelNumber: index,
                channelName: `Channel No.${index}`,
                mode: getChannelMode(assignValue, currentAssignKind),
                assignValue: assignValue,
            }));
        
            setFilteredChannels(channels);

            // 수정된 데이터 초기화
            setUpdatedChannelAssign([]);


          } else if( deviceChannels){
            // 장비의 할당모드와 같은걸 선택했다면 기존 장비의 assignValue 사용
            const channels: ChannelRow[] = deviceChannels.channel_assign.map((assignValue, index) => ({
                channelNumber: index,
                channelName: `Channel No.${index}`,
                mode: assignValue.toString(),
                assignValue: assignValue,
            }));
        
            setFilteredChannels(channels);

            // 수정된 데이터 초기화
            setUpdatedChannelAssign([]);

          }
        }
    }, [allocationMode]);


    

    return (
        <div className="space-y-5">
            <div className="flex gap-5 space-y-1">
                <div className="w-1/2 flex-1 flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <TitleWrap title="장비 목록" totalCount={dialingDeviceList?.length || 0} />
                        <div className="grid-custom-wrap h-[300px]">
                            <DataGrid<EquipmentRow>
                                columns={equipmentColumns}
                                rows={equipmentRows}
                                className="grid-custom cursor-pointer"
                                rowKeyGetter={(row) => row.device_id}
                                onCellClick={handleEquipmentCellClick}
                                selectedRows={selectedDevice ? new Set([selectedDevice.device_id]) : new Set()}
                                rowHeight={30}
                                headerRowHeight={30}
                                rowClass={getEquipmentRowClass}
                                enableVirtualization={false}
                            />
                        </div>
                    </div>
                    
                    {/* 장비 상세내역 섹션 */}
                    <div className="flex flex-col gap-2">
                        <TitleWrap
                            title="장비 상세 내역"
                            buttons={[
                                { 
                                    label: "신규", 
                                    onClick: handleNewEquipment
                                },
                                { 
                                    label: "저장", 
                                    onClick: handleSaveEquipment
                                },{ 
                                    label: "삭제", 
                                    onClick: handleDeleteEquipment
                                },
                            ]}
                        />
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1">
                                <Label className="w-[5.6rem] min-w-[5.6rem]">장비 번호</Label>
                                <CustomInput 
                                    type="text"
                                    value={equipmentNumber}
                                    onChange={(e) => setEquipmentNumber(e.target.value)}
                                    disabled={true}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <Label className="w-[5.6rem] min-w-[5.6rem]">채널 수</Label>
                                <CustomInput 
                                    type="number" 
                                    value={refreshCycle}
                                    onChange={(e) => setRefreshCycle(e.target.value)}
                                    disabled={!isEditable || selectedDevice !== null}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <Label className="w-[5.6rem] min-w-[5.6rem]">장비 이름</Label>
                                <CustomInput 
                                    type="text"
                                    value={equipmentName}
                                    onChange={(e) => setEquipmentName(e.target.value)}
                                    disabled={!isEditable}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="w-1/2 flex-1 flex flex-col gap-5">
                    {/* 채널목록 섹션 */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                            <Label className="w-[5.6rem] min-w-[5.6rem]">장비 할당 모드</Label>
                            <Select 
                                value={allocationMode} 
                                onValueChange={setAllocationMode}
                                disabled={!selectedDevice}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="할당 모드 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1. 캠페인으로 할당</SelectItem>
                                    <SelectItem value="2">2. 발신모드로 할당</SelectItem>
                                    <SelectItem value="3">3. 채널 그룹으로 할당</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <TitleWrap title="채널 목록" totalCount={filteredChannels?.length || 0} />
                        <div className="grid-custom-wrap h-[300px]">
                        <DataGrid<ChannelRow>
                            columns={channelColumns}
                            rows={filteredChannels} // filteredChannels를 rows로 전달
                            className="grid-custom cursor-pointer"
                            onCellClick={handleChannelCellClick}
                            selectedRows={
                                selectedChannel ? new Set([selectedChannel.channelNumber.toString()]) : new Set()
                            }
                            rowKeyGetter={(row) => row.channelNumber.toString()}
                            rowHeight={30}
                            headerRowHeight={30}
                            rowClass={getChannelRowClass}
                            />
                        </div>
                    </div>
                    
                    {/* 채널 상세내역 섹션 */}
                    <div className="flex flex-col gap-2">
                        {/* <TitleWrap
                            title="채널 상세내역"
                            buttons={[
                                { 
                                    label: "적용", 
                                    onClick: handleChannelEdit,
                                    disabled: !selectedDevice || !selectedChannel 
                                },
                            ]}
                        /> */}
                        <div className="flex flex-col gap-2">
                            {/* <div className="flex items-center gap-1">
                                <Label className="w-[5.6rem] min-w-[5.6rem]">할당모드</Label>
                                <Select 
                                    value={allocationMode} 
                                    onValueChange={setAllocationMode}
                                    disabled={!selectedDevice}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="할당 모드 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1. 캠페인으로 할당</SelectItem>
                                        <SelectItem value="2">2. 발신모드로 할당</SelectItem>
                                        <SelectItem value="3">3. 채널 그룹으로 할당</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div> */}
                            {/* <div className="flex items-center gap-1">
                                <Label className="w-[5.6rem] min-w-[5.6rem]">할당발신모드</Label>
                                <Select 
                                    value={allocationOutboundMode} 
                                    onValueChange={setAllocationOutboundMode}
                                    disabled={!selectedChannel}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="할당발신모드 선택" />
                                    </SelectTrigger>
                                    <SelectContent style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {getAllocationOutboundModeOptions().map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div> */}
                            <TitleWrap
                            title=""
                            buttons={[
                                { 
                                    label: "적용", 
                                    onClick: handleChannelEdit,
                                    disabled: !selectedDevice || !selectedChannel 
                                },
                            ]}
                        />
                        </div>
                    </div>
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

export default SystemPreferences;