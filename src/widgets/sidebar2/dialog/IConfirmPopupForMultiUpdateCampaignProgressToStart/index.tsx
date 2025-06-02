// src\widgets\sidebar2\dialog\IConfirmPopupForMultiUpdateCampaignProgressToStart\index.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApiForCampaignScheduleInfosForSystemAdmin } from "@/shared/hooks/campaign/useApiForCampaignScheduleInfosForSystemAdmin";
import { useApiForCampaignCallingNumberListForSystemAdmin } from "@/shared/hooks/campaign/useApiForCampaignCallingNumberListForSystemAdmin";
import { useApiForCampaignAgentListForSystemAdmin } from "@/shared/hooks/campaign/useApiForCampaignAgentListForSystemAdmin";
import { useApiForCampaignSkillListForSystemAdmin } from "@/shared/hooks/campaign/useApiForCampaignSkillListForSystemAdmin";
import ITableForUpdateCamapignProgressToStart from "./comp/ITableForUpdateCamapignProgressToStart";

interface Campaign {
  campaign_id?: string | number;
  name?: string;
  status?: number;
  [key: string]: any;
}

interface Props {
  open: boolean;
  items: Campaign[];
  onConfirm: () => Promise<any>;
  onCancel: () => void;
}

interface CampaignResult {
  campaignId: string;
  success: boolean;
  response?: {
    result_code: number;
    result_msg: string;
    reason_code: number;
  };
}

interface UpdateResult {
  success: boolean;
  message?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  results?: CampaignResult[];
}

const CampaignStartModal = ({
  open,
  items,
  onConfirm,
  onCancel,
}: Props) => {
  // 상태 관리
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCompleted, setUpdateCompleted] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  const [campaignResults, setCampaignResults] = useState<Map<string, CampaignResult>>(new Map());

  // 내부 상태 관리
  const [internalOpen, setInternalOpen] = useState(false);

  // 현재 시간
  const now = useMemo(() => new Date(), []);

  // 캠페인 아이디 배열 추출
  const campaignIds = useMemo(() => {
    return items
      .map(item => Number(item.campaign_id))
      .filter(id => !isNaN(id));
  }, [items]);

  // 캠페인 스케줄 정보 가져오기
  const { data: scheduleData, isLoading: isLoadingSchedule } = useApiForCampaignScheduleInfosForSystemAdmin({
    request: {
      filter: {
        campaign_id: {
          start: Math.min(...campaignIds, 1),
          end: Math.max(...campaignIds, 9999999)
        }
      }
    },
    enabled: campaignIds.length > 0 && internalOpen
  });

  // 캠페인 발신번호 정보 가져오기
  const { data: callingNumberData, isLoading: isLoadingCallingNumbers } = useApiForCampaignCallingNumberListForSystemAdmin({
    request: {
      filter: {
        campaign_id: {
          start: Math.min(...campaignIds, 1),
          end: Math.max(...campaignIds, 9999999)
        }
      }
    },
    enabled: campaignIds.length > 0 && internalOpen
  });

  // 캠페인 상담사 정보 가져오기
  const { data: agentData, isLoading: isLoadingAgents } = useApiForCampaignAgentListForSystemAdmin({
    request: {
      filter: {
        campaign_id: campaignIds
      }
    },
    enabled: campaignIds.length > 0 && internalOpen
  });

  // 캠페인 스킬 정보 가져오기
  const { data: skillData, isLoading: isLoadingSkills } = useApiForCampaignSkillListForSystemAdmin({
    request: {
      filter: {
        skill_id: {
          start: 1,
          end: 9999999
        }
      }
    },
    enabled: campaignIds.length > 0 && internalOpen
  });

  // 캠페인 스케줄 맵 생성
  const scheduleMap = useMemo(() => {
    const map = new Map();
    if (scheduleData?.result_data) {
      scheduleData.result_data.forEach(schedule => {
        map.set(schedule.campaign_id.toString(), schedule);
      });
    }
    return map;
  }, [scheduleData]);

  // 캠페인별 발신번호 맵 생성
  const callingNumberMap = useMemo(() => {
    const map = new Map<string, string[]>();

    if (callingNumberData?.result_data) {
      // 캠페인 ID별로 발신번호 그룹화
      callingNumberData.result_data.forEach(item => {
        const campaignId = item.campaign_id.toString();
        if (!map.has(campaignId)) {
          map.set(campaignId, []);
        }
        map.get(campaignId)?.push(item.calling_number);
      });
    }

    return map;
  }, [callingNumberData]);

  // 캠페인별 상담사 맵 생성
  const agentMap = useMemo(() => {
    const map = new Map<string, string[]>();

    if (agentData?.result_data) {
      agentData.result_data.forEach(item => {
        // agent_id를 string[]으로 변환하여 저장
        const agentIds = item.agent_id.map(id => id.toString());
        map.set(item.campaign_id.toString(), agentIds);
      });
    }

    return map;
  }, [agentData]);

  // 캠페인별 스킬 맵 생성
  const skillMap = useMemo(() => {
    const map = new Map<string, { id: number, name: string }[]>();

    if (skillData?.result_data) {
      // 각 캠페인에 할당된 스킬 정보를 매핑
      // 실제 데이터 구조에 맞게 변경해야 할 수 있음
      campaignIds.forEach(campaignId => {
        const campaignSkills = skillData.result_data.filter(skill =>
          // 이 부분은 API 응답 구조에 따라 수정 필요
          // 여기서는 예시로 모든 스킬을 각 캠페인에 연결
          true
        );

        map.set(campaignId.toString(), campaignSkills.map(skill => ({
          id: skill.skill_id,
          name: skill.name || `Skill ${skill.skill_id}`
        })));
      });
    }

    return map;
  }, [skillData, campaignIds]);

  // open prop이 true로 바뀔 때만 모달 열기
  useEffect(() => {
    if (open) {
      setInternalOpen(true);
      // 결과 초기화
      setCampaignResults(new Map());
      setUpdateResult(null);
      setUpdateCompleted(false);
    }
  }, [open]);

  // 업데이트 함수
  const handleUpdate = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const result = await onConfirm();

      // 결과 처리
      if (result && result.results && Array.isArray(result.results)) {
        let successCount = 0;
        let failCount = 0;

        const updatedResults = result.results.map((item: CampaignResult) => {
          const isSuccess = !(item.response && item.response.result_code === -1);

          if (isSuccess) {
            successCount++;
          } else {
            failCount++;
          }

          return {
            ...item,
            success: isSuccess
          };
        });

        const updatedResult = {
          ...result,
          results: updatedResults,
          successCount: successCount,
          failCount: failCount,
          totalCount: updatedResults.length
        };

        setUpdateResult(updatedResult);

        // 결과 맵 생성
        const resultMap = new Map<string, CampaignResult>();
        updatedResults.forEach((item: CampaignResult) => {
          if (item && item.campaignId) {
            resultMap.set(item.campaignId.toString(), item);
          }
        });
        setCampaignResults(resultMap);
      } else {
        setUpdateResult({
          success: false,
          message: "응답 형식이 올바르지 않습니다.",
          totalCount: 0,
          successCount: 0,
          failCount: 0
        });
      }

      setUpdateCompleted(true);
    } catch (error) {
      console.error("업데이트 오류:", error);
      setUpdateResult({
        success: false,
        message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        totalCount: 0,
        successCount: 0,
        failCount: 0
      });
      setUpdateCompleted(true);
    } finally {
      setIsUpdating(false);
    }
  };

  // 닫기 함수
  const handleCancel = () => {
    // 업데이트 중이면 무시
    if (isUpdating) return;

    // 내부 상태 변경
    setInternalOpen(false);

    // 약간의 지연 후 부모 컴포넌트에 닫힘을 알림
    setTimeout(() => {
      onCancel();
    }, 100);
  };

  // 테이블 로딩 여부
  const isLoading = isLoadingSchedule || isLoadingCallingNumbers || isLoadingAgents || isLoadingSkills;

  return (
    <Dialog open={internalOpen} onOpenChange={(open) => {
      if (!open && !isUpdating) handleCancel();
    }}>
      <DialogContent
        className="!w-[80%] lg:w-[80%] max-w-[900px]"
        onInteractOutside={(e) => {
          // 바깥 클릭 시 모달이 닫히지 않도록
          if (isUpdating) e.preventDefault();
        }}>
        <DialogHeader>
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-emerald-100 mr-3">
              <Play className="h-5 w-5 text-emerald-600" />
            </div>
            <DialogTitle>캠페인 일괄 시작</DialogTitle>
          </div>
        </DialogHeader>

        {/* 본문 */}
        <div className="space-y-5">
          {/* 업데이트 안내 텍스트 */}
          <Alert className="bg-blue-50 border-blue-100">
            <div className="flex justify-between items-start ">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <AlertDescription className="text-blue-800">
                  {updateCompleted
                    ? "캠페인 일괄 시작 작업이 완료되었습니다."
                    : "선택하신 캠페인을 일괄적으로 시작 상태로 변경합니다."}

                  {!updateCompleted && (
                    <p className="mt-1 text-xs text-blue-600">
                      총 {items.length}개의 캠페인이 선택되었습니다.
                    </p>
                  )}

                  {updateCompleted && updateResult && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">총 {updateResult.totalCount}개 중</span>
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">
                          성공: {updateResult.successCount}개
                        </span>
                        {updateResult.failCount && updateResult.failCount > 0 && (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs">
                            실패: {updateResult.failCount}개
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </div>

              {/* 일괄 시작 진행 버튼 */}
              {!updateCompleted && (
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="relative overflow-hidden border-2 text-emerald-600 px-6 py-2 text-base font-medium
               hover:text-white transition-colors duration-300 ease-in-out"
                  variant="outline"
                >
                  <span className="absolute inset-0 bg-emerald-600 transform scale-x-0 origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
                  <div className="flex items-center relative z-10">
                    {isUpdating ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Play className="h-5 w-5 mr-2" />
                    )}
                    <span>캠페인 시작</span>
                  </div>
                </Button>
              )}
            </div>
          </Alert>

          {/* 분리된 테이블 컴포넌트 사용 */}
          <ITableForUpdateCamapignProgressToStart
            items={items}
            updateCompleted={updateCompleted}
            campaignResults={campaignResults}
            scheduleMap={scheduleMap}
            callingNumberMap={callingNumberMap}
            agentMap={agentMap}
            skillMap={skillMap}
            isLoading={isLoading}
            now={now}
          />

          {/* 경고 메시지 */}
          <Alert variant="default" className="bg-amber-50 border-amber-100">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <AlertDescription className="text-xs text-amber-800 pt-0.5">
                {updateCompleted
                  ? "일괄 처리 작업이 완료되었습니다. 결과를 확인하고 필요한 경우 개별적으로 재시도해 주세요."
                  : "캠페인을 일괄 시작하면 즉시 적용되며, 실행 중인 다른 작업에 영향을 줄 수 있습니다."}
              </AlertDescription>
            </div>
          </Alert>
        </div>

        {/* 버튼 영역 */}
        <DialogFooter>
          <Button
            onClick={handleCancel}
            disabled={isUpdating}
            variant="secondary"
          >
            {updateCompleted ? "닫기" : "취소"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignStartModal;