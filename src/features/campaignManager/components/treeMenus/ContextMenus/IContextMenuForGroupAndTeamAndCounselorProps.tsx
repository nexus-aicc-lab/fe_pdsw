// "use client";

// import React, { useState, useCallback } from "react";
// import { Menu, useContextMenu } from "react-contexify";
// import "react-contexify/ReactContexify.css";
// import { useCounselorFilterStore } from "@/store/storeForSideMenuCounselorTab";
// import { useTabStore } from "@/store/tabStore";
// import { IDialogForSkilAssignmentForCounselor } from "../dialog/IDialogForSkilAssignmentForCounselor";
// import { IDialogForTeamSkilAssignment } from "../dialog/IDialogForTeamSkilAssignment";
// import { toast } from "react-toastify";
// import { IDialogForGroupSkilAssignment } from "../dialog/IDialogForGroupSkilAssignment";

// interface IContextMenuForGroupAndTeamAndCounselorProps {
//   children: React.ReactNode;
//   item: {
//     id: string;
//     name: string;
//     tenantId: string;
//     type: "counselor" | "team" | "group";
//     members?: any[]; // 상담사 목록
//   };
// }

// export function IContextMenuForGroupAndTeamAndCounselor({
//   children,
//   item,
// }: IContextMenuForGroupAndTeamAndCounselorProps) {
//   const { addTab, removeTab, openedTabs } = useTabStore();
//   const { setCandidateMembersForSkilAssign } = useCounselorFilterStore();

//   // 다이얼로그 상태 관리
//   const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
//   const [isTeamSkillDialogOpen, setIsTeamSkillDialogOpen] = useState(false);
//   const [isGroupSkillDialogOpen, setIsGroupSkillDialogOpen] = useState(false);
//   const [isUnassignment, setIsUnassignment] = useState(false); // 할당 해제 모드 여부

//   // Contexify 메뉴 ID 생성 (unique ID)
//   const MENU_ID = `menu-for-${item.type}-${item.id}`;
  
//   // Contexify hook
//   const { show } = useContextMenu({
//     id: MENU_ID,
//   });

//   // 우클릭 이벤트 핸들러
//   const handleContextMenu = useCallback(
//     (event: React.MouseEvent) => {
//       event.preventDefault();
//       show({ event });
//     },
//     [show]
//   );

//   // 디버깅용 로그
//   const logDebugInfo = (actionType: string, data: any) => {
//     console.group(`🔍 [ContextMenu] ${actionType}`);
//     console.log("타입:", item.type);
//     console.log("이름:", item.name);
//     console.log("ID:", item.id);
//     console.log("테넌트 ID:", item.tenantId);

//     if (item.members) {
//       console.log("멤버 수:", item.members.length);
//       console.log("첫 번째 멤버 샘플:", item.members[0]);
//     }
//     console.log("전달 데이터:", data);
//     console.groupEnd();
//   };

//   // tenantId 유효성 검증
//   const validateTenantId = () => {
//     if (!item.tenantId) {
//       console.error("⚠️ Context Menu: tenantId가 누락되었습니다. item:", item);
//       return false;
//     }
//     return true;
//   };

//   // ====== 상담사(개인) 관련 함수 ======
//   const handleCounselorSkillAssignment = (isUnassign: boolean) => {
//     if (!validateTenantId()) return;

//     logDebugInfo(isUnassign ? "상담사 스킬 해제" : "상담사 스킬 할당", {
//       counselorId: item.id,
//       counselorName: item.name,
//       tenantId: item.tenantId,
//       isUnassignment: isUnassign
//     });

//     setIsUnassignment(isUnassign);
//     setIsSkillDialogOpen(true);
//   };

//   // ====== 팀 관련 함수 ======
//   const handleTeamSkillAssignment = (isUnassign: boolean) => {
//     if (!validateTenantId()) return;

//     if (!item.members || item.members.length === 0) {
//       toast.warn("팀에 멤버가 없습니다.");
//       return;
//     }

//     const membersWithTenantId = item.members.map((member) => ({
//       ...member,
//       tenantId: item.tenantId,
//     }));

//     logDebugInfo(isUnassign ? "팀 스킬 해제" : "팀 스킬 할당", {
//       teamId: item.id,
//       teamName: item.name,
//       memberCount: membersWithTenantId.length,
//       tenantId: item.tenantId,
//       isUnassignment: isUnassign
//     });

//     setIsUnassignment(isUnassign);
//     setCandidateMembersForSkilAssign(membersWithTenantId);
//     setIsTeamSkillDialogOpen(true);
//   };

//   // ====== 그룹 관련 함수 ======
//   const handleGroupSkillAssignment = (isUnassign: boolean) => {
//     if (!validateTenantId()) return;

//     if (!item.members || item.members.length === 0) {
//       toast.warn("그룹에 멤버가 없습니다.");
//       return;
//     }

//     const membersWithTenantId = item.members.map((member) => ({
//       ...member,
//       tenantId: item.tenantId,
//     }));

//     logDebugInfo(isUnassign ? "그룹 스킬 해제" : "그룹 스킬 할당", {
//       groupId: item.id,
//       groupName: item.name,
//       memberCount: membersWithTenantId.length,
//       tenantId: item.tenantId,
//       isUnassignment: isUnassign
//     });

//     setIsUnassignment(isUnassign);
//     setCandidateMembersForSkilAssign(membersWithTenantId);
//     setIsGroupSkillDialogOpen(true);
//   };

//   // 타입별로 할당 / 해제 분기
//   const openSkillAssignmentDialog = (isUnassign: boolean = false) => {
//     switch (item.type) {
//       case "counselor":
//         handleCounselorSkillAssignment(isUnassign);
//         break;
//       case "team":
//         handleTeamSkillAssignment(isUnassign);
//         break;
//       case "group":
//         handleGroupSkillAssignment(isUnassign);
//         break;
//       default:
//         console.warn(`⚠️ 알 수 없는 타입: ${item.type}`);
//     }
//   };

//   // 메뉴 항목 제목
//   const getMenuItemTitle = (isUnassign: boolean = false) => {
//     if (isUnassign) {
//       return "스킬 할당 해제";
//     }
    
//     switch (item.type) {
//       case "counselor":
//         return "상담사 스킬 할당";
//       case "team":
//         return "팀 스킬 할당";
//       case "group":
//         return "그룹 스킬 할당";
//       default:
//         return "스킬 할당";
//     }
//   };

//   // 다이얼로그 타이틀
//   const getDialogTitle = () => {
//     const actionText = isUnassignment ? "해제" : "할당";
//     switch (item.type) {
//       case "counselor":
//         return `상담사 스킬 ${actionText} - ${item.name}`;
//       case "team":
//         return `팀 스킬 ${actionText} - ${item.name}`;
//       case "group":
//         return `그룹 스킬 ${actionText} - ${item.name}`;
//       default:
//         return `스킬 ${actionText}`;
//     }
//   };

//   return (
//     <>
//       {/* 컨텍스트 메뉴를 트리거할 요소 */}
//       <div onContextMenu={handleContextMenu}>{children}</div>

//       {/* React-Contexify 메뉴 정의 */}
//       <Menu id={MENU_ID} animation="fade" className="compact-menu">
//         <div className="contexify-custom-item" onClick={() => openSkillAssignmentDialog(false)}>
//           {getMenuItemTitle(false)}
//         </div>
//         <div className="contexify-custom-item" onClick={() => openSkillAssignmentDialog(true)}>
//           {getMenuItemTitle(true)}
//         </div>
//       </Menu>

//       {/* ===== 상담사 스킬 할당 다이얼로그 ===== */}
//       {item.type === "counselor" && isSkillDialogOpen && (
//         <IDialogForSkilAssignmentForCounselor
//           isOpen={isSkillDialogOpen}
//           onClose={() => setIsSkillDialogOpen(false)}
//           counselorId={item.id}
//           counselorName={item.name}
//           tenantId={item.tenantId}
//           isUnassignment={isUnassignment}
//           dialogTitle={getDialogTitle()}
//         />
//       )}

//       {/* ===== 팀 스킬 할당 다이얼로그 ===== */}
//       {item.type === "team" && isTeamSkillDialogOpen && (
//         <IDialogForTeamSkilAssignment
//           isOpen={isTeamSkillDialogOpen}
//           onClose={() => setIsTeamSkillDialogOpen(false)}
//           teamId={item.id}
//           teamName={item.name}
//           teamMembers={item.members || []}
//           tenantId={item.tenantId}
//           isUnassignment={isUnassignment}
//           dialogTitle={getDialogTitle()}
//         />
//       )}

//       {/* ===== 그룹 스킬 할당 다이얼로그 ===== */}
//       {item.type === "group" && isGroupSkillDialogOpen && (
//         <IDialogForGroupSkilAssignment
//           isOpen={isGroupSkillDialogOpen}
//           onClose={() => setIsGroupSkillDialogOpen(false)}
//           groupId={item.id}
//           groupName={item.name}
//           groupMembers={item.members || []}
//           tenantId={item.tenantId}
//           isUnassignment={isUnassignment}
//           dialogTitle={getDialogTitle()}
//         />
//       )}
//     </>
//   );
// }

"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useCounselorFilterStore } from "@/store/storeForSideMenuCounselorTab";
import { useTabStore } from "@/store/tabStore";
import { IDialogForSkilAssignmentForCounselor } from "../dialog/IDialogForSkilAssignmentForCounselor";
import { IDialogForTeamSkilAssignment } from "../dialog/IDialogForTeamSkilAssignment";
import { toast } from "react-toastify";
import { IDialogForGroupSkilAssignment } from "../dialog/IDialogForGroupSkilAssignment";
import { useAvailableMenuStore } from "@/store/useAvailableMenuStore";

interface IContextMenuForGroupAndTeamAndCounselorProps {
  children: React.ReactNode;
  item: {
    id: string;
    name: string;
    tenantId: string;
    type: "counselor" | "team" | "group";
    members?: any[]; // 상담사 목록
  };
}

// 메뉴 ID 상수 정의 (원래 주석 코드의 값과 동일)
const MENU_IDS = {
  GROUP_SKILL_ASSIGN: 31,
  GROUP_SKILL_UNASSIGN: 32,
  TEAM_SKILL_ASSIGN: 33,
  TEAM_SKILL_UNASSIGN: 34,
  COUNSELOR_SKILL_ASSIGN: 35,
  COUNSELOR_SKILL_UNASSIGN: 36,
};

export function IContextMenuForGroupAndTeamAndCounselor({
  children,
  item,
}: IContextMenuForGroupAndTeamAndCounselorProps) {
  const { addTab, removeTab, openedTabs } = useTabStore();
  const { setCandidateMembersForSkilAssign } = useCounselorFilterStore();
  const { availableMenuIdsForSkilAssignment } = useAvailableMenuStore();

  // 다이얼로그 상태 관리
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isTeamSkillDialogOpen, setIsTeamSkillDialogOpen] = useState(false);
  const [isGroupSkillDialogOpen, setIsGroupSkillDialogOpen] = useState(false);
  const [isUnassignment, setIsUnassignment] = useState(false); // 할당 해제 모드 여부
  
  // 컨텍스트 메뉴 상태 관리 추가
  const [isDialogActive, setIsDialogActive] = useState(false);

  // 다이얼로그 닫힐 때 상태 초기화 핸들러
  const handleDialogClose = () => {
    setIsSkillDialogOpen(false);
    setIsTeamSkillDialogOpen(false);
    setIsGroupSkillDialogOpen(false);
    setIsDialogActive(false); // 중요: 다이얼로그가 닫힐 때 상태 초기화
  };

  // 디버깅용 로그
  // const logDebugInfo = (actionType: string, data: any) => {
  //   console.group(`🔍 [ContextMenu] ${actionType}`);
  //   console.log("타입:", item.type);
  //   console.log("이름:", item.name);
  //   console.log("ID:", item.id);
  //   console.log("테넌트 ID:", item.tenantId);
  //   if (item.members) {
  //     console.log("멤버 수:", item.members.length);
  //     console.log("첫 번째 멤버 샘플:", item.members[0]);
  //   }
  //   console.log("전달 데이터:", data);
  //   console.groupEnd();
  // };

  // tenantId 유효성 검증
  const validateTenantId = () => {
    if (!item.tenantId) {
      // console.error("⚠️ Context Menu: tenantId가 누락되었습니다. item:", item);
      return false;
    }
    return true;
  };

  // ====== 상담사(개인) 관련 함수 ======
  const handleCounselorSkillAssignment = (isUnassign: boolean) => {
    if (!validateTenantId()) return;
    
    // logDebugInfo(isUnassign ? "상담사 스킬 해제" : "상담사 스킬 할당", {
    //   counselorId: item.id,
    //   counselorName: item.name,
    //   tenantId: item.tenantId,
    //   isUnassignment: isUnassign,
    // });
    
    setIsUnassignment(isUnassign);
    setIsDialogActive(true); // 다이얼로그 활성화 상태로 설정
    setIsSkillDialogOpen(true);
  };

  // ====== 팀 관련 함수 ======
  const handleTeamSkillAssignment = (isUnassign: boolean) => {
    if (!validateTenantId()) return;
    if (!item.members || item.members.length === 0) {
      toast.warn("팀에 멤버가 없습니다.");
      return;
    }
    
    const membersWithTenantId = item.members.map((member) => ({
      ...member,
      tenantId: item.tenantId,
    }));
    
    // logDebugInfo(isUnassign ? "팀 스킬 해제" : "팀 스킬 할당", {
    //   teamId: item.id,
    //   teamName: item.name,
    //   memberCount: membersWithTenantId.length,
    //   tenantId: item.tenantId,
    //   isUnassignment: isUnassign,
    // });
    
    setIsUnassignment(isUnassign);
    setCandidateMembersForSkilAssign(membersWithTenantId);
    setIsDialogActive(true); // 다이얼로그 활성화 상태로 설정
    setIsTeamSkillDialogOpen(true);
  };

  // ====== 그룹 관련 함수 ======
  const handleGroupSkillAssignment = (isUnassign: boolean) => {
    if (!validateTenantId()) return;
    if (!item.members || item.members.length === 0) {
      toast.warn("그룹에 멤버가 없습니다.");
      return;
    }
    
    const membersWithTenantId = item.members.map((member) => ({
      ...member,
      tenantId: item.tenantId,
    }));
    
    // logDebugInfo(isUnassign ? "그룹 스킬 해제" : "그룹 스킬 할당", {
    //   groupId: item.id,
    //   groupName: item.name,
    //   memberCount: membersWithTenantId.length,
    //   tenantId: item.tenantId,
    //   isUnassignment: isUnassign,
    // });
    
    setIsUnassignment(isUnassign);
    setCandidateMembersForSkilAssign(membersWithTenantId);
    setIsDialogActive(true); // 다이얼로그 활성화 상태로 설정
    setIsGroupSkillDialogOpen(true);
  };

  // 타입별로 할당 / 해제 분기 처리
  const openSkillAssignmentDialog = (isUnassign: boolean = false) => {
    switch (item.type) {
      case "counselor":
        handleCounselorSkillAssignment(isUnassign);
        break;
      case "team":
        handleTeamSkillAssignment(isUnassign);
        break;
      case "group":
        handleGroupSkillAssignment(isUnassign);
        break;
      default:
        // console.warn(`⚠️ 알 수 없는 타입: ${item.type}`);
    }
  };

  // 메뉴 항목 제목 반환
  const getMenuItemTitle = (isUnassign: boolean = false) => {
    if (isUnassign) {
      return "스킬 할당 해제";
    }
    switch (item.type) {
      case "counselor":
        return "상담사 스킬 할당";
      case "team":
        return "팀 스킬 할당";
      case "group":
        return "그룹 스킬 할당";
      default:
        return "스킬 할당";
    }
  };

  // 다이얼로그 타이틀 생성
  const getDialogTitle = () => {
    const actionText = isUnassignment ? "해제" : "할당";
    switch (item.type) {
      case "counselor":
        return `상담사 스킬 ${actionText} - ${item.name}`;
      case "team":
        return `팀 스킬 ${actionText} - ${item.name}`;
      case "group":
        return `그룹 스킬 ${actionText} - ${item.name}`;
      default:
        return `스킬 ${actionText}`;
    }
  };

  // 각 타입별 메뉴 아이템 ID 반환
  const getMenuItemId = (type: string, isUnassign: boolean): number => {
    switch (type) {
      case "counselor":
        return isUnassign
          ? MENU_IDS.COUNSELOR_SKILL_UNASSIGN
          : MENU_IDS.COUNSELOR_SKILL_ASSIGN;
      case "team":
        return isUnassign
          ? MENU_IDS.TEAM_SKILL_UNASSIGN
          : MENU_IDS.TEAM_SKILL_ASSIGN;
      case "group":
        return isUnassign
          ? MENU_IDS.GROUP_SKILL_UNASSIGN
          : MENU_IDS.GROUP_SKILL_ASSIGN;
      default:
        return 0;
    }
  };

  // 메뉴 권한 체크 (현재 로그인한 사용자가 해당 메뉴에 접근 권한이 있는지)
  const hasMenuPermission = (menuId: number): boolean => {
    return availableMenuIdsForSkilAssignment.includes(menuId);
  };

  // 메뉴 아이템 배열 생성
  const menuItems = [
    {
      key: "skill-assign",
      title: getMenuItemTitle(false),
      menuId: getMenuItemId(item.type, false),
      isUnassign: false,
    },
    {
      key: "skill-unassign",
      title: getMenuItemTitle(true),
      menuId: getMenuItemId(item.type, true),
      isUnassign: true,
    },
  ];

  // 권한이 있는 메뉴 아이템만 필터링
  const authorizedMenuItems = menuItems.filter((menuItem) =>
    hasMenuPermission(menuItem.menuId)
  );
  const hasAnyMenuItems = authorizedMenuItems.length > 0;

  // 메뉴 아이템 클릭 핸들러
  const handleItemClick = (isUnassign: boolean) => {
    openSkillAssignmentDialog(isUnassign);
  };
  
  // 컨텍스트 메뉴 트리거를 위한 스타일
  const triggerStyles = {
    display: "inline-block", // 이 부분이 중요함 - ContextMenuTrigger가 자식 요소를 감싸도록 함
    width: "100%",
    height: "100%",
  };

  return (
    <>
      {hasAnyMenuItems ? (
        <ContextMenu modal={false}> {/* modal 속성을 false로 설정하여 동작 개선 */}
          <ContextMenuTrigger 
            className="w-full h-full" 
            disabled={isDialogActive} // 다이얼로그가 활성화된 상태에서는 트리거 비활성화
          >
            {children}
          </ContextMenuTrigger>
          <ContextMenuContent className="min-w-[150px] rounded-[3px] border border-[#333]">
            {authorizedMenuItems.map((menuItem) => (
              <ContextMenuItem
                key={menuItem.key}
                className="px-[6px] py-[4px] text-sm cursor-pointer hover:bg-gray-100"
                onClick={() => handleItemClick(menuItem.isUnassign)}
              >
                {menuItem.title}
              </ContextMenuItem>
            ))}
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        <>{children}</>
      )}

      {/* ===== 상담사 스킬 할당 다이얼로그 ===== */}
      {item.type === "counselor" && isSkillDialogOpen && (
        <IDialogForSkilAssignmentForCounselor
          isOpen={isSkillDialogOpen}
          onClose={handleDialogClose} // 수정된 닫기 핸들러 사용
          counselorId={item.id}
          counselorName={item.name}
          tenantId={item.tenantId}
          isUnassignment={isUnassignment}
          dialogTitle={getDialogTitle()}
        />
      )}

      {/* ===== 팀 스킬 할당 다이얼로그 ===== */}
      {item.type === "team" && isTeamSkillDialogOpen && (
        <IDialogForTeamSkilAssignment
          isOpen={isTeamSkillDialogOpen}
          onClose={handleDialogClose} // 수정된 닫기 핸들러 사용
          teamId={item.id}
          teamName={item.name}
          teamMembers={item.members || []}
          tenantId={item.tenantId}
          isUnassignment={isUnassignment}
          dialogTitle={getDialogTitle()}
        />
      )}

      {/* ===== 그룹 스킬 할당 다이얼로그 ===== */}
      {item.type === "group" && isGroupSkillDialogOpen && (
        <IDialogForGroupSkilAssignment
          isOpen={isGroupSkillDialogOpen}
          onClose={handleDialogClose} // 수정된 닫기 핸들러 사용
          groupId={item.id}
          groupName={item.name}
          groupMembers={item.members || []}
          tenantId={item.tenantId}
          isUnassignment={isUnassignment}
          dialogTitle={getDialogTitle()}
        />
      )}
    </>
  );
}