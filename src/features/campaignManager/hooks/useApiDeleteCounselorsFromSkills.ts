// // // src/features/campaignManager/hooks/useApiDeleteCounselorsFromSkills.ts
// // import { useMutation, useQueryClient } from '@tanstack/react-query';
// // import { CounselorSkillAssignmentResponse, CounselorSkillApiError } from '../types/typeForCounselorSkill';
// // import { apiForDeleteCounselorsForSpecificSkill } from '../api/apiForCounselorSkil';
// // import { useAgentSkillStatusStore } from '@/store/agenSkillStatusStore';


// // interface DeleteCounselorsFromSkillsParams {
// //   skillIds: number[];
// //   counselorIds: string[];
// //   tenantId: string;
// //   concurrentLimit?: number;
// // }

// // interface BatchDeleteResult {
// //   success: boolean;
// //   successCount: number;
// //   failedSkills: number[];
// //   error?: Error;
// // }

// // /**
// //  * 여러 스킬에서 여러 상담사을 한 번에 해제하는 커스텀 훅
// //  */
// // export function useApiDeleteCounselorsFromSkills(tenantId: string) {
// //   const queryClient = useQueryClient();

// //   const {setAgentSkillStatus} = useAgentSkillStatusStore();

// //   // 배치 처리 유틸리티 함수
// //   const processBatchDeletion = async ({
// //     skillIds,
// //     counselorIds,
// //     concurrentLimit = 3
// //   }: Omit<DeleteCounselorsFromSkillsParams, 'tenantId'>) => {
// //     // 결과 추적용 객체
// //     const result: BatchDeleteResult = {
// //       success: true,
// //       successCount: 0,
// //       failedSkills: []
// //     };

// //     try {
// //       // 여러 스킬을 동시에 처리하되 concurrentLimit 만큼씩 분할 처리
// //       for (let i = 0; i < skillIds.length; i += concurrentLimit) {
// //         const batch = skillIds.slice(i, i + concurrentLimit);
        
// //         // 현재 배치의 요청들을 병렬로 처리
// //         const promises = batch.map(skillId => 
// //           apiForDeleteCounselorsForSpecificSkill(skillId, counselorIds)
// //             .then(() => {
// //               result.successCount++;
// //               return true;
// //             })
// //             .catch(error => {
// //               console.error(`스킬 ID ${skillId} 해제 실패:`, error);
// //               result.failedSkills.push(skillId);
// //               result.success = false;
// //               return false;
// //             })
// //         );
        
// //         // 현재 배치의 모든 요청 완료 대기
// //         await Promise.all(promises);
// //       }
      
// //       return result;
// //     } catch (error) {
// //       console.error("배치 스킬 해제 중 오류 발생:", error);
// //       result.success = false;
// //       result.error = error instanceof Error ? error : new Error(String(error));
// //       return result;
// //     }
// //   };

// //   return useMutation<BatchDeleteResult, Error, DeleteCounselorsFromSkillsParams>({
// //     mutationKey: ['deleteCounselorsFromSkills', tenantId],
// //     mutationFn: async (params) => {
// //       return processBatchDeletion({
// //         skillIds: params.skillIds,
// //         counselorIds: params.counselorIds,
// //         concurrentLimit: params.concurrentLimit
// //       });
// //     },
// //     onSuccess: () => {
// //       // 스킬 관련 쿼리 캐시 무효화
// //       queryClient.invalidateQueries({
// //         queryKey: ['counselorSkills', tenantId]
// //       });
      
// //       // 상담사 관련 쿼리 캐시 무효화
// //       queryClient.invalidateQueries({
// //         queryKey: ['counselorList', tenantId]
// //       });
      
// //       // 할당된 스킬 목록 쿼리 캐시 무효화
// //       queryClient.invalidateQueries({
// //         queryKey: ['assignedSkills', tenantId]
// //       });

// //       // 다른 컴포넌트에 알리기위한 상담사 스킬 변경 상태
// //       setAgentSkillStatus(true);

// //     }
// //   });
// // }

// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiForDeleteCounselorsForSpecificSkill } from '../api/apiForCounselorSkil';
// import { useAgentSkillStatusStore } from '@/store/agenSkillStatusStore';

// // Window 객체에 저장할 타입 정의
// declare global {
//   interface Window {
//     __COUNSELOR_TREE_STATE__?: {
//       tenantId: string;
//       sidebarData: any;
//       expandedNodes: Set<string>;
//       selectedNodeId?: string;
//       updateSidebarCallback?: (updatedData: any) => void;
//       setExpandedNodesCallback?: (nodes: Set<string>) => void;
//       setSelectedNodeCallback?: (nodeId?: string) => void;
//     };
//   }
// }

// interface DeleteCounselorsFromSkillsParams {
//   skillIds: number[];
//   counselorIds: string[];
//   tenantId: string;
// }

// interface BatchDeleteResult {
//   success: boolean;
//   successCount: number;
//   failedSkills: number[];
//   error?: Error;
// }

// /**
//  * 🌟 Window 객체를 활용한 스킬 삭제 훅
//  * TreeMenus에서 설정한 window 상태를 활용해서 더 안정적인 UI 업데이트
//  */
// export function useApiDeleteCounselorsFromSkills(tenantId: string) {
//   const queryClient = useQueryClient();
//   const { setAgentSkillStatus } = useAgentSkillStatusStore();

//   // Window 상태 초기화 함수
//   const initWindowState = () => {
//     if (!window.__COUNSELOR_TREE_STATE__) {
//       window.__COUNSELOR_TREE_STATE__ = {
//         tenantId: tenantId,
//         sidebarData: null,
//         expandedNodes: new Set(),
//         selectedNodeId: undefined
//       };
//     }
//   };

//   // Window 상태에서 현재 데이터 가져오기
//   const getCurrentWindowState = () => {
//     initWindowState();
//     return window.__COUNSELOR_TREE_STATE__!;
//   };

//   // 실제 API 호출 함수
//   const deleteSkills = async ({ skillIds, counselorIds }: Omit<DeleteCounselorsFromSkillsParams, 'tenantId'>) => {
//     console.log('🚀 Window 기반 API 호출 시작:', { skillIds, counselorIds, tenantId });
    
//     const results = await Promise.allSettled(
//       skillIds.map(skillId => 
//         apiForDeleteCounselorsForSpecificSkill(skillId, counselorIds)
//           .then(response => {
//             console.log(`✅ 스킬 ${skillId} 삭제 성공`, response);
//             return { skillId, success: true, response };
//           })
//           .catch(error => {
//             console.error(`❌ 스킬 ${skillId} 삭제 실패:`, error);
//             return { skillId, success: false, error };
//           })
//       )
//     );

//     const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
//     const failedSkills = results
//       .filter(r => r.status === 'fulfilled' && !r.value.success)
//       .map(r => (r as any).value.skillId);

//     console.log('🏁 API 호출 완료:', { successCount, failedSkills });

//     return {
//       success: successCount > 0,
//       successCount,
//       failedSkills,
//       error: failedSkills.length > 0 ? new Error(`${failedSkills.length}개 스킬 삭제 실패`) : undefined
//     };
//   };

//   // Window 데이터에서 스킬 제거하는 함수 - 스킬 정보 보존 강화
//   const removeSkillsFromWindowData = (skillIds: number[], counselorIds: string[]) => {
//     const windowState = getCurrentWindowState();
    
//     if (!windowState.sidebarData?.organizationList) {
//       console.warn('🔍 Window에 사이드바 데이터가 없습니다');
//       return null;
//     }

//     console.log('🔍 Window 데이터에서 스킬 제거 시작:', { skillIds, counselorIds });
//     console.log('🔍 제거 전 데이터 구조 확인:', {
//       orgCount: windowState.sidebarData.organizationList.length,
//       firstCounselorSkills: windowState.sidebarData.organizationList[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
//     });
    
//     // 깊은 복사로 데이터 보존
//     const newData = JSON.parse(JSON.stringify(windowState.sidebarData));
//     let removedCount = 0;
//     let totalSkillsChecked = 0;
    
//     newData.organizationList.forEach((org: any) => {
//       org.tenantInfo?.forEach((tenant: any) => {
//         tenant.groupInfo?.forEach((group: any) => {
//           group.teamInfo?.forEach((team: any) => {
//             team.counselorInfo?.forEach((counselor: any) => {
//               // 모든 상담사의 스킬 정보 확인
//               if (counselor.assignedSkills) {
//                 totalSkillsChecked += counselor.assignedSkills.length;
//               }
              
//               // 해당 상담사의 스킬만 선택적으로 제거
//               if (counselorIds.includes(counselor.counselorId)) {
//                 const beforeCount = counselor.assignedSkills?.length || 0;
                
//                 if (counselor.assignedSkills && Array.isArray(counselor.assignedSkills)) {
//                   counselor.assignedSkills = counselor.assignedSkills.filter(
//                     (skill: any) => !skillIds.includes(Number(skill.skillId))
//                   );
//                 } else {
//                   // assignedSkills가 없으면 빈 배열로 초기화
//                   counselor.assignedSkills = [];
//                 }
                
//                 const afterCount = counselor.assignedSkills.length;
//                 const removed = beforeCount - afterCount;
                
//                 if (removed > 0) {
//                   console.log(`🔍 상담사 ${counselor.counselorId} (${counselor.counselorname}): ${beforeCount} → ${afterCount} (${removed}개 제거)`);
//                   removedCount += removed;
//                 }
//               }
//             });
//           });
//         });
//       });
//     });

//     console.log(`🔍 스킬 제거 완료:`, {
//       removedCount,
//       totalSkillsChecked,
//       remainingSkills: totalSkillsChecked - removedCount
//     });
    
//     console.log('🔍 제거 후 데이터 구조 확인:', {
//       orgCount: newData.organizationList.length,
//       firstCounselorSkills: newData.organizationList[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
//     });
    
//     return newData;
//   };

//   // Window 상태 업데이트 함수 - 스킬 정보 보존 강화
//   const updateWindowState = (updatedData: any) => {
//     const windowState = getCurrentWindowState();
    
//     if (!updatedData) {
//       console.warn('⚠️ 업데이트할 데이터가 없습니다');
//       return;
//     }
    
//     console.log('🔄 Window 상태 업데이트:', {
//       hasOrgList: !!updatedData.organizationList,
//       orgCount: updatedData.organizationList?.length || 0,
//       firstCounselorSkills: updatedData.organizationList?.[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
//     });
    
//     windowState.sidebarData = updatedData;
    
//     // TreeMenus에서 설정한 콜백이 있으면 호출
//     if (windowState.updateSidebarCallback) {
//       console.log('🔄 TreeMenus 콜백으로 UI 업데이트');
//       try {
//         windowState.updateSidebarCallback(updatedData);
//       } catch (error) {
//         console.error('💥 콜백 호출 중 에러:', error);
//       }
//     } else {
//       console.warn('⚠️ updateSidebarCallback이 등록되지 않았습니다');
//     }
//   };

//   return useMutation<BatchDeleteResult, Error, DeleteCounselorsFromSkillsParams>({
//     mutationKey: ['deleteCounselorsFromSkills', tenantId],
    
//     // 🎯 Window 기반 낙관적 업데이트 - 스킬 정보 보존 강화
//     onMutate: async (variables) => {
//       console.log('🎨 Window 기반 낙관적 업데이트 시작:', variables);
      
//       try {
//         const windowState = getCurrentWindowState();
        
//         // 현재 Window 데이터 백업 (스킬 정보 포함)
//         const previousData = windowState.sidebarData ? 
//           JSON.parse(JSON.stringify(windowState.sidebarData)) : null;
        
//         console.log('🔍 Window 상태 확인:', {
//           hasData: !!windowState.sidebarData,
//           hasOrgList: !!windowState.sidebarData?.organizationList,
//           expandedCount: windowState.expandedNodes.size,
//           selectedNode: windowState.selectedNodeId,
//           totalSkills: windowState.sidebarData?.organizationList?.reduce((total: number, org: any) => {
//             return total + (org.tenantInfo?.reduce((orgTotal: number, tenant: any) => {
//               return orgTotal + (tenant.groupInfo?.reduce((tenantTotal: number, group: any) => {
//                 return tenantTotal + (group.teamInfo?.reduce((groupTotal: number, team: any) => {
//                   return groupTotal + (team.counselorInfo?.reduce((teamTotal: number, counselor: any) => {
//                     return teamTotal + (counselor.assignedSkills?.length || 0);
//                   }, 0) || 0);
//                 }, 0) || 0);
//               }, 0) || 0);
//             }, 0) || 0);
//           }, 0) || 0
//         });
        
//         // 낙관적으로 Window 데이터 업데이트
//         if (windowState.sidebarData) {
//           const optimisticData = removeSkillsFromWindowData(
//             variables.skillIds, 
//             variables.counselorIds
//           );
          
//           if (optimisticData) {
//             updateWindowState(optimisticData);
//             console.log('✅ Window 기반 UI 즉시 업데이트 완료');
//           } else {
//             console.warn('⚠️ 낙관적 업데이트 데이터 생성 실패');
//           }
//         } else {
//           console.warn('⚠️ Window에 사이드바 데이터가 없어 낙관적 업데이트 스킵');
//         }
        
//         // 캐시도 같이 업데이트 (안전장치)
//         const SIDEBAR_CACHE_KEY = ['counselorList', tenantId];
//         await queryClient.cancelQueries({ queryKey: SIDEBAR_CACHE_KEY });
        
//         const previousCacheData = queryClient.getQueryData(SIDEBAR_CACHE_KEY);
//         if (previousCacheData && windowState.sidebarData) {
//           queryClient.setQueryData(SIDEBAR_CACHE_KEY, windowState.sidebarData);
//           console.log('🔄 캐시도 낙관적 업데이트 완료');
//         }
        
//         return { previousData, previousCacheData };
        
//       } catch (error) {
//         console.error('💥 onMutate 에러:', error);
//         return { previousData: null, previousCacheData: null };
//       }
//     },
      
//     // 🔥 실제 API 호출
//     mutationFn: deleteSkills,

//     // ✅ 성공 시 - 스킬 정보 보존 강화
//     onSuccess: (result, variables, context) => {
//       console.log('🎉 삭제 성공:', result);
      
//       try {
//         if (result.success) {
//           console.log('🔄 캐시 무효화 시작...');
          
//           // 캐시 무효화 및 리페치
//           queryClient.invalidateQueries({ queryKey: ['counselorList', tenantId] });
//           queryClient.refetchQueries({ queryKey: ['counselorList', tenantId] });
          
//           // 다른 컴포넌트에 알리기
//           setAgentSkillStatus(true);
          
//           console.log('✅ 캐시 무효화 및 리페치 완료');
          
//           // 🔄 Window 상태도 최신 데이터로 업데이트 (3초 후)
//           setTimeout(() => {
//             console.log('🔄 Window 상태 최신화');
//             queryClient.refetchQueries({ queryKey: ['counselorList', tenantId] })
//               .then(() => {
//                 const latestData = queryClient.getQueryData(['counselorList', tenantId]);
//                 if (latestData) {
//                   console.log('🔍 최신 데이터 스킬 정보 확인:', {
//                     orgCount: (latestData as any).organizationList?.length || 0,
//                     firstCounselorSkills: (latestData as any).organizationList?.[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
//                   });
//                   updateWindowState(latestData);
//                 } else {
//                   console.warn('⚠️ 최신 데이터를 가져올 수 없습니다');
//                 }
//               })
//               .catch(error => {
//                 console.error('💥 Window 상태 최신화 중 에러:', error);
//               });
//           }, 3000);
//         }
//       } catch (error) {
//         console.error('💥 onSuccess 처리 중 에러:', error);
//       }
//     },

//     // ❌ 실패 시 롤백
//     onError: (error, variables, context: unknown) => {
//       console.error('💥 삭제 실패, 롤백 시작:', error);
      
//       const ctx = context as { previousData?: any; previousCacheData?: any } | undefined;
      
//       try {
//         if (ctx?.previousData) {
//           updateWindowState(ctx.previousData);
//           console.log('🔄 Window 데이터 롤백 완료');
//         }
        
//         if (ctx?.previousCacheData) {
//           queryClient.setQueryData(['counselorList', tenantId], ctx.previousCacheData);
//           console.log('🔄 캐시 데이터 롤백 완료');
//         }
//       } catch (rollbackError) {
//         console.error('💥 롤백 중 에러:', rollbackError);
//       }
//     },

//     // 🏁 완료 - 최종 안전장치 강화
//     onSettled: (data, error, variables, context) => {
//       console.log('🏁 Mutation 완료:', { 
//         success: data?.success, 
//         hasError: !!error,
//         variables 
//       });
      
//       // 최종 안전장치: 5초 후 Window와 캐시 동기화
//       setTimeout(() => {
//         console.log('🔄 최종 안전장치 - Window와 캐시 동기화');
//         queryClient.refetchQueries({ queryKey: ['counselorList', tenantId] })
//           .then(() => {
//             const latestData = queryClient.getQueryData(['counselorList', tenantId]);
//             if (latestData) {
//               console.log('🔍 최종 동기화 데이터 스킬 정보 확인:', {
//                 orgCount: (latestData as any).organizationList?.length || 0,
//                 firstCounselorSkills: (latestData as any).organizationList?.[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
//               });
//               updateWindowState(latestData);
//               console.log('✅ 최종 Window-캐시 동기화 완료');
//             } else {
//               console.warn('⚠️ 최종 동기화용 데이터를 가져올 수 없습니다');
//             }
//           })
//           .catch(error => {
//             console.error('💥 최종 동기화 중 에러:', error);
//           });
//       }, 5000);
//     }
//   });
// }

// // Window 상태 관리를 위한 유틸리티 함수들 - 스킬 정보 보존 강화
// export const WindowStateUtils = {
//   // TreeMenus에서 초기 상태 설정 - 스킬 정보 포함
//   initTreeState: (tenantId: string, initialData: any) => {
//     console.log('🌟 Window Tree State 초기화 시작:', {
//       tenantId,
//       hasData: !!initialData,
//       hasOrgList: !!initialData?.organizationList,
//       orgCount: initialData?.organizationList?.length || 0,
//       firstCounselorSkills: initialData?.organizationList?.[0]?.tenantInfo?.[0]?.groupInfo?.[0]?.teamInfo?.[0]?.counselorInfo?.[0]?.assignedSkills?.length || 0
//     });
    
//     window.__COUNSELOR_TREE_STATE__ = {
//       tenantId,
//       sidebarData: initialData,
//       expandedNodes: new Set(),
//       selectedNodeId: undefined
//     };
//     console.log('🌟 Window Tree State 초기화 완료');
//   },

//   // TreeMenus에서 콜백 함수들 등록
//   registerCallbacks: (callbacks: {
//     updateSidebarCallback?: (data: any) => void;
//     setExpandedNodesCallback?: (nodes: Set<string>) => void;
//     setSelectedNodeCallback?: (nodeId?: string) => void;
//   }) => {
//     if (window.__COUNSELOR_TREE_STATE__) {
//       Object.assign(window.__COUNSELOR_TREE_STATE__, callbacks);
//       console.log('🔗 Window 콜백 함수들 등록 완료');
//     } else {
//       console.warn('⚠️ Window Tree State가 초기화되지 않았습니다');
//     }
//   },

//   // 확장된 노드 상태 업데이트
//   updateExpandedNodes: (nodes: Set<string>) => {
//     if (window.__COUNSELOR_TREE_STATE__) {
//       window.__COUNSELOR_TREE_STATE__.expandedNodes = nodes;
//       console.log(`🔄 확장된 노드 상태 업데이트: ${nodes.size}개`);
//     }
//   },

//   // 선택된 노드 상태 업데이트
//   updateSelectedNode: (nodeId?: string) => {
//     if (window.__COUNSELOR_TREE_STATE__) {
//       window.__COUNSELOR_TREE_STATE__.selectedNodeId = nodeId;
//       console.log(`🔄 선택된 노드 상태 업데이트: ${nodeId || 'none'}`);
//     }
//   },

//   // 현재 상태 가져오기
//   getCurrentState: () => {
//     return window.__COUNSELOR_TREE_STATE__;
//   },

//   // 상태 정리
//   cleanup: () => {
//     delete window.__COUNSELOR_TREE_STATE__;
//     console.log('🧹 Window Tree State 정리 완료');
//   }
// };

declare global {
  interface Window {
    __COUNSELOR_TREE_STATE__?: {
      tenantId: string;
      sidebarData: any;
      expandedNodes: Set<string>;
      selectedNodeId?: string;
      updateSidebarCallback?: (updatedData: any) => void;
      setExpandedNodesCallback?: (nodes: Set<string>) => void;
      setSelectedNodeCallback?: (nodeId?: string) => void;
    };
  }
}

import { useMutation } from '@tanstack/react-query';
import { apiForDeleteCounselorsForSpecificSkill } from '../api/apiForCounselorSkil';
import { useAgentSkillStatusStore } from '@/store/agenSkillStatusStore';

// Window 객체에 저장할 타입 정의

interface DeleteCounselorsFromSkillsParams {
  skillIds: number[];
  counselorIds: string[];
  tenantId: string;
}

interface BatchDeleteResult {
  success: boolean;
  successCount: number;
  failedSkills: number[];
  error?: Error;
}

/**
 * 🌟 간단한 Window 기반 스킬 삭제 훅
 * 복잡한 캐시 무효화 없이 Window 데이터만 직접 업데이트
 */
export function useApiDeleteCounselorsFromSkills(tenantId: string) {
  const { setAgentSkillStatus } = useAgentSkillStatusStore();

  // 실제 API 호출 함수
  const deleteSkills = async ({ skillIds, counselorIds }: Omit<DeleteCounselorsFromSkillsParams, 'tenantId'>) => {
    console.log('🚀 API 호출 시작:', { skillIds, counselorIds, tenantId });
    
    const results = await Promise.allSettled(
      skillIds.map(skillId => 
        apiForDeleteCounselorsForSpecificSkill(skillId, counselorIds)
          .then(response => {
            console.log(`✅ 스킬 ${skillId} 삭제 성공`);
            return { skillId, success: true, response };
          })
          .catch(error => {
            console.error(`❌ 스킬 ${skillId} 삭제 실패:`, error);
            return { skillId, success: false, error };
          })
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedSkills = results
      .filter(r => r.status === 'fulfilled' && !r.value.success)
      .map(r => (r as any).value.skillId);

    console.log('🏁 API 호출 완료:', { successCount, failedSkills });

    return {
      success: successCount > 0,
      successCount,
      failedSkills,
      error: failedSkills.length > 0 ? new Error(`${failedSkills.length}개 스킬 삭제 실패`) : undefined
    };
  };

  // Window 데이터에서 스킬 제거
  const removeSkillsFromWindow = (skillIds: number[], counselorIds: string[]) => {
    const windowState = window.__COUNSELOR_TREE_STATE__;
    
    if (!windowState?.sidebarData?.organizationList) {
      console.warn('⚠️ Window에 사이드바 데이터가 없습니다');
      return;
    }

    console.log('🔄 Window에서 스킬 제거:', { skillIds, counselorIds });
    
    // 데이터에서 해당 스킬들 제거
    windowState.sidebarData.organizationList.forEach((org: any) => {
      org.tenantInfo?.forEach((tenant: any) => {
        tenant.groupInfo?.forEach((group: any) => {
          group.teamInfo?.forEach((team: any) => {
            team.counselorInfo?.forEach((counselor: any) => {
              if (counselorIds.includes(counselor.counselorId) && counselor.assignedSkills) {
                const before = counselor.assignedSkills.length;
                counselor.assignedSkills = counselor.assignedSkills.filter(
                  (skill: any) => !skillIds.includes(Number(skill.skillId))
                );
                const after = counselor.assignedSkills.length;
                if (before > after) {
                  console.log(`🔄 상담사 ${counselor.counselorId}: ${before - after}개 스킬 제거`);
                }
              }
            });
          });
        });
      });
    });

    // UI 업데이트 콜백 호출
    if (windowState.updateSidebarCallback) {
      windowState.updateSidebarCallback(windowState.sidebarData);
      console.log('✅ UI 업데이트 완료');
    }
  };

  return useMutation<BatchDeleteResult, Error, DeleteCounselorsFromSkillsParams>({
    mutationKey: ['deleteCounselorsFromSkills', tenantId],
    mutationFn: deleteSkills,
    
    onSuccess: (result, variables) => {
      if (result.success) {
        // Window에서 스킬 제거
        removeSkillsFromWindow(variables.skillIds, variables.counselorIds);
        
        // 다른 컴포넌트에 알리기
        setAgentSkillStatus(true);
        
        console.log('🎉 스킬 삭제 및 UI 업데이트 완료');
      }
    },
    
    onError: (error) => {
      console.error('💥 스킬 삭제 실패:', error);
    }
  });
}

// Window 상태 관리 유틸리티 (간단 버전)
export const WindowStateUtils = {
  initTreeState: (tenantId: string, initialData: any) => {
    window.__COUNSELOR_TREE_STATE__ = {
      tenantId,
      sidebarData: initialData,
      expandedNodes: new Set(),
      selectedNodeId: undefined
    };
    // console.log('🌟 Window 상태 초기화 완료');
  },

  registerCallbacks: (callbacks: {
    updateSidebarCallback?: (data: any) => void;
    setExpandedNodesCallback?: (nodes: Set<string>) => void;
    setSelectedNodeCallback?: (nodeId?: string) => void;
  }) => {
    if (window.__COUNSELOR_TREE_STATE__) {
      Object.assign(window.__COUNSELOR_TREE_STATE__, callbacks);
      // console.log('🔗 콜백 등록 완료');
    }
  },

  updateExpandedNodes: (nodes: Set<string>) => {
    if (window.__COUNSELOR_TREE_STATE__) {
      window.__COUNSELOR_TREE_STATE__.expandedNodes = nodes;
    }
  },

  updateSelectedNode: (nodeId?: string) => {
    if (window.__COUNSELOR_TREE_STATE__) {
      window.__COUNSELOR_TREE_STATE__.selectedNodeId = nodeId;
    }
  },

  getCurrentState: () => window.__COUNSELOR_TREE_STATE__,

  cleanup: () => {
    delete window.__COUNSELOR_TREE_STATE__;
    // console.log('🧹 Window 상태 정리 완료');
  }
};