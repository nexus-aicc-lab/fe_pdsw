import CommonButton from "@/components/shared/CommonButton";
import DataGrid, { SelectColumn } from "react-data-grid";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore, useCampainManagerStore, useMainStore } from "@/store";
import CustomAlert from "@/components/shared/layout/CustomAlert";
import TitleWrap from "@/components/shared/TitleWrap";
import { useApiForChannelGroupCreate, useApiForChannelGroupDelete, useApiForChannelGroupList, useApiForChannelGroupUpdate } from "@/features/preferences/hooks/useApiForChannelGroup";
import { useApiForCampaignManagerUpdate } from "@/features/campaignManager/hooks/useApiForCampaignManagerUpdate";
import { UpdataCampaignInfo } from "@/components/common/common";
import ServerErrorCheck from "@/components/providers/ServerErrorCheck";





interface ChannelGroupRow {
    group_id : number; 
    group_name : string;
    campaign_count : number;
}

interface ChannelCampaignRow {
    campaign_id : number; 
    campaign_name : string;
}



const ChannelGroupSetting = () => {


    // ---------------------------------------------------- 알림창 컴포넌트 시작 ----------------------------------------------------
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

    // ---------------------------------------------------- 알림창 컴포넌트 끝 ----------------------------------------------------

    const router = useRouter();
    const { tenants, campaigns } = useMainStore();
    const { id : user_id  } = useAuthStore();
    
    // 신규로 추가된 행 상태관리
    const [newRows, setNewRows] = useState<Set<number>>(new Set());
    // 수정모드 상태관리
    const [isEditMode, setIsEditMode] = useState(false);

    // 채널 그룹리스트 행 
    const [channelGroupRow, setChannelGroupRow] = useState<ChannelGroupRow[]>([]);
    // 채널 그룹리스트 변경 행 상태관리
    const [changedRows, setChangedRows] = useState<Set<number>>(new Set());
    // 채널 그룹리스트 선택 행 상태관리
    const [selectedChannelRow, setSelectedChannelRow] = useState<number | null>(null);

    // 추가될 채널 그룹리스트 행 상태관리
    const [newChannelGroupRow, setNewChannelGroupRow] = useState<ChannelGroupRow | null>(null);

    // 캠페인 관리를 위한 store
    const { setChannelGroupList } = useCampainManagerStore();

    
    // 채널 그룹리스트 컬럼
    const channelColumns = [
        {
        key: "group_id",
        name: "그룹 아이디",
        editable: false,
        },
        {
            key: "group_name",
            name: "그룹 이름",
            editable: true,
            renderCell({ row }: { row: ChannelGroupRow }) {
                return (
                <>
                    <input
                    type="text"
                    value={row.group_name}
                    onChange={(e) => handleInputChange(row.group_id, 'group_name', e.target.value)}
                    className="w-full p-1 text-center"
                    />
                </>
                );
            }
        },
        {
        key: "campaign_count",
        name: "할당된 캠페인 수",
        editable: false,
        },
    ];

    // 채널그룹에 해당하는 캠페인 목록 행
    const [channelCampaignRow, setChannelCampaignRow] = useState<ChannelCampaignRow[]>([]);

    // 채널그룹에 할당된 캠페인 목록 컬럼
    const channelCampaignColumns = useMemo(() => [
        SelectColumn,
        { key: 'campaign_id', name: '캠페인 아이디' },
        { key: 'group_name', name: '그룹 이름' }
    ], []);

    // 채널그룹에 해당하는 캠페인 수 상태관리
    const [campaingCount, setCampaignCount] = useState<number>(0);

    // 채널그룹에 해당하는 캠페인 선택 행 상태관리(삭제를 위한 선택)
    const [checkCampaignRows, setCheckCampaignRows] = useState<Set<number>>(new Set());

    // ---------------------------------------------------- API 목록 시작 ----------------------------------------------------
    // 채널 그룹리스트 조회
    const { mutate: fetchChannelGroupList } = useApiForChannelGroupList({
        onSuccess: (data) => {

            if(data.result_code === 0) {

                const updatedRows = data.result_data.map((item: any) => ({
                    group_id: item.group_id,
                    group_name: item.group_name,
                    campaign_count: campaigns.filter((campaign) => campaign.channel_group_id === item.group_id).length,
                }));
            
                // 변경된 내용 데이터 그리드 반영
                setChannelGroupRow(updatedRows);

                // 채널 그룹리스트를 캠페인 관리 store에 저장
                setChannelGroupList(updatedRows);

                // 첫 번째 행 자동 선택
                if (selectedChannelRow === null && updatedRows.length > 0) {
                    const firstRow = updatedRows[0];
                    setSelectedChannelRow(0); // 첫 번째 행의 인덱스 설정
                    const filteredCampaigns = campaigns
                        .filter((campaign) => campaign.channel_group_id === firstRow.group_id)
                        .map((campaign) => ({
                        campaign_id: campaign.campaign_id,
                        campaign_name: campaign.campaign_name,
                        group_name: firstRow.group_name,
                        }));
                    setChannelCampaignRow(filteredCampaigns);
                    setCampaignCount(filteredCampaigns.length);
                }
                // 선택된 행이 있을 경우 유지
                if(selectedChannelRow !== null){
                    const selectedRow = updatedRows[selectedChannelRow];
                    const filteredCampaigns = campaigns
                        .filter((campaign) => campaign.channel_group_id === selectedRow.group_id)
                        .map((campaign) => ({
                        campaign_id: campaign.campaign_id,
                        campaign_name: campaign.campaign_name,
                        group_name: selectedRow.group_name,
                        }));
                    setChannelCampaignRow(filteredCampaigns);
                    setCampaignCount(filteredCampaigns.length);
                }

                // 신규로 추가된 행이 있는 경우
                if (newChannelGroupRow) {
                    const newRowIndex = updatedRows.findIndex(row => row.group_id === newChannelGroupRow.group_id);
                    if (newRowIndex !== -1) {
                        setSelectedChannelRow(newRowIndex); // 신규 행을 선택 상태로 설정
                    }
                }

                setNewChannelGroupRow(null); // 신규 행 상태 초기화
            }
            
            
        }, 
        onError: (data) => {
            console.log('채널 그룹 조회 실패:', data);
        
            ServerErrorCheck('채널 그룹 조회', data.message);
        }
    });

    // 채널 그룹리스트 추가
    const { mutate: createChannelGroup } = useApiForChannelGroupCreate({
        onSuccess: (data) => {
            fetchChannelGroupList();
        }, 
        onError: (data) => {
            ServerErrorCheck('채널 그룹 추가', data.message);
        }
    });

    // 채널 그룹리스트 수정
    const { mutate: updateChannelGroup } = useApiForChannelGroupUpdate({
        onSuccess: (data) => {
            
            fetchChannelGroupList();
        }, 
        onError: (data) => {
            ServerErrorCheck('채널 그룹 수정', data.message);
        }
    });

    // 채널 그룹리스트 삭제
    const { mutate: deleteChannelGroupList } = useApiForChannelGroupDelete({
        onSuccess: (data) => {
            if(data.result_code === 0) {
                showAlert('채널 그룹이 삭제되었습니다.');
            }
            setSelectedChannelRow(null); // 삭제 후 선택된 행 초기화
            fetchChannelGroupList();
        }, 
        onError: (data) => {
            ServerErrorCheck('채널 그룹 삭제', data.message);
        }
    });


    // 캠페인 채널그룹 할당 해제 (캠페인 마스터 수정)
    const { mutate: fetchCampaignManagerUpdate } = useApiForCampaignManagerUpdate({
        onSuccess: (data,variables) => {
            
        },
        onError: (data) => {
            ServerErrorCheck('캠페인 채널그룹 할당 해제', data.message);
        }
    });


    // ---------------------------------------------------- API 목록 끝 ----------------------------------------------------

    // ---------------------------------------------------- 함수 목록 시작 ----------------------------------------------------

    // 채널 그룹리스트 행 클릭 시 캠페인 목록 필터링
    const handleRowClick = (args: { row: ChannelGroupRow }) => {
        const { row } = args;
        const row_idx = channelGroupRow.findIndex((r) => r.group_id === row.group_id);
        setSelectedChannelRow(row_idx);

        const selectedGroupId = row.group_id;

        const filteredCampaigns = campaigns
        .filter((campaign) => campaign.channel_group_id === selectedGroupId)
        .map((campaign) => ({
            campaign_id: campaign.campaign_id,
            campaign_name: campaign.campaign_name,
            group_name: row.group_name,
        }));
        setCampaignCount(filteredCampaigns.length);
        setChannelCampaignRow(filteredCampaigns);
    };

    // 채널 그룹리스트 행 선택 시 배경색 변경
    const getRowChannelClass = (row: ChannelGroupRow) => { 
        return selectedChannelRow === channelGroupRow.findIndex((r) => r.group_id === row.group_id) ? 'bg-[#FFFAEE]' : '';
    }

    // 채널 그룹리스트 수정 시 입력값 변경 핸들러
    const handleInputChange = (id: number, field: string, value: string) => {
        setChannelGroupRow((prevRows) => {
          const updatedRows = prevRows.map((row) =>
            row.group_id === id ? { ...row, [field]: value } : row
          );
      
          // 변경된 행 ID를 추적
          setChangedRows((prev) => new Set(prev).add(id));

          // 신규 행이 아닌 경우에만 수정 모드 활성화
          if (!newRows.has(id)) {
            setIsEditMode(true);
          }
          
        //   console.log("Changed Rows:", Array.from(changedRows)); // 변경된 행 추적
        
          return updatedRows;
        });
    };

    // 채널 그룹 ID 자동 생성 함수
    const generateChannelGroupId = () => {
        // 채널 그룹이 없는 경우 기본값으로 1 반환
        if (channelGroupRow.length === 0) return "1";

      
        // 모든 채널 그룹 ID를 숫자로 변환 (숫자가 아닌 경우 필터링)
        const numericGroupIds = channelGroupRow
          .map((row) => row.group_id) // group_id를 가져옴
          .filter((id) => /^\d+$/.test(id.toString())) // 순수 숫자 형식만 필터링
          .map((id) => parseInt(id.toString(), 10))
          .sort((a, b) => a - b); // 오름차순 정렬
          
      
        // 비어 있는(존재하지 않는) 최소값 찾기
        for (let i = 0; i < numericGroupIds.length; i++) {
          if (numericGroupIds[i] !== i + 1) {
            return String(i + 1); // 비어 있는 ID 반환
          }
        }
      
        // 모든 ID가 연속적이라면 마지막 ID + 1 반환
        return String(numericGroupIds[numericGroupIds.length - 1] + 1);
    };

    // 문자 20바이트 검사하는 함수
    const getByteLength = (str: string) : number => {
        return new TextEncoder().encode(str).length;
    }

    // 채널 그룹 신규 추가
    const handleNew = () => {

        const newGroupId = parseInt(generateChannelGroupId());
        
        // 신규 행이 이미 존재하는 경우 channelGroupRow에서 비어있는 최소값이나 비어있지않으면 최대값
        const newGroup = {
            group_id: newGroupId,
            group_name: "",
            campaign_count: 0,
        };
        
        setChannelGroupRow((prev) => [...prev, newGroup]);
        setNewRows((prev) => new Set(prev).add(newGroup.group_id)); // 신규 행 추적
        setSelectedChannelRow(channelGroupRow.length); // 새로 추가된 행을 선택 상태로 설정
        setCampaignCount(0); // 캠페인 수 초기화
        setChannelCampaignRow([]); // 캠페인 목록 초기화
    };


    // 채널 그룹 삭제
    const handleDelete = () => {
        if (selectedChannelRow === null) {
            showAlert('삭제할 채널 그룹을 선택해 주세요.');
            return;
        }
        // 선택된 삭제예정인 행 데이터 변수 저장
        const groupToDelete = channelGroupRow[selectedChannelRow];

        // 신규로 추가된 행인 경우 삭제
        if (newRows.has(groupToDelete.group_id)) {
            setChannelGroupRow((prev) => prev.filter((row) => row.group_id !== groupToDelete.group_id));
            setNewRows((prev) => {
            const updatedNewRows = new Set(prev);
            updatedNewRows.delete(groupToDelete.group_id); // 신규 행 추적에서 제거
            return updatedNewRows;
            });
            setSelectedChannelRow(null); // 선택된 행 초기화
            return;
        }

        if(groupToDelete.campaign_count > 0) {
            showAlert('해당 채널 그룹에 캠페인이 할당되어 있습니다. \n캠페인 해제 후 삭제해 주세요.');
            return;
        }
        
        showConfirm(`선택한 [${groupToDelete.group_id}]${groupToDelete.group_name} 채널 그룹을 삭제하시겠습니까?`, () => { deleteChannelGroupList(groupToDelete); });
        
        
    };

    

    // 채널 그룹 저장
    const handleSave = () => {
        if (channelGroupRow.length === 0) {
            showAlert('저장할 채널 그룹이 없습니다.');
            return;
        }
        // 신규 행 저장
        const newRowsToSave = channelGroupRow.filter((row) => newRows.has(row.group_id));

        if (newRowsToSave.length > 0) {
            for (const row of newRowsToSave) {
            if (row.group_name === "") {
                showAlert("채널 그룹 이름을 입력해 주세요.");
                return;
            }
            if (getByteLength(row.group_name) > 20) {
                showAlert("채널 그룹 이름은 한글로 6자 이내, \n영문으로 20자 이내로 입력해주세요.");
                return;
            }
            createChannelGroup(row); // 신규 행 저장
            }
            setNewRows(new Set()); // 저장 후 신규 행 초기화
        }

        if (isEditMode) {
            const updatedRows = channelGroupRow.filter((row) =>
              changedRows.has(row.group_id)
            );

            if(updatedRows.map((row) => row.group_name).includes("")) {
                showAlert('채널 그룹 이름을 입력해 주세요.');
                return;
            }
            if(updatedRows.map((row) => row.group_name).some((name) => getByteLength(name) > 20)) {
                showAlert('채널 그룹 이름은 한글로 6자 이내, \n영문으로 20자 이내로 입력해주세요.');
                return;
            }
        
            // console.log("Updated Rows to Save:", updatedRows); // 저장할 변경된 행 출력

            if(updatedRows.length > 0) {
                updatedRows.forEach((row) => {
                    updateChannelGroup(row);
                });
            }
        
            // API 호출 등 저장 로직 추가
            setIsEditMode(false);
            setChangedRows(new Set()); // 저장 후 변경된 행 초기화
        }

        showAlert('채널 그룹이 저장되었습니다.');
        
        setNewChannelGroupRow(newRowsToSave[0]);
        
    }

    // 현재시간 양식 구하기.
    const getCurrentFormattedTime = () => {
        const now = new Date();
    
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 0부터 시작하므로 +1
        const day = String(now.getDate()).padStart(2, '0');
    
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
    
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // 채널 그룹에 할당된 캠페인 삭제
    const handleChannelGroupCampaignDelete = () => {
        if (checkCampaignRows.size === 0) {
            showAlert('할당 해제할 캠페인을 선택해 주세요.');
            return;
        }
        const selectedCampaigns = Array.from(checkCampaignRows).filter((campaignId) => channelCampaignRow.some((row) => row.campaign_id === campaignId));
        
        if(selectedCampaigns.length > 0) {

            selectedCampaigns.forEach((campaignId) => {
                // console.log('선택된 캠페인 ID : ', campaignId);

                const updatedCampaignsInfo = campaigns.filter((campaign) => campaign.campaign_id === campaignId)[0];
                // console.log('updatedCampaignsInfo : ', updatedCampaignsInfo);
                
                const currentCampaignInfo = UpdataCampaignInfo(campaigns, campaignId, updatedCampaignsInfo.start_flag);
                // console.log('currentCampaignInfo is this : ', currentCampaignInfo);


                const todayTime = getCurrentFormattedTime();
                // 캠페인 해제 API 호출
                fetchCampaignManagerUpdate(
                    {
                        ...currentCampaignInfo
                        , channel_group_id: 0 // 채널 그룹 해제
                        , update_user: user_id
                        , update_ip: Cookies.get('userHost')+''
                        , update_time: todayTime
                    }
                );
            });

        }
        // API 호출 후 성공 시
        showAlert('선택된 캠페인이 채널 그룹에서 해제되었습니다.');
        setCheckCampaignRows(new Set()); // 선택된 캠페인 초기화
        setChannelCampaignRow((prev) => prev.filter((row) => !checkCampaignRows.has(row.campaign_id)));

    }

    // 캠페인 목록 행 선택 시 체크상태 변경
    const handleRowSelection = (row: ChannelCampaignRow) => {
        setCheckCampaignRows((prev) => {
          const updatedRows = new Set(prev);
          if (updatedRows.has(row.campaign_id)) {
            updatedRows.delete(row.campaign_id); // 이미 선택된 경우 선택 해제
          } else {
            updatedRows.add(row.campaign_id); // 선택되지 않은 경우 선택
          }
          return updatedRows;
        });
    };



    // ---------------------------------------------------- 함수 목록 끝 ----------------------------------------------------

    

    useEffect( ()=> {
        fetchChannelGroupList();
    }, [campaigns]);


    // 키보드 이벤트 핸들러 추가
    useEffect(() => {

        const handleKeyDown = (event: KeyboardEvent) => {
            if (alertState.isOpen) {          
                // Enter 키: 확인 버튼 클릭
                if (event.key === 'Enter') {
                    event.preventDefault();
                    alertState.onConfirm();
                    return;
                }          
                // Esc 키: 취소 버튼 클릭 (type이 '1'인 경우에만)
                if (event.key === 'Escape' && alertState.type === '1') {
                    event.preventDefault();
                    alertState.onCancel();
                    return;
                }            
                // 경고창이 열려 있을 때는 다른 단축키를 처리하지 않음
                return;
            }              
            // Delete: 삭제
            if (event.key === 'Delete') {
                event.preventDefault();
                handleChannelGroupCampaignDelete();
            }
            
            // 아래 화살표: 신규
            if (event.key === 'ArrowDown' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                // 입력 필드에서는 아래 화살표가 정상 작동하도록 예외 처리
                if (
                    document.activeElement?.tagName !== 'INPUT' && 
                    document.activeElement?.tagName !== 'SELECT' &&
                    document.activeElement?.tagName !== 'TEXTAREA'
                ) {
                    // 이벤트의 기본 동작과 전파를 모두 차단
                    event.preventDefault();
                    event.stopPropagation();
                    handleNew();
                }
            }
        };

        // 캡처 단계에서 이벤트 리스너 등록 (이벤트 버블링보다 먼저 실행됨)
        window.addEventListener('keydown', handleKeyDown, true);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
        };

    }, [alertState, handleDelete, handleNew, handleSave]);

    

    
    return (

        <div className="flex gap-3">
            <div className="w-full">
                
                <div className="flex gap-3">
                    
                    <div>
                        <TitleWrap 
                        title="채널그룹" 
                        totalCount={channelGroupRow.length}
                        />
                        <div className="grid-custom-wrap h-[200px] w-[350px]">
                            <DataGrid
                                columns={channelColumns}
                                rows={channelGroupRow}
                                rowHeight={30}
                                rowKeyGetter={(row) => row.group_id}
                                onCellClick={(args) => handleRowClick(args)}
                                className="grid-custom"
                                rowClass={getRowChannelClass}
                            />
                        </div>

                        
                    </div>
                    
                    <div className="mt-[20px] text-sm">
                        <div className="flex justify-start gap-2 pt-4">
                            <CommonButton onClick={handleNew}>신규</CommonButton>
                            <CommonButton onClick={handleSave}>저장</CommonButton>
                            <CommonButton onClick={handleDelete}>삭제</CommonButton>
                        </div>
                        <div className="pt-4">
                            <ul className='space-y-1 notice-li'>
                                <li>• 채널그룹 아이디 추가 / 수정 / 삭제를 할 수 있습니다.</li>
                                <li>• 채널그룹 아이디 추가하시려면 그리드에서 키보드 ↓를 누르시던지 [신규] 버튼을 클릭해 주세요.</li>
                                <li>• 등록된 채널 그룹은 시스템설정 {'>'} 장비할당모드 {'>'} 할당 발신모드에서 사용 가능 합니다. </li>
                            </ul>
                        </div>
                        
                    </div>
                    
                </div>

                <div className="flex gap-3">
                    <div className="mt-[20px]">
                        <TitleWrap 
                            title="할당된 캠페인 목록" 
                            totalCount={campaingCount}
                            buttons={[
                                { 
                                    label: "선택 캠페인 채널그룹 해제",
                                    onClick: handleChannelGroupCampaignDelete
                                },
                            ]}
                            className="gap-5"
                        />
                        <div className="grid-custom-wrap h-[200px] w-[350px]">
                        <DataGrid
                            columns={channelCampaignColumns}
                            rows={channelCampaignRow}
                            className="grid-custom"
                            rowKeyGetter={(row) => row.campaign_id}
                            rowHeight={30}
                            headerRowHeight={30}
                            enableVirtualization={false}
                            selectedRows={checkCampaignRows}
                            onSelectedRowsChange={setCheckCampaignRows}
                            onCellClick={({ row }) => handleRowSelection(row)}
                        />
                            
                        </div>
                        
                    </div>

                    <div className="mt-[20px] text-sm pt-8">
                        <ul className='space-y-1 notice-li'>
                            <li>• 그룹해제 = 선택 박스 체크 후 [선택 캠페인 채널그룹 해제] 버튼을 클릭하시던지 
                                그리드 선택 후 키보드 Delete를 눌러주세요.</li>
                            <li>• 등록된 채널 그룹은 캠페인관리 {'>'} 발신방법 {'>'} 채널 그룹 옵션에서 사용 가능 합니다. </li>
                        </ul>
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

export default ChannelGroupSetting;