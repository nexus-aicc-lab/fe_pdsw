"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";

import { TreeNodeForCounselorListForSideBar } from "../../../features/campaignManager/components/treeMenus/TreeNodeForCounselorListForSideBar";
import { SearchBarForSideMenuForCounselorTab } from "../../../features/campaignManager/components/treeMenus/searchbar/SearchBarForSideMenuForCounselorTab";
import { CounselorTreeLevelSelector } from "../../../features/campaignManager/components/treeMenus/option/CounselorTreeLevelSelector";
import { IOrganization } from "@/features/campaignManager/types/typeForSideBarCounselorTab2";

import { useApiForSidebarCounselor } from "@/features/campaignManager/hooks/useApiForGetDataForSidebarCounselorTab";
import { WindowStateUtils } from "@/features/campaignManager/hooks/useApiDeleteCounselorsFromSkills";

import { useAuthStore } from "@/store/authStore";
import { useCounselorFilterStore } from "@/store/storeForSideMenuCounselorTab";
import { SkeletonForTreeMenuForCounselor } from "../Skeleton/SkeletonForTreeMenuForCounselor";


interface ISkill {
  skillId: string;
  skillName: string;
}

export function TreeMenusForAgentTab() {
  const { tenant_id, role_id } = useAuthStore();
  const { data, isLoading } = useApiForSidebarCounselor(
    tenant_id.toString(),
  );

  // console.log("🌟 treeData in TreeMenusForAgentTab (Window 버전 - 스킬 포함) !!!!!!!!!!!!! ", data);

  const [searchTerm, setSearchTerm] = useState("");
  const {
    setSelectedCounselor,
    sortOption,
    currentExpansionLevel,
    expandToLevel: storeExpandToLevel
  } = useCounselorFilterStore();

  const [allCounselors, setAllCounselors] = useState<Array<{
    counselorId: string;
    counselorName: string;
    tenantId: string;
  }>>([]);

  const defaultExpanded = {
    organization: true,
    tenant: true,
    group: true,
    team: true,
    counselor: false,
    skill: false // 스킬은 기본적으로 닫혀있음
  };

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [sortedData, setSortedData] = useState<any[]>([]);

  // 렌더링 최적화를 위한 ref
  const isInitializedRef = useRef(false);
  const dataVersionRef = useRef(0);

  // 🌟 정렬 로직 구현 (tenant_id 필터링 적용) - 스킬 정보 보존
  const applySorting = useCallback((dataArray: IOrganization[]) => {
    if (!dataArray || dataArray.length === 0) return [];

    const { type, direction, nodeType } = sortOption;

    // 깊은 복사를 통해 원본 데이터 보존 (스킬 정보 포함)
    const clonedData: IOrganization[] = JSON.parse(JSON.stringify(dataArray));

    /*
    console.log('🔍 정렬 전 데이터 확인:', {
      orgCount: clonedData.length,
      firstOrgHasSkills: clonedData[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
    });
    */

    // tenant_id가 0이 아닌 경우에만 필터링 적용
    if (tenant_id !== 0) {
      // 테넌트 필터링 적용
      clonedData.forEach(org => {
        if (org.tenantInfo && org.tenantInfo.length > 0) {
          org.tenantInfo = org.tenantInfo.filter(tenant =>
            tenant.tenantId === tenant_id.toString()
          );
        }
      });
    }

    // 조직 레벨 정렬
    if (nodeType === 'all' || nodeType === 'organization') {
      clonedData.sort((a, b) => {
        if (type === 'id') {
          const valueA = parseInt(a.centerId) || 0;
          const valueB = parseInt(b.centerId) || 0;
          return direction === 'asc' ? valueA - valueB : valueB - valueA;
        } else {
          return direction === 'asc'
            ? a.centerName.localeCompare(b.centerName)
            : b.centerName.localeCompare(a.centerName);
        }
      });
    }

    // 각 조직 내의 테넌트 정렬
    clonedData.forEach(org => {
      if (org.tenantInfo && org.tenantInfo.length > 0) {
        // 테넌트 레벨 정렬
        if (nodeType === 'all' || nodeType === 'tenant') {
          org.tenantInfo.sort((a, b) => {
            if (type === 'id') {
              const valueA = parseInt(a.tenantId) || 0;
              const valueB = parseInt(b.tenantId) || 0;
              return direction === 'asc' ? valueA - valueB : valueB - valueA;
            } else {
              return direction === 'asc'
                ? a.tenantName.localeCompare(b.tenantName)
                : b.tenantName.localeCompare(a.tenantName);
            }
          });
        }

        // 각 테넌트 내의 그룹 정렬
        org.tenantInfo.forEach(tenant => {
          if (tenant.groupInfo && tenant.groupInfo.length > 0) {
            // 그룹 레벨 정렬
            if (nodeType === 'all' || nodeType === 'group') {
              tenant.groupInfo.sort((a, b) => {
                if (type === 'id') {
                  const valueA = parseInt(a.groupId) || 0;
                  const valueB = parseInt(b.groupId) || 0;
                  return direction === 'asc' ? valueA - valueB : valueB - valueA;
                } else {
                  return direction === 'asc'
                    ? a.groupName.localeCompare(b.groupName)
                    : b.groupName.localeCompare(a.groupName);
                }
              });
            }

            // 각 그룹 내의 팀 정렬
            tenant.groupInfo.forEach(group => {
              if (group.teamInfo && group.teamInfo.length > 0) {
                // 팀 레벨 정렬
                if (nodeType === 'all' || nodeType === 'team') {
                  group.teamInfo.sort((a, b) => {
                    if (type === 'id') {
                      const valueA = parseInt(a.teamId) || 0;
                      const valueB = parseInt(b.teamId) || 0;
                      return direction === 'asc' ? valueA - valueB : valueB - valueA;
                    } else {
                      return direction === 'asc'
                        ? a.teamName.localeCompare(b.teamName)
                        : b.teamName.localeCompare(a.teamName);
                    }
                  });
                }

                // 각 팀 내의 상담사 정렬
                group.teamInfo.forEach(team => {
                  if (team.counselorInfo && team.counselorInfo.length > 0) {
                    if (nodeType === 'all' || nodeType === 'counselor') {
                      team.counselorInfo.sort((a, b) => {
                        if (type === 'id') {
                          const valueA = parseInt(a.counselorId) || 0;
                          const valueB = parseInt(b.counselorId) || 0;
                          return direction === 'desc' ? valueB - valueA : valueA - valueB;
                        } else {
                          return direction === 'desc'
                            ? (b.counselorname || '').localeCompare(a.counselorname || '')
                            : (a.counselorname || '').localeCompare(b.counselorname || '');
                        }
                      });
                    }

                    // 🌟 각 상담사의 스킬 정렬 (스킬 정보 보존)
                    team.counselorInfo.forEach(counselor => {
                      if (counselor.assignedSkills && counselor.assignedSkills.length > 0) {
                        counselor.assignedSkills.sort((a: ISkill, b: ISkill) => {
                          return a.skillName.localeCompare(b.skillName);
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
    /*
    console.log('🔍 정렬 후 데이터 확인:', {
      orgCount: clonedData.length,
      firstOrgHasSkills: clonedData[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
    });
    */

    return clonedData;
  }, [sortOption, tenant_id]);

  // 🌟 Window 상태 업데이트 콜백 함수들 - 스킬 정보 보존
  const updateSidebarCallback = useCallback((updatedData: any) => {
    
    if (updatedData?.organizationList) {
      // console.log('🔍 업데이트된 데이터의 스킬 정보 확인:', {
      //   orgCount: updatedData.organizationList.length,
      //   firstOrgHasSkills: updatedData.organizationList[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
      // });

      // 정렬 적용 후 상태 업데이트 (스킬 정보 보존)
      const sorted = applySorting([...updatedData.organizationList]);
      setSortedData(sorted);

      // 상담사 목록 업데이트
      const counselors = getAllCounselorsFromFilteredData(sorted);
      setAllCounselors(counselors);

      dataVersionRef.current += 1;
      // console.log(`✅ UI 업데이트 완료 (버전: ${dataVersionRef.current})`);
    } else {
      // console.warn('⚠️ 업데이트된 데이터에 organizationList가 없습니다:', updatedData);
    }
  }, [applySorting]);

  const setExpandedNodesCallback = useCallback((nodes: Set<string>) => {
    // console.log('🔄 Window 콜백으로 확장 노드 상태 업데이트:', nodes.size);
    setExpandedNodes(nodes);
  }, []);

  const setSelectedNodeCallback = useCallback((nodeId?: string) => {
    // console.log('🔄 Window 콜백으로 선택된 노드 상태 업데이트:', nodeId);
    setSelectedNodeId(nodeId);
  }, []);

  // 🌟 컴포넌트 마운트 시 Window 상태 초기화
  useEffect(() => {
    if (data?.organizationList && !isInitializedRef.current) {
      // console.log('🌟 Window 상태 초기화 시작');
      /* console.log('🔍 초기 데이터의 스킬 정보 확인:', {
        orgCount: data.organizationList.length,
        firstOrgHasSkills: data.organizationList[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
      });
      */

      // Window 상태 초기화
      WindowStateUtils.initTreeState(tenant_id.toString(), data);

      // 콜백 함수들 등록
      WindowStateUtils.registerCallbacks({
        updateSidebarCallback,
        setExpandedNodesCallback,
        setSelectedNodeCallback
      });

      isInitializedRef.current = true;
      // console.log('✅ Window 상태 초기화 완료');
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (isInitializedRef.current) {
        // console.log('🧹 Window 상태 정리');
        WindowStateUtils.cleanup();
        isInitializedRef.current = false;
      }
    };
  }, [data, tenant_id, updateSidebarCallback, setExpandedNodesCallback, setSelectedNodeCallback]);

  // 🌟 데이터 로드 시 초기화 작업 + Window 상태 업데이트
  useEffect(() => {
    if (data?.organizationList) {
      // console.log('📊 데이터 로드됨, 초기화 작업 시작');
      /* console.log('🔍 로드된 데이터의 스킬 정보 확인:', {
        orgCount: data.organizationList.length,
        firstOrgHasSkills: data.organizationList[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
      });
      */

      // Window 상태 업데이트
      const currentState = WindowStateUtils.getCurrentState();
      if (currentState) {
        currentState.sidebarData = data;
        // console.log('🔄 Window 사이드바 데이터 업데이트');
      }

      // 기본 확장 상태 적용
      applyDefaultExpansion();

      // 필터링 및 정렬 적용한 데이터
      const sorted = applySorting([...data.organizationList]);

      // 모든 상담사 정보 추출
      const counselors = getAllCounselorsFromFilteredData(sorted);
      setAllCounselors(counselors);

      setSortedData(sorted);
      dataVersionRef.current += 1;

      // console.log(`✅ 초기화 작업 완료 (버전: ${dataVersionRef.current})`);
    }
  }, [data, tenant_id, applySorting]);

  // 필터링된 데이터에서 상담사 목록 추출
  const getAllCounselorsFromFilteredData = (filteredData: IOrganization[]) => {
    const counselors: Array<{
      counselorId: string;
      counselorName: string;
      tenantId: string;
    }> = [];

    filteredData.forEach(org => {
      org.tenantInfo?.forEach(tenant => {
        tenant.groupInfo?.forEach(group => {
          group.teamInfo?.forEach(team => {
            team.counselorInfo?.forEach(counselor => {
              counselors.push({
                counselorId: counselor.counselorId,
                counselorName: counselor.counselorname,
                tenantId: tenant.tenantId
              });
            });
          });
        });
      });
    });

    return counselors;
  };

  // 🌟 정렬 옵션 변경 시 데이터 재정렬 + Window 상태 업데이트
  useEffect(() => {
    if (data?.organizationList) {
      // console.log('🔄 정렬 옵션 변경, 데이터 재정렬');
      const sorted = applySorting([...data.organizationList]);
      setSortedData(sorted);

      // Window 상태도 업데이트 (스킬 정보 보존)
      const currentState = WindowStateUtils.getCurrentState();
      if (currentState) {
        currentState.sidebarData = { ...data, organizationList: sorted };
        // console.log('🔄 Window 상태 업데이트 (정렬 반영)');
      }
    }
  }, [sortOption, data, tenant_id, applySorting]);

  // 확장 레벨 변경 시 노드 확장 상태 업데이트
  useEffect(() => {
    if (data?.organizationList && currentExpansionLevel > 0) {
      expandToLevel(currentExpansionLevel);
    }
  }, [currentExpansionLevel, data, tenant_id]);

  // 기본 확장 상태를 적용하는 함수
  const applyDefaultExpansion = () => {
    if (!data?.organizationList) return;

    const initialExpanded = new Set<string>();

    data.organizationList.forEach(org => {
      if (defaultExpanded.organization) {
        initialExpanded.add(`org-${org.centerId}`);
      }

      org.tenantInfo?.forEach(tenant => {
        if ((tenant_id === 0 || tenant.tenantId === tenant_id.toString()) && defaultExpanded.tenant) {
          initialExpanded.add(`tenant-${tenant.tenantId}`);

          tenant.groupInfo?.forEach(group => {
            if (defaultExpanded.group) {
              initialExpanded.add(`group-${group.groupId}`);
            }

            group.teamInfo?.forEach(team => {
              if (defaultExpanded.team) {
                initialExpanded.add(`team-${team.teamId}`);
              }

              // 상담사 기본 확장 (필요한 경우)
              if (defaultExpanded.counselor) {
                team.counselorInfo?.forEach(counselor => {
                  initialExpanded.add(counselor.counselorId);
                });
              }
            });
          });
        }
      });
    });

    setExpandedNodes(initialExpanded);
    // Window 상태도 업데이트
    WindowStateUtils.updateExpandedNodes(initialExpanded);
    storeExpandToLevel(4); // 팀 레벨까지 기본 확장
  };

  // 특정 레벨까지만 노드 열기 함수
  const expandToLevel = (level: number) => {
    if (!data?.organizationList) return;

    const newExpanded = new Set<string>();

    data.organizationList.forEach(org => {
      // 레벨 1: 조직
      const orgId = `org-${org.centerId}`;
      if (level >= 1) newExpanded.add(orgId);

      if (level >= 2 && org.tenantInfo) {
        // 레벨 2: 테넌트
        org.tenantInfo.forEach(tenant => {
          if (tenant_id === 0 || tenant.tenantId === tenant_id.toString()) {
            const tenantId = `tenant-${tenant.tenantId}`;
            newExpanded.add(tenantId);

            if (level >= 3 && tenant.groupInfo) {
              // 레벨 3: 그룹
              tenant.groupInfo.forEach(group => {
                const groupId = `group-${group.groupId}`;
                newExpanded.add(groupId);

                if (level >= 4 && group.teamInfo) {
                  // 레벨 4: 팀
                  group.teamInfo.forEach(team => {
                    const teamId = `team-${team.teamId}`;
                    newExpanded.add(teamId);

                    if (level >= 5 && team.counselorInfo) {
                      // 레벨 5: 상담사
                      team.counselorInfo.forEach(counselor => {
                        const counselorId = counselor.counselorId;
                        newExpanded.add(counselorId);

                        if (level >= 6 && counselor.assignedSkills) {
                          // 레벨 6: 스킬 (모든 스킬 확장하지 않음, 개별적으로 열어야 함)
                          // 필요시 여기에 스킬 확장 로직 추가
                        }
                      });
                    }
                  });
                }
              });
            }
          }
        });
      }
    });

    setExpandedNodes(newExpanded);
    // Window 상태도 업데이트
    WindowStateUtils.updateExpandedNodes(newExpanded);
  };

  // 전체 열기/닫기 함수
  const toggleAllNodes = (isExpanded: boolean) => {
    if (!data?.organizationList) return;

    if (isExpanded) {
      // 모든 레벨 열기 (레벨 6까지 - 스킬 포함)
      expandToLevel(6);
      storeExpandToLevel(6);
    } else {
      // 모든 노드 닫기
      const emptySet = new Set<string>();
      setExpandedNodes(emptySet);
      WindowStateUtils.updateExpandedNodes(emptySet);
      storeExpandToLevel(1);
    }
  };

  const handleNodeToggle = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      // Window 상태도 업데이트
      WindowStateUtils.updateExpandedNodes(next);
      return next;
    });
  };

  const handleSearch = () => {
    // 검색어가 비어있으면 전체 목록 표시
    if (!searchTerm.trim()) {
      selectCounselor('', '', '');
      return;
    }

    if (!data?.organizationList) return;

    // 필터링된 데이터에서 검색
    const filteredData = applySorting([...data.organizationList]);

    // 이름 또는 ID로 검색
    let counselorInfo = findCounselorInfoInFilteredData(filteredData, searchTerm);

    // 스킬로도 검색
    if (!counselorInfo) {
      counselorInfo = findCounselorBySkill(filteredData, searchTerm);
    }

    if (counselorInfo) {
      selectCounselor(counselorInfo.counselorId, counselorInfo.counselorName, counselorInfo.tenantId);
    } else {
      toast.error("상담사를 찾을 수 없습니다.");
    }
  };

  // 필터링된 데이터에서 상담사 검색
  const findCounselorInfoInFilteredData = (
    filteredData: IOrganization[],
    searchTerm: string
  ) => {
    for (const org of filteredData) {
      for (const tenant of (org.tenantInfo || [])) {
        for (const group of (tenant.groupInfo || [])) {
          for (const team of (group.teamInfo || [])) {
            for (const counselor of (team.counselorInfo || [])) {
              if (
                counselor.counselorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                counselor.counselorname.toLowerCase().includes(searchTerm.toLowerCase())
              ) {
                return {
                  counselorId: counselor.counselorId,
                  counselorName: counselor.counselorname,
                  tenantId: tenant.tenantId,
                  paths: [
                    `org-${org.centerId}`,
                    `tenant-${tenant.tenantId}`,
                    `group-${group.groupId}`,
                    `team-${team.teamId}`
                  ]
                };
              }
            }
          }
        }
      }
    }
    return null;
  };

  // 스킬로 상담사 찾기 함수
  const findCounselorBySkill = (filteredData: IOrganization[], searchTerm: string) => {
    for (const org of filteredData) {
      for (const tenant of (org.tenantInfo || [])) {
        for (const group of (tenant.groupInfo || [])) {
          for (const team of (group.teamInfo || [])) {
            for (const counselor of (team.counselorInfo || [])) {
              const hasSkill = counselor.assignedSkills?.some((skill: ISkill) =>
                skill.skillName.toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (hasSkill) {
                return {
                  counselorId: counselor.counselorId,
                  counselorName: counselor.counselorname,
                  tenantId: tenant.tenantId,
                  paths: [
                    `org-${org.centerId}`,
                    `tenant-${tenant.tenantId}`,
                    `group-${group.groupId}`,
                    `team-${team.teamId}`
                  ]
                };
              }
            }
          }
        }
      }
    }
    return null;
  };

  const selectCounselor = (counselorId: string, counselorName: string, tenantId: string) => {
    // 빈 ID가 전달되면 전체 목록 표시 모드로 설정
    if (!counselorId) {
      setSelectedNodeId(undefined);
      WindowStateUtils.updateSelectedNode(undefined);
      setSelectedCounselor('', '', '');
      applyDefaultExpansion();
      return;
    }

    // 상담사 선택 상태 업데이트
    setSelectedNodeId(counselorId);
    WindowStateUtils.updateSelectedNode(counselorId);
    setSelectedCounselor(counselorId, counselorName, tenantId);

    if (data?.organizationList) {
      // 필터링된 데이터에서 경로 찾기
      const filteredData = applySorting([...data.organizationList]);
      const counselorInfo = findCounselorInfoInFilteredData(filteredData, counselorName);

      if (counselorInfo) {
        // 경로상의 모든 노드 확장
        const newExpanded = new Set(expandedNodes);
        counselorInfo.paths.forEach(path => newExpanded.add(path));
        // 상담사 노드도 확장 (스킬을 보기 위해)
        newExpanded.add(counselorId);
        setExpandedNodes(newExpanded);
        WindowStateUtils.updateExpandedNodes(newExpanded);

        // DOM 업데이트를 위한 짧은 지연 후 스크롤 실행
        setTimeout(() => {
          const scrollContainer = document.querySelector('.tree-node');
          const targetElement = document.getElementById(`counselor-${counselorId}`);

          if (scrollContainer && targetElement) {
            scrollContainer.scrollTop = (
              targetElement.offsetTop -
              (scrollContainer as HTMLElement).offsetTop -
              (scrollContainer.clientHeight / 2) +
              (targetElement.clientHeight / 2)
            );
          }
        }, 100);
      }
    }
  };

  // 🌟 로딩 상태일 때 스켈레톤 표시
  if (isLoading) {
    return <SkeletonForTreeMenuForCounselor type="full" />;
  }

  // 🌟 데이터가 없거나 빈 경우에도 스켈레톤 표시
  if (!data?.organizationList || data.organizationList.length === 0) {
    return <SkeletonForTreeMenuForCounselor type="partial" />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b">
        <div className="flex-grow">
          <SearchBarForSideMenuForCounselorTab
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
            placeholder="상담사 또는 스킬"
            counselors={allCounselors}
            onSelectCounselor={selectCounselor}
          />
        </div>
        <div className="py-1 px-1">
          <CounselorTreeLevelSelector
            onExpandToLevel={(level) => {
              expandToLevel(level);
              storeExpandToLevel(level);
            }}
            onToggleAllNodes={toggleAllNodes}
            onApplyDefaultExpansion={applyDefaultExpansion}
          />
        </div>
      </div>

      <div className="flex flex-grow overflow-y-auto min-h-0 tree-node">
        <div className="w-full">
          {sortedData.map((org) => (
            <TreeNodeForCounselorListForSideBar
              key={`org-${org.centerId}`}
              data={org}
              type="organization"
              level={0}
              expandedNodes={expandedNodes}
              selectedNodeId={selectedNodeId}
              onNodeToggle={handleNodeToggle}
              onNodeSelect={(nodeId) => {
                setSelectedNodeId(nodeId);
                WindowStateUtils.updateSelectedNode(nodeId);
              }}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      </div>

      {/* 🌟 개발용 디버그 정보 */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 border-t">
          데이터 버전: {dataVersionRef.current} | 
          확장된 노드: {expandedNodes.size}개 | 
          선택된 노드: {selectedNodeId || 'none'} |
          Window 상태: {WindowStateUtils.getCurrentState() ? 'OK' : 'None'} |
          스킬 정보: {sortedData[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0}개
        </div>
      )} */}
    </div>
  );
}