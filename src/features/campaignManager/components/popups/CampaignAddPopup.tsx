import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

import { useQueryClient } from '@tanstack/react-query';
import { CampaignInfo, SkillInfo } from '@/widgets/sidebar2/api/type/typeForAddCampaignForCampaignGroup';

import ITableForSkillListWithCampaign from './ITableForSkillListWithCampaign';
import GroupCampaignList from './GroupCampaignList';
import TitleWrap from "@/components/shared/TitleWrap";
import { CommonButton } from "@/components/shared/CommonButton";
import { CustomInput } from "@/components/shared/CustomInput";
import CustomAlert from '@/components/shared/layout/CustomAlert';

import useApiForGetCampaignListForCampaignGroup from '@/shared/hooks/campaign/useApiForGetCampaignListForCampaignGroup';
import useApiForAddCampaignToSpecificCampaignGroup from '../../hooks/useApiForAddCampaignToSpecificCampaignGroup';
import useApiForRemoveCampaignFromCampaignGroup from '../../hooks/useApiForRemoveCampaignFromCampaignGroup';
import useApiForGetSkillsWithCampaigns from '@/shared/hooks/skill/useApiForGetSkillsWithCampaigns';
import { useTotalCampaignListForAddCampaignToCampaignGroup } from '@/shared/hooks/campaign/useTotalCampaignListForAddCampaignToCampaignGroup';
import { useTotalSkillListForAddCampaignToCampaignGroup } from '@/widgets/sidebar2/hooks/useTotalSkillListForAddCampaignToCampaignGroup';
import { useSideMenuCampaignGroupTabStore } from '@/store/storeForSideMenuCampaignGroupTab';

import { useCampainManagerStore } from '@/store/campainManagerStore';
import { useAuthStore } from '@/store/authStore';

interface SkillWithCampaigns {
  skillId: number;
  campaigns: { campaignId: number; tenantId: number }[];
}

interface Props {
  isOpen?: boolean;
  groupId: number;
  groupName?: string;
  onClose?: () => void;
  onSelect?: (selectedCampaigns: number[]) => void;
  tenantId: number;
}

const CampaignAddPopup: React.FC<Props> = ({
  isOpen = true,
  onClose,
  onSelect,
  groupId,
  groupName,
  tenantId
}) => {
  // ----------------------------
  //  State
  // ----------------------------
  const [skillsWithCampaigns, setSkillsWithCampaigns] = useState<SkillWithCampaigns[]>([]);
  const [expandedSkills, setExpandedSkills] = useState<number[]>([1]);
  const [selectedLeftCampaigns, setSelectedLeftCampaigns] = useState<string[]>([]);
  const [selectedRightCampaigns, setSelectedRightCampaigns] = useState<number[]>([]);
  const [campaignIdsForPopup, setCampaignIdsForPopup] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<React.ReactNode>('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [processingCampaigns, setProcessingCampaigns] = useState(false);
  const [removingCampaigns, setRemovingCampaigns] = useState(false);
  const [campaignLookup, setCampaignLookup] = useState<Record<number, CampaignInfo>>({});
  const [skillLookup, setSkillLookup] = useState<Record<number, SkillInfo>>({});
  const { refetchTreeDataForCampaignGroupTab } = useSideMenuCampaignGroupTabStore();

  const { setCampaignGroupManagerInit } = useCampainManagerStore();

  // ----------------------------
  //  Hooks
  // ----------------------------
  const tenant_id = useAuthStore(state => state.tenant_id);
  const queryClient = useQueryClient();

  // ----------------------------
  //  Query
  // ----------------------------
  const { data, isLoading, error } = useApiForGetSkillsWithCampaigns(tenantId, isOpen);

  const {
    data: campaignListData,
    isLoading: isLoadingCampaigns,
    error: campaignError
  } = useTotalCampaignListForAddCampaignToCampaignGroup(tenantId, isOpen);

  // console.log('캠페인 목록 데이터 for 캠페인 추가 팝업 for 캠페인 그룹:', campaignListData);

  const {
    data: skillListData,
    isLoading: isLoadingSkills,
    error: skillError
  } = useTotalSkillListForAddCampaignToCampaignGroup(tenantId, isOpen);

  // console.log('스킬 목록 데이터 for 캠페인 추가 팝업 for 캠페인 그룹:', skillListData);

  const {
    data: groupData,
    isLoading: isLoadingGroup,
    error: groupError
  } = useApiForGetCampaignListForCampaignGroup(groupId, undefined, undefined, isOpen);

  // ----------------------------
  //  Mutation
  // ----------------------------
  const { mutate: addCampaignToGroup, isPending: isAddingCampaign } =
    useApiForAddCampaignToSpecificCampaignGroup({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['campaignGroupSkills', groupId] });
      },
      onError: (error: Error) => {
        toast.error(`캠페인 추가 실패: ${error.message}`);
      }
    });

  const { mutate: removeCampaignFromGroup, isPending: isRemovingCampaign } =
    useApiForRemoveCampaignFromCampaignGroup({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['campaignGroupSkills', groupId] });
      },
      onError: (error: Error) => {
        toast.error(`캠페인 제거 실패: ${error.message}`);
      }
    });

  // ----------------------------
  //  Effects
  // ----------------------------
  useEffect(() => {
    if (campaignListData?.result_data) {
      const lookup: Record<number, CampaignInfo> = {};
      campaignListData.result_data.forEach(campaign => {
        lookup[campaign.campaign_id] = campaign;
      });
      setCampaignLookup(lookup);
    }
  }, [campaignListData]);

  useEffect(() => {
    if (skillListData?.result_data) {
      const lookup: Record<number, SkillInfo> = {};
      skillListData.result_data.forEach(skill => {
        lookup[skill.skill_id] = skill;
      });
      setSkillLookup(lookup);
    }
  }, [skillListData]);



  useEffect(() => {
    // 데이터 로그 추가
    
    if (data?.result_data) {
      const skillMap: Record<number, SkillWithCampaigns> = {};

      // 모든 스킬 ID를 먼저 초기화
      if (skillListData?.result_data) {
        skillListData.result_data.forEach(skill => {
          skillMap[skill.skill_id] = {
            skillId: skill.skill_id,
            campaigns: []
          };
        });
      }

      // 캠페인-스킬 매핑 처리
      data.result_data.forEach(campaign => {
        // skill_id가 배열이거나 단일 값인 경우 모두 처리
        const skillIds = Array.isArray(campaign.skill_id)
          ? campaign.skill_id
          : (campaign.skill_id ? [campaign.skill_id] : []);

        skillIds.forEach(skillId => {
          if (!skillMap[skillId]) {
            skillMap[skillId] = { skillId, campaigns: [] };
          }

          // 이미 추가된 캠페인은 중복 추가하지 않음
          if (!skillMap[skillId].campaigns.some(c => c.campaignId === campaign.campaign_id)) {
            skillMap[skillId].campaigns.push({
              campaignId: campaign.campaign_id,
              tenantId: campaign.tenant_id
            });
          }
        });
      });

      const skillArray = Object.values(skillMap).sort((a, b) => a.skillId - b.skillId);
      
      setSkillsWithCampaigns(skillArray);
    }
  }, [data, skillListData]);

  useEffect(() => {
    if (isOpen) {
      setSelectedLeftCampaigns([]);
      setSelectedRightCampaigns([]);
      setExpandedSkills([1]);
      setSearchTerm('');
      setShowAlert(false);
      setConfirmRemove(false);
      setCampaignIdsForPopup([]);
    }
  }, [isOpen]);

  // ----------------------------
  //  Derived data & Helpers
  // ----------------------------
  const isLoadingAny = isLoading || isLoadingCampaigns || isLoadingSkills;
  const hasError = Boolean(error || campaignError || skillError || groupError);

  const groupCampaignsData = useMemo(() => {
    return (groupData?.result_data || []).filter(item => item.group_id === groupId);
  }, [groupData, groupId]);

  // 현재 그룹에 이미 존재하는 캠페인 ID들의 Set
  const existingCampaignIds = useMemo(() => {
    return new Set(groupCampaignsData.map(item => item.campaign_id));
  }, [groupCampaignsData]);

  // 선택한 캠페인 중 중복되지 않은 항목이 있는지 확인
  const hasUniqueSelections = useMemo(() => {
    return campaignIdsForPopup.some(id => !existingCampaignIds.has(id));
  }, [campaignIdsForPopup, existingCampaignIds]);

  const getCampaignName = (campaignId: number) =>
    campaignLookup[campaignId]?.campaign_name || `캠페인 ${campaignId}`;

  const getSkillName = (skillId: number) =>
    skillLookup[skillId]?.skill_name || `스킬 ${skillId}`;

  const filteredSkills = useMemo(() => {
    if (!searchTerm) return skillsWithCampaigns;
    const term = searchTerm.toLowerCase();
    return skillsWithCampaigns
      .map(skill => {
        const skillMatches =
          String(skill.skillId).includes(term) ||
          getSkillName(skill.skillId).toLowerCase().includes(term);
        const filteredCampaigns = skill.campaigns.filter(c =>
          String(c.campaignId).includes(term) ||
          getCampaignName(c.campaignId).toLowerCase().includes(term)
        );
        return {
          skillId: skill.skillId,
          campaigns: skillMatches ? skill.campaigns : filteredCampaigns
        };
      })
      .filter(skill => skill.campaigns.length > 0);
  }, [skillsWithCampaigns, searchTerm]);

  const totalCampaigns = useMemo(
    () => filteredSkills.reduce((acc, skill) => acc + skill.campaigns.length, 0),
    [filteredSkills]
  );

  const toggleSkill = (skillId: number) => {
    setExpandedSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const toggleAllSkills = (expand: boolean) => {
    if (expand) {
      const allSkillIds = filteredSkills.map(skill => skill.skillId);
      setExpandedSkills(allSkillIds);
    } else {
      setExpandedSkills([]);
    }
  };

  const toggleLeftCampaignSelection = (id: string) => {
    setSelectedLeftCampaigns(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleAllCampaigns = (checked: boolean) => {
    if (checked) {
      toggleAllSkills(true);
      const allCampaignIds = filteredSkills.flatMap(skill =>
        skill.campaigns.map(c => `${skill.skillId}-${c.campaignId}`)
      );
      setSelectedLeftCampaigns(allCampaignIds);
    } else {
      setSelectedLeftCampaigns([]);
    }
  };

  const toggleAllGroupCampaigns = (checked: boolean, selectedIds: number[] = []) => {
    setSelectedRightCampaigns(selectedIds);
  };

  const getSelectedCampaignIds = (): number[] => {
    return selectedLeftCampaigns
      .map(compositeId => {
        const parts = compositeId.split('-');
        return parts.length === 2 ? parseInt(parts[1]) : null;
      })
      .filter((id): id is number => id !== null);
  };

  // ----------------------------
  //  Confirm Popup Table
  // ----------------------------
  const createCampaignListTable = (campaignIds: number[]) => {
    const groupCampaignIds = new Set(groupCampaignsData.map(item => item.campaign_id));
    return (
      <div className="max-h-40 overflow-auto border rounded border-[#ebebeb] mb-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#F8F8F8] border-b">
              <th className="border-r border-[#ebebeb] px-2 font-normal text-[#333]" style={{ height: '30px' }}>캠페인 아이디</th>
              <th className="border-r border-[#ebebeb] px-2 font-normal text-[#333]" style={{ height: '30px' }}>캠페인 이름</th>
              <th className="px-2 font-normal text-[#333]" style={{ height: '30px' }}>중복</th>
            </tr>
          </thead>
          <tbody>
            {campaignIds.map((id, index) => {
              const isDuplicate = groupCampaignIds.has(id);
              return (
                <tr
                  key={id}
                  className={isDuplicate ? 'bg-orange-100' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')}
                >
                  <td className="px-2 text-center" style={{ height: '30px' }}>{id}</td>
                  <td className="px-2 text-center" style={{ height: '30px' }}>{getCampaignName(id)}</td>
                  <td className="px-2 text-center" style={{ height: '30px' }}>
                    {isDuplicate && (
                      <button onClick={() => handleRemoveFromPopup(id)} className="text-red-500">
                        x
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const createGroupCampaignListTable = (campaignIds: number[]) => {
    const selectedCampaigns = groupCampaignsData.filter(item =>
      campaignIds.includes(item.campaign_id)
    );
    return (
      <div className="max-h-40 overflow-auto border rounded mb-4 border-[#ebebeb]">
        <table className="w-full border-collapse text-sm ">
          <thead>
            <tr className="bg-[#F8F8F8] border-b">
              <th className="border-r border-[#ebebeb] px-2 font-normal text-[#333]" style={{ height: '30px' }}>캠페인 아이디</th>
              <th className="px-2 font-normal text-[#333]" style={{ height: '30px' }}>캠페인 이름</th>
            </tr>
          </thead>
          <tbody>
            {selectedCampaigns.map((campaign, index) => (
              <tr key={campaign.campaign_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border-r border-[#ebebeb] px-2 text-center" style={{ height: '30px' }}>{campaign.campaign_id}</td>
                <td className="px-2 text-center" style={{ height: '30px' }}>{getCampaignName(campaign.campaign_id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ----------------------------
  //  Popup Actions
  // ----------------------------
  const handleRemoveFromPopup = (campaignId: number) => {
    setSelectedLeftCampaigns(prev =>
      prev.filter(item => {
        const parts = item.split('-');
        return parseInt(parts[1]) !== campaignId;
      })
    );
    setCampaignIdsForPopup(prev => prev.filter(id => id !== campaignId));
  };

  const moveToGroup = () => {
    const campaignIds = getSelectedCampaignIds();
    if (campaignIds.length === 0) return;
    setCampaignIdsForPopup(campaignIds);
    const alertContent = (
      <div>
        <p className="mb-2">
          {groupName} 에 아래의 {campaignIds.length} 개의 캠페인을 추가하시겠습니까?
        </p>
      </div>
    );
    setAlertMessage(alertContent);
    setConfirmRemove(false);
    setShowAlert(true);
  };

  const confirmAddToGroup = async () => {
    if (campaignIdsForPopup.length === 0) {
      setShowAlert(false);
      return;
    }

    // 중복 캠페인 ID 필터링
    const filteredCampaignIds = campaignIdsForPopup.filter(id => !existingCampaignIds.has(id));

    // 모든 캠페인이 이미 그룹에 존재하는 경우에도 계속 진행하고 알림만 표시
    const duplicateCount = campaignIdsForPopup.length - filteredCampaignIds.length;

    setProcessingCampaigns(true);
    try {
      // 새로 추가할 캠페인이 있는 경우에만 API 호출
      if (filteredCampaignIds.length > 0) {
        addCampaignToGroup({
          group_id: groupId,
          campaign_ids: filteredCampaignIds,
          tenant_id: Number(tenant_id)
        }, {
          onSuccess: (data: { result_code: string | number }) => {
            if (Number(data.result_code) === 0) {
              if (duplicateCount > 0) {
                toast.success(
                  `${filteredCampaignIds.length}개의 캠페인이 "${groupName}" 그룹에 추가되었습니다. ${duplicateCount}개는 이미 존재하는 항목입니다.`
                );
              } else {
                toast.success(`${filteredCampaignIds.length}개의 캠페인이 "${groupName}" 그룹에 추가되었습니다.`);
              }
            } else {
              toast.error('캠페인 추가에 실패했습니다.');
            }

            refetchTreeDataForCampaignGroupTab();
            setCampaignGroupManagerInit(true);

            setSelectedLeftCampaigns([]);
            setCampaignIdsForPopup([]);
            setProcessingCampaigns(false);
            setShowAlert(false);
          },
          onError: (error) => {
            // console.error('캠페인 추가 중 오류 발생:', error);
            toast.error('캠페인 추가 과정에서 오류가 발생했습니다.');
            setProcessingCampaigns(false);
            setShowAlert(false);
          }
        });
      } else {
        // 모든 캠페인이 이미 존재하는 경우
        toast.info("추가할 모든 캠페인이 이미 그룹에 존재합니다.");
        setSelectedLeftCampaigns([]);
        setCampaignIdsForPopup([]);
        setProcessingCampaigns(false);
        setShowAlert(false);
      }
    } catch (error) {
      // console.error('캠페인 추가 중 오류 발생:', error);
      toast.error('캠페인 추가 과정에서 오류가 발생했습니다.');
      setProcessingCampaigns(false);
      setShowAlert(false);
    }
  };

  const moveToAll = () => {
    if (selectedRightCampaigns.length === 0) {
      toast.warn('삭제할 캠페인을 선택해주세요.');
      return;
    }
    const tableContent = createGroupCampaignListTable(selectedRightCampaigns);
    const alertContent = (
      <div>
        <p className="mb-2">
          {groupName} 에서 아래의 {selectedRightCampaigns.length} 개의 캠페인을 삭제하시겠습니까?
        </p>
        {tableContent}
      </div>
    );
    setAlertMessage(alertContent);
    setConfirmRemove(true);
    setShowAlert(true);
  };

  const confirmRemoveFromGroup = async () => {
    if (selectedRightCampaigns.length === 0) {
      setShowAlert(false);
      return;
    }
    setRemovingCampaigns(true);
    try {
      removeCampaignFromGroup({
        group_id: groupId,
        campaign_ids: selectedRightCampaigns,
        tenant_id: Number(tenant_id)
      }, {
        onSuccess: (data: { result_code: string | number }) => {
          if (Number(data.result_code) === 0) {
            toast.success(`${selectedRightCampaigns.length}개의 캠페인이 "${groupName}" 그룹에서 삭제되었습니다.`);
          } else {
            toast.error('캠페인 삭제제에 실패했습니다.');
          }
          setRemovingCampaigns(false);
          setShowAlert(false);
          setConfirmRemove(false);
          setSelectedRightCampaigns([]);
          refetchTreeDataForCampaignGroupTab();
          setCampaignGroupManagerInit(true);
        },
        onError: (error) => {
          // console.error('캠페인 삭제 중 오류 발생:', error);
          toast.error('캠페인 삭제 과정에서 오류가 발생했습니다.');
          setRemovingCampaigns(false);
          setShowAlert(false);
          setConfirmRemove(false);
          setSelectedRightCampaigns([]);
        }
      });
    } catch (error) {
      // console.error('캠페인 삭제 중 오류 발생:', error);
      toast.error('캠페인 삭제 과정에서 오류가 발생했습니다.');
      setRemovingCampaigns(false);
      setShowAlert(false);
      setConfirmRemove(false);
      setSelectedRightCampaigns([]);
    }
  };

  const handleAlertConfirm = () => {
    if (confirmRemove) {
      confirmRemoveFromGroup();
    } else {
      confirmAddToGroup();
    }
  };

  const handleConfirm = () => {
    const campaignIds = groupCampaignsData.map(item => item.campaign_id);
    if (onSelect) onSelect(campaignIds);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <CustomAlert
        title={`${groupName} 에 대해 캠페인 추가`}
        isOpen={isOpen}
        onClose={() => onClose?.()}
        message={
          <div className="">

            <CustomInput
              type="text"
              placeholder="검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            <div
              className=""
            >
              <div className="flex gap-[15px] mt-[20px]">
                <div className="flex-1 ">
                  <TitleWrap title="전체 캠페인 목록" totalCount={totalCampaigns} />
                  <div className="border rounded  overflow-hidden">
                    <ITableForSkillListWithCampaign
                      filteredSkills={filteredSkills}
                      expandedSkills={expandedSkills}
                      selectedLeftCampaigns={selectedLeftCampaigns}
                      isLoading={isLoadingAny}
                      hasError={hasError}
                      toggleSkill={toggleSkill}
                      toggleLeftCampaignSelection={toggleLeftCampaignSelection}
                      toggleAllCampaigns={toggleAllCampaigns}
                      getCampaignName={getCampaignName}
                      getSkillName={getSkillName}
                      setExpandedSkills={setExpandedSkills}
                      existingCampaignIds={Array.from(existingCampaignIds).map(id => String(id))}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[22px] justify-center px-2">
                  <button
                    className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                    onClick={moveToGroup}
                    disabled={
                      selectedLeftCampaigns.length === 0 ||
                      processingCampaigns ||
                      isAddingCampaign ||
                      removingCampaigns ||
                      isRemovingCampaign
                    }
                    title="선택한 캠페인 추가"
                  >
                    {processingCampaigns || isAddingCampaign ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>→</span>
                    )}
                  </button>
                  <button
                    className="w-[22px] h-[22px] bg-[#60C3CD] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                    onClick={moveToAll}
                    disabled={
                      selectedRightCampaigns.length === 0 ||
                      processingCampaigns ||
                      isAddingCampaign ||
                      removingCampaigns ||
                      isRemovingCampaign
                    }
                    title="선택한 캠페인 삭제"
                  >
                    {removingCampaigns || isRemovingCampaign ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>←</span>
                    )}
                  </button>
                </div>
                <div className="flex-1">
                  <TitleWrap title="그룹 소속 캠페인목록" totalCount={groupCampaignsData.length} />
                  <div className="border rounded overflow-hidden">
                    <GroupCampaignList
                      isLoading={isLoadingGroup}
                      groupCampaigns={groupCampaignsData}
                      toggleAllGroupCampaigns={toggleAllGroupCampaigns}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              {/* <CommonButton onClick={handleConfirm}>
                확인
              </CommonButton> */}
              <CommonButton variant="outline" onClick={onClose}>
                닫기
              </CommonButton>
            </div>
          </div>
        }
        type="custom"
        width="max-w-[1300px]"
        showButtons={false}
      />
      {showAlert && (
        <CustomAlert
          title={confirmRemove ? '캠페인 삭제 확인' : '캠페인 추가 확인'}
          isOpen={showAlert}
          onClose={handleAlertConfirm}
          onCancel={() => setShowAlert(false)}
          message={
            <div>
              {alertMessage}
              {!confirmRemove && createCampaignListTable(campaignIdsForPopup)}
            </div>
          }
          type="custom"
          width="max-w-md"
          confirmDisabled={false} // 항상 확인 버튼 활성화
          isShowForCancelButton={true} // 취소 버튼 표시 여부
        />
      )}
    </>
  );
}

export default CampaignAddPopup;