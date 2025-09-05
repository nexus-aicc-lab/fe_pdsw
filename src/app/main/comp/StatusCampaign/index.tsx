
"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/CustomSelect";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useApiForCampaignSkill } from "@/features/campaignManager/hooks/useApiForCampaignSkill";
import { useApiForSkills } from "@/features/campaignManager/hooks/useApiForSkills";
import { useAuthStore, useCampainManagerStore, useMainStore } from "@/store";
import { CommonButton } from "@/components/shared/CommonButton";
import { useEnvironmentStore } from "@/store/environmentStore";
import { useMultiCampaignProgressQuery } from "./hook/useMultiCampaignProgressQuery";
import { toast } from "react-toastify";
import { CampaignProgressInformationResponse, CampaignProgressInformationResponseDataType } from "@/features/monitoring/types/monitoringIndex";
import { useCampaignProgressMutation } from "./hook/useMultiCampaignProgressMutaion";



interface ChartDataItem {
  name: string;
  progress: number;
  success: number;
}

interface DispatchStatusData {
  campaign_id: number;
  dispatch_type: string;
  campaign_name: string;
  progress: number;
  success: number;
}

interface DispatchDataType {
  dispatch_id: number;
  dispatch_name: string;
}

type ProgressDataItem = {
  campaign_id: number;
  campaign_name: string;
  progressInfoList: CampaignProgressInformationResponseDataType[];
};

const StatusCampaign: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState("total");
  const [selectedDispatch, setSelectedDispatch] = useState("0");
  const { campaignSkills, setCampaignSkills } = useCampainManagerStore();
  const [skills, setSkills] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [campaignInfoList, setCampaignInfoList] = useState<DispatchStatusData[]>([]);
  const [maxDispatchCount, setMaxDispatchCount] = useState(0);
  const [dispatchTypeList, setDispatchTypeList] = useState<DispatchDataType[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const { campaigns } = useMainStore();
  const { statisticsUpdateCycle } = useEnvironmentStore();
  const [filteredCampaigns, setFilteredCampaigns] = useState(campaigns);
  const {tenant_id} = useAuthStore();


  // const { data: progressData, isLoading, isError, refetch } = useMultiCampaignProgressQuery(campaigns);
  // 필터링된 캠페인만 사용하도록 쿼리 수정
  // const { data: progressData, isLoading, isError, refetch } =
  //   useMultiCampaignProgressQuery(filteredCampaigns);
    // filteredCampaigns

  const [progressData, setProgressData] = useState<ProgressDataItem[]| null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  

  const { mutate: fetchSkills } = useApiForSkills({
    onSuccess: (data) => {
      setSkills(data.result_data);
      fetchCampaignSkills({ session_key: "", tenant_id: tenant_id === 0 ? 0 : tenant_id });
    },
  });

  const { mutate: fetchCampaignSkills } = useApiForCampaignSkill({
    onSuccess: (data) => {
      // setCampaignSkills(data.result_data); // 총 진행상황을 띄워놓고 캠페인관리를 재갱신해서 방지용 주석처리 09-05 - lab09
      processDataForChart(data.result_data, selectedSkill, selectedDispatch);
    },
  });

  // const refreshData = useCallback(() => {
  //   setIsRefreshing(true);
  //   const startTime = new Date();

  //   // Show toast message when starting refresh
  //   // const toastId = toast.loading('데이터를 새로고침 중입니다...', {
  //   //   position: 'top-right',
  //   // });

  //   refetch()
  //     .then(() => {
  //       const endTime = new Date();
  //       const refreshDuration = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds

  //       // Update success toast with refresh time
  //       // toast.success(`데이터가 갱신되었습니다!`, {
  //       //   autoClose: 2000,
  //       //   position: 'top-center',
  //       // });

  //       setLastRefreshTime(endTime);
  //     })
  //     .catch((error) => {
  //       // Show error toast if refresh fails
  //       // toast.error('데이터 갱신에 실패했습니다.', {
  //       //   id: toastId,
  //       //   duration: 3000,
  //       //   position: 'top-right',
  //       // });
  //     })
  //     .finally(() => {
  //       setTimeout(() => setIsRefreshing(false), 1000);
  //     });
  // }, [refetch]);

    // 캠페인 진행 정보 api 호출
  const { mutate: fetchCampaignProgressInformation } = useCampaignProgressMutation({
    onSuccess: (data, variables) => {  
      // console.log("fetchCampaignProgressInformation data: ", data);
      if(data.length > 0){
        setProgressData(
          data.map((item) => ({
            campaign_id: item.campaign_id,
            campaign_name: item.campaign_name,
            progressInfoList: item.progressInfoList, // Assuming you want the first item in the array
          }))
        );
        setIsLoading(false);
        setIsError(false);
        const endTime = new Date();
        setLastRefreshTime(endTime);

      }
      else if(variables.length === 0 && data.length === 0){
        setProgressData([]);
        setIsLoading(false); 
      }   
    }
  });

  // 새로고침 기능도 필터링된 캠페인만 사용하도록 수정
  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    
    fetchCampaignProgressInformation( campaigns, {
      onSuccess: (data, variables) => {
        // console.log('variables: ', variables);
        if(data.length > 0){
          setProgressData(
            data.map((item) => ({
              campaign_id: item.campaign_id,
              campaign_name: item.campaign_name,
              progressInfoList: item.progressInfoList, // Assuming you want the first item in the array
            }))
          );
          setIsLoading(false);
          setIsError(false);
          const endTime = new Date();
          setLastRefreshTime(endTime);
        }
        else if(variables.length > 0 && data.length === 0){
          setProgressData([]);
          setIsLoading(false); 
        }
      },
      onError: () => {
        setIsError(true);
        setIsLoading(false);
      },
      onSettled: () => {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    });
  }, [campaigns, filteredCampaigns]); // refetch는 filteredCampaigns가 변경될 때마다 변경됨

  useEffect(() => {
    if (progressData) {
      // console.log("%%%%%%%%%% useEffect progressData: ", progressData);
      const flat: DispatchStatusData[] = [];
      let maxReuse = 0;

      progressData.forEach(({ campaign_id, campaign_name, progressInfoList }) => {
        progressInfoList.sort((a, b) => a.reuseCnt - b.reuseCnt).forEach((item, i) => {
          flat.push({
            campaign_id,
            dispatch_type: i.toString(),
            campaign_name,
            progress: item.totLstCnt === 0 ? 0 : parseFloat(((item.nonTTCT / item.totLstCnt) * 100).toFixed(1)),
            success: item.totLstCnt === 0 ? 0 : parseFloat(((item.scct / item.totLstCnt) * 100).toFixed(1)),
          });
        });
        if (progressInfoList.length > maxReuse) maxReuse = progressInfoList.length;
      });

      setCampaignInfoList(flat);

    }

    
  }, [progressData]);

  useEffect(() => {
    if(campaignInfoList.length > 0){
      processDataForChart(campaignSkills, selectedSkill, selectedDispatch);
    }
  },[campaignInfoList, filteredCampaigns]);

  const generateDispatchStatusData = (campaignId: number) => {
    const tempDataList = campaignInfoList.filter((data) => data.campaign_id === campaignId);
    const temp: { [key: string]: any } = { campaign_id: campaignId };
    for (let j = 0; j < maxDispatchCount; j++) {
      const data = tempDataList[j] || { progress: 0, success: 0 };
      temp[`dispatch${j}`] = { progress: data.progress, success: data.success };
    }
    return temp;
  };

  const processDataForChart = (campaignSkillsData: any[], currentSkill: string, dispatchType: string) => {
    
    let filtered = currentSkill === "total"
      ? campaigns
      : campaignSkillsData.filter((c) => c.skill_id?.includes(Number(currentSkill)));

    filtered = filtered.sort((a, b) => a.campaign_id - b.campaign_id);

    const processedData = filtered.map((c) => {
      const statusData = generateDispatchStatusData(c.campaign_id);
      const dispatchKey = `dispatch${dispatchType}` as keyof typeof statusData;
      const campaignName = campaigns.find((cam) => cam.campaign_id === c.campaign_id)?.campaign_name || "알 수 없음";
      // filtered의 campaign_name 속성이 없으므로 filtered의 campaign_id와 campaigns의 campaign_id와 같다면 campaigns의 campaign_name 사용
      return {
        name: `[${c.campaign_id}]${campaignName}`,
        progress: statusData[dispatchKey]?.progress || 0,
        success: statusData[dispatchKey]?.success || 0,
      };
    });

    setChartData(processedData);

    let maxReuse = 0;
    if (filtered.length > 0) {
      for (let i = 0; i < filtered.length; i++) {
        const reuse = progressData?.find(data => data.campaign_id === filtered[i].campaign_id)?.progressInfoList.length || 0;
        if (maxReuse < reuse) {
          maxReuse = reuse;
        }
      }
      setDispatchTypeList(
        Array.from({ length: maxReuse }, (_, i) => ({
          dispatch_id: i,
          dispatch_name: i === 0 ? "최초 발신" : `${i}차 재발신`,
        }))
      );
    } else {
      setDispatchTypeList([
        {
          dispatch_id: 0,
          dispatch_name: "최초 발신"
        }
      ]);
      setSelectedDispatch('0');
    }
    setMaxDispatchCount(maxReuse);

  };

  // const handleSkillChange = (value: string) => {
  //   setSelectedSkill(value);
  //   if (campaignSkills.length > 0) {
  //     processDataForChart(campaignSkills, value, selectedDispatch);
  //   }
  // };

  // 스킬 선택 핸들러 수정
  const handleSkillChange = (value: string) => {
    setSelectedSkill(value);

    // 스킬 기반으로 먼저 캠페인 필터링
    const newFilteredCampaigns = value === "total"
      ? campaigns
      : campaignSkills
        .filter((c) => c.skill_id?.includes(Number(value)))
        .map((c) => campaigns.find(camp => camp.campaign_id === c.campaign_id))
        .filter((camp): camp is typeof campaigns[0] => camp !== undefined); // Type guard to ensure no undefined values

    // 필터링된 캠페인 설정
    setFilteredCampaigns(newFilteredCampaigns);

    // 이미 가지고 있는 데이터로 차트 처리
    if (campaignSkills.length > 0) {
      processDataForChart(campaignSkills, value, selectedDispatch);
    }
  };

  const handleDispatchChange = (value: string) => {
    setSelectedDispatch(value);
    if (campaignSkills.length > 0) {
      processDataForChart(campaignSkills, selectedSkill, value);
    }
  };

  useEffect(() => {
    if (statisticsUpdateCycle > 0) {
      const interval = setInterval(() => {
        refreshData();
      }, statisticsUpdateCycle * 1000);
      return () => clearInterval(interval);
    }
  }, [statisticsUpdateCycle, refreshData]);

  useEffect(() => {
    fetchCampaignProgressInformation(campaigns);
    if (campaigns.length > 0) {
      refreshData();
      fetchSkills({ tenant_id_array: [] });
      setFilteredCampaigns(campaigns);
    }
  }, [campaigns]);

  const chartHeight = Math.max(chartData.length * 50 + 100, 300);

  // Format the last refresh time
  const formattedLastRefreshTime = lastRefreshTime ?
    `${lastRefreshTime.toLocaleTimeString()}` :
    '아직 갱신되지 않음';



  return (
    <div className="space-y-6">
      {/* Fixed controls section */}
      <div className="sticky top-0 z-10 bg-white py-4 border-b">
        {/* Combined filter, info and action controls in one row */}
        <div className="flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">스킬:</span>
              <Select value={selectedSkill} onValueChange={handleSkillChange}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="스킬 전체보기" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">스킬 전체보기</SelectItem>
                  {skills.map((skill) => (
                    <SelectItem key={skill.skill_id} value={skill.skill_id.toString()}>
                      {skill.skill_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">발신:</span>
              <Select value={selectedDispatch} onValueChange={handleDispatchChange}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="최초 발신" />
                </SelectTrigger>
                <SelectContent>
                  {dispatchTypeList.map((option) => (
                    <SelectItem key={option.dispatch_id} value={option.dispatch_id.toString()}>
                      {option.dispatch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 min-w-[260px]">
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>
                  갱신 주기: <span className="font-medium text-blue-600">{statisticsUpdateCycle}초</span>
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md max-w[150px] min-w-[150px]">
                <span>마지막 갱신:</span>
                <span className="font-medium text-blue-600">{formattedLastRefreshTime}</span>
              </div>
            </div>

            <CommonButton
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading || isRefreshing}
              className="flex items-center whitespace-nowrap mr-2"
            >
              <svg
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {/* {isRefreshing ? "갱신중" : "새로고침"} */}
              새로고침
            </CommonButton>
          </div>
        </div>
      </div>

      <div
        className={`border rounded-lg overflow-hidden transition-all duration-300`}
        style={{ height: chartHeight }}
      >
        { (isLoading && !isRefreshing) || progressData === null ? (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">데이터를 로드 중입니다...</p>
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center bg-red-50">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">데이터 로드 중 오류가 발생했습니다.</p>
            <button
              onClick={refreshData}
              className="mt-3 px-4 py-2 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="p-4 h-full">
            { chartData.length > 0  ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 13 }} axisLine={{ stroke: "#999" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 13 }} axisLine={{ stroke: "#999" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="left"
                    wrapperStyle={{
                      paddingBottom: "20px",
                      fontSize: "14px"
                    }}
                  />
                  <Bar dataKey="success" fill="#FF8DA0" name="성공률" radius={[0, 2, 2, 0]} />
                  <Bar dataKey="progress" fill="#4AD3C8" name="진행률" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) :  (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-1 text-gray-500">표시할 데이터가 없습니다.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

};

export default StatusCampaign;