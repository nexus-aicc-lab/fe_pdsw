"use client";

import React, { useEffect, useState } from 'react';
import { useTabStore } from '@/store/tabStore';
import CommonButton from '@/components/shared/CommonButton';
import { useApiForCampaignManagerDelete } from '@/features/campaignManager/hooks/useApiForCampaignManagerDelete';
import { useApiForCampaignScheduleDelete } from '@/features/campaignManager/hooks/useApiForCampaignScheduleDelete';
import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
import { useCampainManagerStore } from '@/store';
import { CampaignSkillUpdateRequest, MainDataResponse } from '@/features/auth/types/mainIndex';
import { useApiForCampaignSkillUpdate } from '@/features/campaignManager/hooks/useApiForCampaignSkillUpdate';
import { fetchCallingNumberDelete } from '@/features/campaignManager/api/mainCallingNumberDelete';
import { CallingNumberListDataResponse, CampaignInfoDeleteRequest, CampaignInfoUpdateRequest } from '@/features/campaignManager/types/campaignManagerIndex';
import { fetchReservedCallDelete } from '@/features/campaignManager/api/mainReservedCallDelete';
import { toast } from 'react-toastify';
import { useSideMenuCampaignGroupTabStore } from '@/store/storeForSideMenuCampaignGroupTab';
import Cookies from 'js-cookie'
import { CampaignInfo } from '@/app/main/comp/CreateCampaignFormPanel/variables/variablesForCreateCampaignForm';


interface Props {
    campaignId?: string;
    campaignName?: string;
}

const campaignInfoDelete: CampaignInfoDeleteRequest = {
    campaign_id: 0,
    tenant_id: 0,
    delete_dial_list: 1
};

const CampaignManagerInfo: CampaignInfoUpdateRequest = {
    campaign_id: 0,
    campaign_name: '',
    campaign_desc: '',
    site_code: 0,
    service_code: 0,
    start_flag: 0,
    end_flag: 0,
    dial_mode: 0,
    callback_kind: 0,
    delete_flag: 0,
    list_count: 0,
    list_redial_query: '',
    next_campaign: 0,
    token_id: 0,
    phone_order: '',
    phone_dial_try1: 0,
    phone_dial_try2: 0,
    phone_dial_try3: 0,
    phone_dial_try4: 0,
    phone_dial_try5: 0,
    dial_try_interval: 0,
    trunk_access_code: '',
    DDD_code: '',
    power_divert_queue: '',
    max_ring: 0,
    detect_mode: 0,
    auto_dial_interval: 0,
    creation_user: '',
    creation_time: '',
    creation_ip: '',
    update_user: '',
    update_time: '',
    update_ip: '',
    dial_phone_id: 0,
    tenant_id: 0,
    alarm_answer_count: 0,
    dial_speed: 0,
    parent_campaign: 0,
    overdial_abandon_time: 0,
    list_alarm_count: 0,
    supervisor_phone: '',
    reuse_count: 0,
    use_counsel_result: 0,
    use_list_alarm: 0,
    redial_strategy1: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
    redial_strategy2: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
    redial_strategy3: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
    redial_strategy4: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
    redial_strategy5: "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
    dial_mode_option: 0,
    user_option: '',
    customer_char_id: 1,
    counsel_script_id: 1,
    announcement_id: 1,
    campaign_level: 0,
    outbound_sequence: '',
    channel_group_id: 0,
}

// export const CampaignInfo: MainDataResponse = {
//     campaign_id: 0,
//     campaign_name: '',
//     campaign_desc: '',
//     site_code: 0,
//     service_code: 0,
//     start_flag: 0,
//     end_flag: 0,
//     dial_mode: 0,
//     callback_kind: 0,
//     delete_flag: 0,
//     list_count: 0,
//     list_redial_query: '',
//     next_campaign: 0,
//     token_id: 0,
//     phone_order: '',
//     phone_dial_try: [],
//     dial_try_interval: 0,
//     trunk_access_code: '',
//     DDD_code: '',
//     power_divert_queue: 0,
//     max_ring: 0,
//     detect_mode: 0,
//     auto_dial_interval: 0,
//     creation_user: '',
//     creation_time: '',
//     creation_ip: '',
//     update_user: '',
//     update_time: '',
//     update_ip: '',
//     dial_phone_id: 0,
//     tenant_id: 0,
//     alarm_answer_count: 0,
//     dial_speed: 0,
//     parent_campaign: 0,
//     overdial_abandon_time: 0,
//     list_alarm_count: 0,
//     supervisor_phone: '',
//     reuse_count: 0,
//     use_counsel_result: 0,
//     use_list_alarm: 0,
//     redial_strategy: [
//         "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//         "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//         "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//         "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0",
//         "7:2.1.0\/3.1.0\/4.1.0\/5.1.0\/6.1.0\/10.1.0\/99.1.0\/2501.1.0\/2502.1.0\/2503.1.0\/2504.1.0\/2505.1.0\/2506.1.0"
//     ],
//     dial_mode_option: 0,
//     user_option: '',
// }

const CampaignSkillInfo: CampaignSkillUpdateRequest = {
    campaign_id: 0,
    skill_id: [],
}

const CallingNumberInfo: CallingNumberListDataResponse = {
    campaign_id: 0,
    calling_number: ''
}

const CampaignDeletePanel = ({ campaignId, campaignName }: Props) => {
    // 탭 스토어에서 필요한 함수 가져오기
    const { activeTabKey, closeAllTabs, rows } = useTabStore();
    const { callingNumbers, campaignSkills, schedules, setCampaignSkills, setSchedules, setCallingNumbers } = useCampainManagerStore();
    const [campaignSkillChangeYn, setCampaignSkillChangeYn] = useState<boolean>(false); // 캠페인스킬 변경여부
    const [campaignInfoChangeYn, setCampaignInfoChangeYn] = useState<boolean>(true); // 캠페인정보 변경여부
    const [tempCampaignInfo, setTempCampaignsInfo] = useState<MainDataResponse>(CampaignInfo);
    const [tempCampaignSkills, setTempCampaignSkills] = useState<CampaignSkillUpdateRequest>(CampaignSkillInfo);
    const [tempCallingNumberInfo, setTempCallingNumberInfo] = useState<CallingNumberListDataResponse>(CallingNumberInfo);
    const [tempCampaignManagerInfo, setTempCampaignManagerInfo] = useState<CampaignInfoUpdateRequest>(CampaignManagerInfo);
    const _tenantId = Number(Cookies.get('tenant_id'));

    const { updateCampaignStatus, refetchTreeDataForCampaignGroupTab } = useSideMenuCampaignGroupTabStore();


    //캠페인 스킬 수정 api 호출
    const { mutate: fetchCampaignSkillUpdate } = useApiForCampaignSkillUpdate({
        onSuccess: (data) => {
            // fetchCampaignSkills({
            //   session_key: '',
            //   tenant_id: 0,
            // });      
            setCampaignSkillChangeYn(false);
        }
    });

    //캠페인 스킬 조회 api 호출
    const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
        onSuccess: (data) => {
            setCampaignSkills(data.result_data);
            setCampaignSkillChangeYn(false);
        }
    });

    const { mutate: fetchCampaignScheduleDelete } = useApiForCampaignScheduleDelete({
        onSuccess: (data) => {
            // 3)스킬편집 -> 캠페인 소속 스킬 할당 해제
            const tempSkill = campaignSkills.filter((skill) => skill.campaign_id === tempCampaignInfo.campaign_id)
                .map((data) => data.skill_id)
                .join(',');
            if (tempSkill !== '') {
                fetchCampaignSkillUpdate({
                    ...tempCampaignSkills
                    , skill_id: []
                });
            }

            // 4)캠페인별 발신번호 설정 삭제
            const tempCallNumber = callingNumbers.filter((callingNumber) => callingNumber.campaign_id === tempCampaignInfo.campaign_id)
                .map((data) => data.calling_number)
                .join(',');
            if (tempCallNumber !== '') {
                fetchCallingNumberDelete(tempCallingNumberInfo);
            }

            // 5)캠페인별 문자할당 삭제 : 기능 사용시 API 생성 예정
            // 6)채널 할당 - 캠페인 모드시, 캠페인이 할당되면 Assign 해제 -> 회선사용 안함으로 변경 : /pds/channel-group - 제외
            // 7)예약콜제한설정 삭제 
            fetchReservedCallDelete({
                ...campaignInfoDelete
                , campaign_id: tempCampaignManagerInfo.campaign_id
                , tenant_id: tempCampaignManagerInfo.tenant_id
            });

        }
    });

    const { mutate: fetchCampaignManagerDelete } = useApiForCampaignManagerDelete({
        onSuccess: (data) => {
            // 2)캠페인 스케줄 삭제
            fetchCampaignScheduleDelete({
                ...campaignInfoDelete
                , campaign_id: tempCampaignManagerInfo.campaign_id
                , tenant_id: tempCampaignManagerInfo.tenant_id
            });
            // removeTab(Number(activeTabId),activeTabKey+'');
        }
    });

    // 캠페인 삭제 API 훅 사용
    const { mutate: deleteCampaign } = useApiForCampaignManagerDelete({
        onSuccess: (data, variables, context) => {
            // console.log('캠페인 삭제 성공:', data);
            // toast.success('캠페인이 삭제되었습니다.');

            fetchCampaignScheduleDelete({
                ...campaignInfoDelete
                , campaign_id: tempCampaignManagerInfo.campaign_id
                , tenant_id: tempCampaignManagerInfo.tenant_id
            });

            handleCloseTab();
        },
        onError: (error, variables, context) => {
            // console.error('캠페인 삭제 실패:', error);
            toast.error(error.message || '캠페인 삭제에 실패했습니다.');
            // 에러 메시지 처리 추가 가능
        }
    });

    // 삭제 처리 함수
    const handleDelete = () => {
        if (!campaignId) return;
        // 단일 API 요청으로 캠페인 삭제 호출
        deleteCampaign({
            campaign_id: Number(campaignId),
            tenant_id: _tenantId,
            delete_dial_list: 1
        });

        refetchTreeDataForCampaignGroupTab();

    };

    // 현재 탭이 포함된 행과 섹션 ID 찾기
    const findCurrentTabLocation = () => {
        for (const row of rows) {
            for (const section of row.sections) {
                if (section.tabs.some(tab => tab.uniqueKey === activeTabKey)) {
                    return { rowId: row.id, sectionId: section.id };
                }
            }
        }
        return { rowId: 'row-1', sectionId: 'default' }; // 기본값
    };

    // 탭 닫기 함수
    const handleCloseTab = () => {
        const { rowId, sectionId } = findCurrentTabLocation();
        // 상태 업데이트를 비동기적으로 처리
        setTimeout(() => {
            closeAllTabs(rowId, sectionId);
        }, 100);
    };

    // ESC 키 이벤트 처리
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleCloseTab();
            }
        };

        window.addEventListener('keydown', handleEscapeKey);
        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* 배경 오버레이 (클릭 시 모달 닫힘) */}
            <div
                className="absolute inset-0 bg-black/10"
                onClick={handleCloseTab}
            />

            {/* 모달 컨텐츠 */}
            <div className="bg-white rounded-md shadow-lg w-full max-w-sm relative z-10 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-[#5DC2BD] px-4 py-2">
                    <h2 className="text-base font-medium text-white">캠페인 삭제</h2>
                </div>

                {/* 내용 */}
                <div className="p-4">
                    <div className="text-center mb-4">
                        <p className="mb-4">
                            캠페인 아이디: {campaignId} <br />
                            캠페인 이름: {campaignName || ''} <br />
                            삭제된 캠페인은 복구가 불가능합니다. <br />
                            캠페인을 삭제하시겠습니까???????
                        </p>
                        <p className="text-sm text-gray-500">
                            이 작업은 되돌릴 수 없습니다.
                        </p>
                    </div>

                    <div className="flex justify-center gap-2 mt-6">
                        <CommonButton
                            variant="destructive"
                            onClick={handleDelete}
                            size="default"
                        >
                            삭제하기
                        </CommonButton>
                        <CommonButton
                            variant="outline"
                            onClick={handleCloseTab}
                            size="default"
                        >
                            취소
                        </CommonButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDeletePanel;
