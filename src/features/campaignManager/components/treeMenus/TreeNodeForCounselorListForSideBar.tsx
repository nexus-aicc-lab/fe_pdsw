// "use client";
// import React, { useCallback } from 'react';
// import { UserCircle2 } from "lucide-react";
// import { IContextMenuForTennantForCounselorTreeMenu } from "./ContextMenus/IContextMenuForTennantForCounselorTreeMenu";
// import { IContextMenuForGroupAndTeamAndCounselor } from "./ContextMenus/IContextMenuForGroupAndTeamAndCounselorProps";
// import { useCounselorFilterStore } from "@/store/storeForSideMenuCounselorTab";
// import Image from "next/image";
// import IContextMenuForSkill from './ContextMenus/IContextMenuForSkill';

// interface ExpandConfig {
//   organization?: boolean;
//   tenant?: boolean;
//   group?: boolean;
//   team?: boolean;
//   counselor?: boolean;
//   skill?: boolean;
// }

// interface ISkill {
//   skillId: string;
//   skillName: string;
// }

// interface ITreeNodeForCounselorListForSideBar {
//   data: any;
//   level: number;
//   expandedNodes: Set<string>;
//   selectedNodeId?: string;
//   onNodeToggle: (nodeId: string) => void;
//   onNodeSelect: (nodeId: string) => void;
//   type: 'organization' | 'tenant' | 'group' | 'team' | 'counselor' | 'skill';
//   defaultExpanded: ExpandConfig;
//   parentTenantId?: string;
// }

// export function TreeNodeForCounselorListForSideBar({
//   data,
//   level,
//   expandedNodes,
//   selectedNodeId,
//   onNodeToggle,
//   onNodeSelect,
//   type,
//   defaultExpanded,
//   parentTenantId
// }: ITreeNodeForCounselorListForSideBar) {
//   const { selectedBlendKind, setSelectedCounselor, sortOption } = useCounselorFilterStore();

//   // 현재 노드의 tenantId 결정
//   const currentTenantId = type === 'tenant' ? data.tenantId : parentTenantId;

//   const getCounselorsForNode = () => {
//     switch (type) {
//       case 'counselor':
//         return [{
//           ...data,
//           tenantId: currentTenantId
//         }];
//       case 'skill':
//         return []; // 스킬 노드는 상담사 정보 없음
//       case 'team': {
//         let counselors = data.counselorInfo?.map((counselor: any) => ({
//           type: 'counselor',
//           data: {
//             ...counselor,
//             tenantId: currentTenantId
//           }
//         })) || [];
        
//         if (selectedBlendKind !== null) {
//           counselors = counselors.filter(
//             (counselor: any) => {
//               const blendKind = Number(counselor.data.blendKind);
//               if (selectedBlendKind === 1) {
//                 return blendKind === 1 || blendKind === 3;
//               } else if (selectedBlendKind === 2) {
//                 return blendKind === 2 || blendKind === 3;
//               } else {
//                 return blendKind === selectedBlendKind;
//               }
//             }
//           );
//         }
        
//         counselors.sort((a: { data: { counselorname: string; counselorId: string } }, b: { data: { counselorname: string; counselorId: string } }) => {
//           if (sortOption.type === 'name') {
//             if (a.data.counselorname < b.data.counselorname) return sortOption.direction === 'asc' ? -1 : 1;
//             if (a.data.counselorname > b.data.counselorname) return sortOption.direction === 'asc' ? 1 : -1;
//             return 0;
//           } else {
//             if (a.data.counselorId < b.data.counselorId) return sortOption.direction === 'asc' ? -1 : 1;
//             if (a.data.counselorId > b.data.counselorId) return sortOption.direction === 'asc' ? 1 : -1;
//             return 0;
//           }
//         });
//         return counselors;
//       }
//       case 'group':
//         return data.teamInfo?.reduce((acc: any[], team: any) => {
//           const counselors = team.counselorInfo?.map((counselor: any) => ({
//             ...counselor,
//             tenantId: currentTenantId
//           })) || [];
//           return acc.concat(counselors);
//         }, []) || [];
//       default:
//         return [];
//     }
//   };

//   const getId = () => {
//     switch (type) {
//       case 'organization': return `org-${data.centerId}`;
//       case 'tenant': return `tenant-${data.tenantId}`;
//       case 'group': return `group-${data.groupId}`;
//       case 'team': return `team-${data.teamId}`;
//       case 'counselor': return data.counselorId;
//       case 'skill': return `skill-${data.skillId}`;
//     }
//   };

//   const getLabel = () => {
//     switch (type) {
//       case 'organization': return data.centerName;
//       case 'tenant': return data.tenantName;
//       case 'group': return '[' + data.groupId + ']' + data.groupName;
//       case 'team': return '[' + data.teamId + ']' + data.teamName;
//       case 'counselor': return data.counselorname;
//       case 'skill': return `[${data.skillId}]-${data.skillName}`;
//     }
//   };

//   const getChildren = () => {
//     switch (type) {
//       case 'organization': 
//         return data.tenantInfo?.map((tenant: any) => ({
//           type: 'tenant',
//           data: tenant
//         }));
//       case 'tenant': 
//         return data.groupInfo?.map((group: any) => ({
//           type: 'group',
//           data: {
//             ...group,
//             tenantId: data.tenantId
//           }
//         }));
//       case 'group': 
//         return data.teamInfo?.map((team: any) => ({
//           type: 'team',
//           data: {
//             ...team,
//             tenantId: currentTenantId
//           }
//         }));
//       case 'team': {
//         let counselors = data.counselorInfo?.map((counselor: any) => ({
//           type: 'counselor',
//           data: {
//             ...counselor,
//             tenantId: currentTenantId
//           }
//         })) || [];
        
//         if (selectedBlendKind !== null) {
//           counselors = counselors.filter(
//             (counselor: any) => {
//               const blendKind = Number(counselor.data.blendKind);
//               if (selectedBlendKind === 1) {
//                 return blendKind === 1 || blendKind === 3;
//               } else if (selectedBlendKind === 2) {
//                 return blendKind === 2 || blendKind === 3;
//               } else {
//                 return blendKind === selectedBlendKind;
//               }
//             }
//           );
//         }
        
//         counselors.sort((a: { data: { counselorname: string; counselorId: string } }, b: { data: { counselorname: string; counselorId: string } }) => {
//           if (sortOption.type === 'name') {
//             if (a.data.counselorname < b.data.counselorname) return sortOption.direction === 'asc' ? -1 : 1;
//             if (a.data.counselorname > b.data.counselorname) return sortOption.direction === 'asc' ? 1 : -1;
//             return 0;
//           } else {
//             if (a.data.counselorId < b.data.counselorId) return sortOption.direction === 'asc' ? -1 : 1;
//             if (a.data.counselorId > b.data.counselorId) return sortOption.direction === 'asc' ? 1 : -1;
//             return 0;
//           }
//         });
//         return counselors;
//       }
//       case 'counselor': {
//         // 상담사의 스킬들을 자식 노드로 반환
//         return data.assignedSkills?.map((skill: ISkill) => ({
//           type: 'skill',
//           data: skill
//         })) || [];
//       }
//       case 'skill': 
//         return null; // 스킬은 최하위 노드
//     }
//   };

//   const id = getId();
//   const label = getLabel();
//   const children = getChildren();
//   const hasChildren = children && children.length > 0;
//   const isExpanded = expandedNodes.has(id);
//   const isSelected = selectedNodeId === id;

//   const handleNodeClick = () => {
//     onNodeSelect(id);
//     if (hasChildren) {
//       onNodeToggle(id);
//     }

//     if (type === 'counselor') {
//       const tenantId = data.tenantId || currentTenantId;
//       if (tenantId) {
//         console.log(`상담사 선택: ${data.counselorname}, TenantID: ${tenantId}`);
//         setSelectedCounselor(
//           data.counselorId,
//           data.counselorname,
//           tenantId
//         );
//       } else {
//         console.warn(`상담사 ${data.counselorname}의 tenantId를 찾을 수 없습니다.`);
//       }
//     }

//     if (type === 'skill') {
//       console.log(`스킬 선택: ${data.skillName}`);
//     }

//     console.log(`${type} ${label} 클릭 - TenantID: ${currentTenantId}`);
//     const counselors = getCounselorsForNode();
//     console.log(`${type} 노드의 상담사 목록:`, counselors);
//   };

//   const handleContextMenu = useCallback(() => {
//     onNodeSelect(id);
//   }, [id, onNodeSelect]);

//   const renderIcon = () => {
//     switch (type) {
//       case 'organization':
//         return <Image src="/tree-menu/organization.png" alt="조직" width={14} height={12} />;
//       case 'tenant':
//         return <Image src="/tree-menu/tennant_office.png" alt="테넌트" width={14} height={12} />;
//       case 'group':
//         return <Image src="/tree-menu/group_icon_for_tree.png" alt="그룹" width={15} height={12} />;
//       case 'team':
//         return <Image src="/tree-menu/team_icon_for_tree.png" alt="팀" width={14} height={12} />;
//       case 'counselor':
//         const blendKind = Number(data.blendKind);
//         switch (blendKind) {
//           case 1:
//             return <Image src="/tree-menu/inbound_counselor.png" alt="인바운드" width={15} height={12} />;
//           case 2:
//             return <Image src="/tree-menu/outbound_counselor.png" alt="아웃바운드" width={15} height={12} />;
//           case 3:
//             return <Image src="/tree-menu/inbound_outbound_mix.png" alt="블렌드" width={15} height={12} />;
//           default:
//             return <UserCircle2 className="h-4 w-4 text-gray-600" />;
//         }
//       // case 'skill':
//       //   return <span className="text-blue-500">🔧</span>; // 스킬 아이콘
//       default:
//         return null;
//     }
//   };

//   const renderNodeContent = () => (
//     <div
//       id={type === 'counselor' ? `counselor-${data.counselorId}` : 
//           type === 'skill' ? `skill-${data.skillId}` : undefined}
//       className={`flex items-center hover:bg-[#FFFAEE] px-2 py-0.5 cursor-pointer transition-colors duration-150 text-[#555]
//         ${isSelected ? "bg-[#FFFAEE]" : ""} ${type === 'skill' ? "text-blue-600" : ""}`}
//       onClick={handleNodeClick}
//       onContextMenu={handleContextMenu}
//       style={{ paddingLeft: `${level * 16 + 8}px` }}
//     >
//       <div className="flex items-center w-full gap-2">
//         {hasChildren ? (
//           isExpanded ? (
//             <Image src="/tree-menu/minus_for_tree.png" alt="접기" width={12} height={12} />
//           ) : (
//             <Image src="/tree-menu/plus_icon_for_tree.png" alt="펼치기" width={12} height={12} />
//           )
//         ) : (
//           <span className="w-3" />
//         )}
//         {renderIcon()}
//         <span className={`text-sm ${type === 'skill' ? 'text-blue-600' : 'text-555'} ${isSelected ? "font-medium" : ""}`}>
//           {type === 'counselor' ? `${getLabel()} [${getId()}]` : getLabel()}
//         </span>
//       </div>
//     </div>
//   );

//   const renderWithContextMenu = (content: React.ReactNode) => {
//     // organization 또는 tenant 타입
//     if (type === 'organization' || type === 'tenant') {
//       return (
//         <IContextMenuForTennantForCounselorTreeMenu>
//           {content}
//         </IContextMenuForTennantForCounselorTreeMenu>
//       );
//     }
  
//     // group, team, counselor 타입
//     if (['group', 'team', 'counselor'].includes(type)) {
//       const counselors = getCounselorsForNode();
//       const contextMenuItem = {
//         id:
//           type === 'counselor'
//             ? data.counselorId
//             : type === 'team'
//             ? data.teamId
//             : data.groupId,
//         name:
//           type === 'counselor'
//             ? data.counselorname
//             : type === 'team'
//             ? data.teamName
//             : data.groupName,
//         tenantId: currentTenantId,
//         type: type as 'counselor' | 'team' | 'group',
//         members: counselors
//       };
  
//       return (
//         <IContextMenuForGroupAndTeamAndCounselor item={contextMenuItem}>
//           {content} 
//         </IContextMenuForGroupAndTeamAndCounselor>
//       );
//     }
  
//     // skill 타입에도 컨텍스트 메뉴 적용
//     if (type === 'skill') {
//       const contextMenuItem = {
//         id: data.skillId,
//         name: data.skillName,
//         // 추가적으로 필요한 정보 전달
//       };
//       return (
//         <IContextMenuForSkill item={contextMenuItem}>
//           {content}
//         </IContextMenuForSkill>
//       );
//     }
  
//     return content;
//   };
  
//   return (
//     <div className="select-none">
//       {renderWithContextMenu(renderNodeContent())}
//       {hasChildren && isExpanded && (
//         <div className="space-y-0.5">
//           {children.map((child: any) => {
//             let childId;
//             switch (child.type) {
//               case 'tenant': childId = child.data.tenantId; break;
//               case 'group': childId = child.data.groupId; break;
//               case 'team': childId = child.data.teamId; break;
//               case 'counselor': childId = child.data.counselorId; break;
//               case 'skill': childId = child.data.skillId; break;
//               default: childId = child.data.centerId;
//             }
//             return (
//               <TreeNodeForCounselorListForSideBar
//                 key={`${child.type}-${childId}`}
//                 data={child.data}
//                 type={child.type}
//                 level={level + 1}
//                 expandedNodes={expandedNodes}
//                 selectedNodeId={selectedNodeId}
//                 onNodeToggle={onNodeToggle}
//                 onNodeSelect={onNodeSelect}
//                 defaultExpanded={defaultExpanded}
//                 parentTenantId={currentTenantId}
//               />
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// TreeNodeForCounselorListForSideBar.tsx - 간단한 버전
"use client";
import React, { useCallback } from 'react';
import { UserCircle2 } from "lucide-react";
import { useIsMutating } from '@tanstack/react-query'; // 🎯 React Query 기본 기능만 사용
import { IContextMenuForTennantForCounselorTreeMenu } from "./ContextMenus/IContextMenuForTennantForCounselorTreeMenu";
import { IContextMenuForGroupAndTeamAndCounselor } from "./ContextMenus/IContextMenuForGroupAndTeamAndCounselorProps";
import { useCounselorFilterStore } from "@/store/storeForSideMenuCounselorTab";
import Image from "next/image";
import IContextMenuForSkill from './ContextMenus/IContextMenuForSkill';

interface ExpandConfig {
  organization?: boolean;
  tenant?: boolean;
  group?: boolean;
  team?: boolean;
  counselor?: boolean;
  skill?: boolean;
}

interface ISkill {
  skillId: string;
  skillName: string;
}

interface ITreeNodeForCounselorListForSideBar {
  data: any;
  level: number;
  expandedNodes: Set<string>;
  selectedNodeId?: string;
  onNodeToggle: (nodeId: string) => void;
  onNodeSelect: (nodeId: string) => void;
  type: 'organization' | 'tenant' | 'group' | 'team' | 'counselor' | 'skill';
  defaultExpanded: ExpandConfig;
  parentTenantId?: string;
  parentCounselorId?: string;
}

export function TreeNodeForCounselorListForSideBar({
  data,
  level,
  expandedNodes,
  selectedNodeId,
  onNodeToggle,
  onNodeSelect,
  type,
  defaultExpanded,
  parentTenantId,
  parentCounselorId
}: ITreeNodeForCounselorListForSideBar) {
  const { selectedBlendKind, setSelectedCounselor, sortOption } = useCounselorFilterStore();

  // 현재 노드의 tenantId와 counselorId 결정
  const currentTenantId = type === 'tenant' ? data.tenantId : parentTenantId;
  const currentCounselorId = type === 'counselor' ? data.counselorId : parentCounselorId;

  // 🎯 React Query의 기본 기능으로 삭제 중인지 확인
  const isMutatingCount = useIsMutating({
    mutationKey: ['deleteCounselorsFromSkills', currentTenantId]
  });
  
  // 현재 스킬이 삭제 중인지 간단히 판단 (정확하지 않지만 충분함)
  const isAnySkillDeleting = type === 'skill' && isMutatingCount > 0;

  const getCounselorsForNode = () => {
    switch (type) {
      case 'counselor':
        return [{
          ...data,
          tenantId: currentTenantId
        }];
      case 'skill':
        return [];
      case 'team': {
        let counselors = data.counselorInfo?.map((counselor: any) => ({
          type: 'counselor',
          data: {
            ...counselor,
            tenantId: currentTenantId
          }
        })) || [];
        
        if (selectedBlendKind !== null) {
          counselors = counselors.filter(
            (counselor: any) => {
              const blendKind = Number(counselor.data.blendKind);
              if (selectedBlendKind === 1) {
                return blendKind === 1 || blendKind === 3;
              } else if (selectedBlendKind === 2) {
                return blendKind === 2 || blendKind === 3;
              } else {
                return blendKind === selectedBlendKind;
              }
            }
          );
        }
        
        counselors.sort((a: { data: { counselorname: string; counselorId: string } }, b: { data: { counselorname: string; counselorId: string } }) => {
          if (sortOption.type === 'name') {
            if (a.data.counselorname < b.data.counselorname) return sortOption.direction === 'asc' ? -1 : 1;
            if (a.data.counselorname > b.data.counselorname) return sortOption.direction === 'asc' ? 1 : -1;
            return 0;
          } else {
            if (a.data.counselorId < b.data.counselorId) return sortOption.direction === 'asc' ? -1 : 1;
            if (a.data.counselorId > b.data.counselorId) return sortOption.direction === 'asc' ? 1 : -1;
            return 0;
          }
        });
        return counselors;
      }
      case 'group':
        return data.teamInfo?.reduce((acc: any[], team: any) => {
          const counselors = team.counselorInfo?.map((counselor: any) => ({
            ...counselor,
            tenantId: currentTenantId
          })) || [];
          return acc.concat(counselors);
        }, []) || [];
      default:
        return [];
    }
  };

  const getId = () => {
    switch (type) {
      case 'organization': return `org-${data.centerId}`;
      case 'tenant': return `tenant-${data.tenantId}`;
      case 'group': return `group-${data.groupId}`;
      case 'team': return `team-${data.teamId}`;
      case 'counselor': return data.counselorId;
      case 'skill': return `skill-${currentCounselorId}-${data.skillId}`;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'organization': return `[1]${data.centerName}`;
      case 'tenant': return `[${data.tenantId}]${data.tenantName}`;
      case 'group': return '[' + data.groupId + ']' + data.groupName;
      case 'team': return '[' + data.teamId + ']' + data.teamName;
      case 'counselor': return data.counselorname;
      case 'skill': return `[${data.skillId}]-${data.skillName}`;
    }
  };

  const getChildren = () => {
    switch (type) {
      case 'organization': 
        return data.tenantInfo?.map((tenant: any) => ({
          type: 'tenant',
          data: tenant
        }));
      case 'tenant': 
        return data.groupInfo?.map((group: any) => ({
          type: 'group',
          data: {
            ...group,
            tenantId: data.tenantId
          }
        }));
      case 'group': 
        return data.teamInfo?.map((team: any) => ({
          type: 'team',
          data: {
            ...team,
            tenantId: currentTenantId
          }
        }));
      case 'team': {
        let counselors = data.counselorInfo?.map((counselor: any) => ({
          type: 'counselor',
          data: {
            ...counselor,
            tenantId: currentTenantId
          }
        })) || [];
        
        if (selectedBlendKind !== null) {
          counselors = counselors.filter(
            (counselor: any) => {
              const blendKind = Number(counselor.data.blendKind);
              if (selectedBlendKind === 1) {
                return blendKind === 1 || blendKind === 3;
              } else if (selectedBlendKind === 2) {
                return blendKind === 2 || blendKind === 3;
              } else {
                return blendKind === selectedBlendKind;
              }
            }
          );
        }
        
        counselors.sort((a: { data: { counselorname: string; counselorId: string } }, b: { data: { counselorname: string; counselorId: string } }) => {
          if (sortOption.type === 'name') {
            if (a.data.counselorname < b.data.counselorname) return sortOption.direction === 'asc' ? -1 : 1;
            if (a.data.counselorname > b.data.counselorname) return sortOption.direction === 'asc' ? 1 : -1;
            return 0;
          } else {
            if (a.data.counselorId < b.data.counselorId) return sortOption.direction === 'asc' ? -1 : 1;
            if (a.data.counselorId > b.data.counselorId) return sortOption.direction === 'asc' ? 1 : -1;
            return 0;
          }
        });
        return counselors;
      }
      case 'counselor': {
        return data.assignedSkills?.map((skill: ISkill) => ({
          type: 'skill',
          data: skill,
          parentCounselorId: data.counselorId
        })) || [];
      }
      case 'skill': 
        return null;
    }
  };

  const id = getId();
  const label = getLabel();
  const children = getChildren();
  const hasChildren = children && children.length > 0;
  const isExpanded = expandedNodes.has(id);
  const isSelected = selectedNodeId === id;

  const handleNodeClick = () => {
    // 🎯 삭제 중인 스킬은 클릭 무시
    if (isAnySkillDeleting && type === 'skill') {
      return;
    }

    onNodeSelect(id);
    if (hasChildren) {
      onNodeToggle(id);
    }

    if (type === 'counselor') {
      const tenantId = data.tenantId || currentTenantId;
      if (tenantId) {
        // console.log(`상담사 선택: ${data.counselorname}, TenantID: ${tenantId}`);
        setSelectedCounselor(
          data.counselorId,
          data.counselorname,
          tenantId
        );
      } else {
        console.warn(`상담사 ${data.counselorname}의 tenantId를 찾을 수 없습니다.`);
      }
    }

    if (type === 'skill') {
      console.log(`스킬 선택: ${data.skillName}, 상담사: ${currentCounselorId}, 테넌트: ${currentTenantId}`);
    }
  };

  const handleContextMenu = useCallback(() => {
    if (isAnySkillDeleting && type === 'skill') {
      return;
    }
    onNodeSelect(id);
  }, [id, onNodeSelect, type, isAnySkillDeleting]);

  const renderIcon = () => {
    switch (type) {
      case 'organization':
        return <Image src="/tree-menu/organization.png" alt="조직" width={14} height={12} />;
      case 'tenant':
        return <Image src="/tree-menu/tennant_office.png" alt="테넌트" width={14} height={12} />;
      case 'group':
        return <Image src="/tree-menu/group_icon_for_tree.png" alt="그룹" width={15} height={12} />;
      case 'team':
        return <Image src="/tree-menu/team_icon_for_tree.png" alt="팀" width={14} height={12} />;
      case 'counselor':
        const blendKind = Number(data.blendKind);
        switch (blendKind) {
          case 1:
            return <Image src="/tree-menu/inbound_counselor.png" alt="인바운드" width={15} height={12} />;
          case 2:
            return <Image src="/tree-menu/outbound_counselor.png" alt="아웃바운드" width={15} height={12} />;
          case 3:
            return <Image src="/tree-menu/inbound_outbound_mix.png" alt="블렌드" width={15} height={12} />;
          default:
            return <UserCircle2 className="h-4 w-4 text-gray-600" />;
        }
      default:
        return null;
    }
  };

  // 🎨 스킬 노드 스타일 (간단한 버전)
  const skillStyle = type === 'skill' && isAnySkillDeleting ? {
    opacity: 0.6,
    pointerEvents: 'none' as const
  } : {};

  const renderNodeContent = () => (
    <div
      id={type === 'counselor' ? `counselor-${data.counselorId}` : 
          type === 'skill' ? `skill-${currentCounselorId}-${data.skillId}` : undefined}
      className={`flex items-center hover:bg-[#FFFAEE] px-2 py-0.5 cursor-pointer transition-colors duration-150 text-[#555]
        ${isSelected ? "bg-[#FFFAEE]" : ""} 
        ${type === 'skill' ? "text-blue-600" : ""}
        ${isAnySkillDeleting && type === 'skill' ? 'animate-pulse cursor-not-allowed' : ''}`}
      onClick={handleNodeClick}
      onContextMenu={handleContextMenu}
      style={{ 
        paddingLeft: `${level * 16 + 8}px`,
        ...skillStyle
      }}
    >
      <div className="flex items-center w-full gap-2">
        {hasChildren ? (
          isExpanded ? (
            <Image src="/tree-menu/minus_for_tree.png" alt="접기" width={12} height={12} />
          ) : (
            <Image src="/tree-menu/plus_icon_for_tree.png" alt="펼치기" width={12} height={12} />
          )
        ) : (
          <span className="w-3" />
        )}
        {renderIcon()}
        
        {/* 🎯 삭제 중일 때만 로딩 표시 (간단함) */}
        {type === 'skill' && isAnySkillDeleting && (
          <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
        )}
        
        <span className={`text-sm ${type === 'skill' ? 'text-blue-600' : 'text-555'} ${isSelected ? "font-medium" : ""}`}>
          {type === 'counselor' ? `${getLabel()} [${getId()}]` : getLabel()}
          {type === 'skill' && isAnySkillDeleting && (
            <span className="text-xs text-gray-500 ml-2">(처리 중...)</span>
          )}
        </span>
      </div>
    </div>
  );

  const renderWithContextMenu = (content: React.ReactNode) => {
    if (type === 'organization' || type === 'tenant') {
      return (
        <IContextMenuForTennantForCounselorTreeMenu>
          {content}
        </IContextMenuForTennantForCounselorTreeMenu>
      );
    }
  
    if (['group', 'team', 'counselor'].includes(type)) {
      const counselors = getCounselorsForNode();
      
      const contextMenuItem = {
        id:
          type === 'counselor'
            ? data.counselorId
            : type === 'team'
            ? data.teamId
            : data.groupId,
        name:
          type === 'counselor'
            ? data.counselorname
            : type === 'team'
            ? data.teamName
            : data.groupName,
        tenantId: currentTenantId,
        type: type as 'counselor' | 'team' | 'group',
        members: counselors
      };
  
      return (
        <IContextMenuForGroupAndTeamAndCounselor item={contextMenuItem}>
          {content} 
        </IContextMenuForGroupAndTeamAndCounselor>
      );
    }
  
    // 🎯 스킬 타입 - 처리 중이 아닐 때만 컨텍스트 메뉴
    if (type === 'skill' && !isAnySkillDeleting) {
      const contextMenuItem = {
        id: data.skillId,
        name: data.skillName,
      };
      
      return (
        <IContextMenuForSkill 
          item={contextMenuItem}
          counselorIds={currentCounselorId ? [currentCounselorId] : []}
          tenantId={currentTenantId || ''}
        >
          {content}
        </IContextMenuForSkill>
      );
    }

    return content;
  };
  
  return (
    <div className="select-none">
      {renderWithContextMenu(renderNodeContent())}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {children.map((child: any) => {
            let childId;
            switch (child.type) {
              case 'tenant': childId = child.data.tenantId; break;
              case 'group': childId = child.data.groupId; break;
              case 'team': childId = child.data.teamId; break;
              case 'counselor': childId = child.data.counselorId; break;
              case 'skill': childId = child.data.skillId; break;
              default: childId = child.data.centerId;
            }
            return (
              <TreeNodeForCounselorListForSideBar
                key={`${child.type}-${childId}`}
                data={child.data}
                type={child.type}
                level={level + 1}
                expandedNodes={expandedNodes}
                selectedNodeId={selectedNodeId}
                onNodeToggle={onNodeToggle}
                onNodeSelect={onNodeSelect}
                defaultExpanded={defaultExpanded}
                parentTenantId={currentTenantId}
                parentCounselorId={currentCounselorId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}