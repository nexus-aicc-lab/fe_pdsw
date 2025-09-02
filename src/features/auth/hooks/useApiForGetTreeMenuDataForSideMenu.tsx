
// src/features/campaignManager/hooks/useApiForGetTreeMenuDataForSideMenu.ts
"use client";

import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { TabData, TreeItem } from "@/features/campaignManager/types/typeForSidebar2";
import { useAuthStore, useMainStore } from "@/store";
import { useEffect, useState, useRef } from "react";

type TreeMenuQueryResult = UseQueryResult<TabData[], Error> & {
  updateTreeMenuData: (updater: (oldData: TabData[] | undefined) => TabData[]) => void;
  invalidateTreeMenuData: () => void;
  isStoreReady: boolean;
};

function getStatusFromFlags(start_flag: number): 'started' | 'pending' | 'stopped' {
  if (start_flag === 1) return 'started';
  if (start_flag === 2) return 'pending';
  if (start_flag === 3) return 'stopped';
  return 'stopped';
}

export function useApiForGetTreeMenuDataForSideMenu(): TreeMenuQueryResult {
  const queryClient = useQueryClient();
  const { tenant_id, role_id, session_key } = useAuthStore();
  const { 
    tenantsLoaded, 
    campaignsLoaded, 
    tenants, 
    campaigns,
    // 캠페인 스킬 관련 스토어 상태 추가
    campaignSkills,
    campaignSkillsLoaded
  } = useMainStore();

  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const previousDataRef = useRef<{
    tenants: typeof tenants;
    campaigns: typeof campaigns;
    campaignSkills: typeof campaignSkills;
  }>({ tenants: [], campaigns: [], campaignSkills: [] });

  const getQueryKey = () => ["treeMenuDataForSideMenu", tenant_id, role_id];

  useEffect(() => {
    if (
      session_key !== "" &&
      tenantsLoaded &&
      campaignsLoaded &&
      campaignSkillsLoaded && // 캠페인 스킬 데이터도 로드됐는지 확인
      tenants.length > 0 &&
      campaigns.length > 0
    ) {
      previousDataRef.current = { 
        tenants: [...tenants], 
        campaigns: [...campaigns],
        campaignSkills: [...campaignSkills]
      };
      setIsReady(true);
    }
  }, [
    session_key, 
    tenantsLoaded, 
    campaignsLoaded, 
    campaignSkillsLoaded, 
    tenants.length, 
    campaigns.length,
    campaignSkills.length
  ]);

  // console.log("campaignSkills at hook : ", campaignSkills);
  

  const invalidateTreeMenuData = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    queryClient.invalidateQueries({ queryKey: getQueryKey() })
      .finally(() => setIsProcessing(false));
  };

  const generateTreeMenuData = async (): Promise<TabData[]> => {
    if (!isReady) return [];

    try {
      // 스토어에서 캠페인 스킬 데이터 사용
      const campaignSkillsMap: Record<string, any[]> = {};

      // 캠페인 스킬 데이터 가공
      campaignSkills.forEach((skill) => {
        // Check if campaign_id is an array
        const campaignIds = Array.isArray(skill.campaign_id) ? skill.campaign_id : [skill.campaign_id];
        
        // Fix: Update the callback signature to handle possibly undefined values
        campaignIds.forEach((campaignId: number | undefined) => {
          // Skip undefined or null campaign IDs
          if (campaignId === undefined || campaignId === null) return;
          
          const campaignIdStr = campaignId.toString();
          if (!campaignSkillsMap[campaignIdStr]) campaignSkillsMap[campaignIdStr] = [];
          
          const exists = campaignSkillsMap[campaignIdStr].some(s => s.skill_id === skill.skill_id);
          if (!exists) {
            campaignSkillsMap[campaignIdStr].push({ 
              skill_id: skill.skill_id, 
              tenant_id: skill.tenant_id 
            });
          }
        });
      });

      const campaignsByTenant: Record<number, any[]> = {};
      campaigns.forEach(c => {
        if (!campaignsByTenant[c.tenant_id]) campaignsByTenant[c.tenant_id] = [];
        campaignsByTenant[c.tenant_id].push(c);
      });

      const items: TreeItem[] = tenants.map(tenant => ({
        id: tenant.tenant_id.toString(),
        label: tenant.tenant_name,
        type: 'folder',
        children: campaignsByTenant[tenant.tenant_id]?.map(c => ({
          id: c.campaign_id.toString(),
          label: c.campaign_name,
          type: 'campaign',
          status: getStatusFromFlags(c.start_flag),
          direction: 'outbound',
          tenantId: c.tenant_id.toString(),
          children: (campaignSkillsMap[c.campaign_id.toString()] || []).map(skill => ({
            id: `skill-${skill.skill_id}-${c.campaign_id}`,
            label: `Skill ${skill.skill_id}`,
            type: 'skill',
            skillId: skill.skill_id,
            tenantId: skill.tenant_id.toString(),
            campaignName: c.campaign_name,
            visible: false
          }))
        })) || []
      }));

      return [{
        id: 'campaign',
        label: '캠페인',
        items: [{
          id: 'nexus',
          label: 'NEXUS',
          type: 'folder',
          children: items
        }]
      }];
    } catch (err) {
      if((err as Error).toString() === 'Error: undefined||undefined' ){
        // 메세지 출력
        // tofix ohs 0509
        // PDS 서버 시스템과 연결할 수 없습니다. 서버 동작 상태를 확인하여 주십시오. 프로그램을 종료합니다.
        // console.error("generateTreeMenuData error: undefined||undefined");
        return [];
      }

      // console.error("generateTreeMenuData error:", err);
      return [];
    }
  };

  const query = useQuery<TabData[], Error>({
    queryKey: getQueryKey(),
    queryFn: generateTreeMenuData,
    enabled: isReady,
    staleTime: 30000,
  });

  const updateTreeMenuData = (updater: (oldData: TabData[] | undefined) => TabData[]) => {
    queryClient.setQueryData(getQueryKey(), updater);
  };

  // console.log("updateTreeMenuData : ", updateTreeMenuData);
  

  return {
    ...query,
    updateTreeMenuData,
    invalidateTreeMenuData,
    isStoreReady: isReady
  };
}