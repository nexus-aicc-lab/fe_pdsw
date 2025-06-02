"use client";

import {
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useTabStore } from "@/store/tabStore";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import { useTreeMenuStore } from "@/store/storeForSsideMenuCampaignTab";
import { useAvailableMenuStore } from "@/store/useAvailableMenuStore";
import { useAuthStore, useCampainManagerStore } from "@/store";
import { toast } from "react-toastify";

export interface FolderContextMenuProps {
  item: {
    id: string;
    label: string;
  };
}

export const FolderContextMenu = ({ item }: FolderContextMenuProps) => {
  const { addTab, openedTabs, setActiveTab, removeExistingTabsByTabId } = useTabStore();
  const { selectedMenus, toggleMenu, } = useTreeMenuStore(); // 통합 스토어 사용
  const { availableCampaignTenantContextMenuIds } = useAvailableMenuStore(); // 권한 있는 메뉴 ID 가져오기
  const {setIsAlreadyOpend} = useCampainManagerStore();

  const { tenant_id, role_id, session_key } = useAuthStore();

  // addTab({
  //   id: 700,
  //   title: 캠페인 그룹 일괄 수정: ${node.name},
  //   uniqueKey: groupBulkUpdate_${node.id},
  //   params: {
  //     groupId: node.id,
  //     groupName: node.name
  //   }
  // });

  const menuItems = [
    {
      id: 13,
      menuId: 15,
      title: "새 캠페인",
      handler: () => {
        const tenantId = item.id;
        const newKey = `13-${Date.now()}`;
        // toast.success("새 캠페인 탭을 추가합니다.");
        // 💡 새로 추가한 메서드 사용!
        removeExistingTabsByTabId(13);
        // toast.success("새 캠페인 탭을 추가합니다.");

        addTab({
          id: 13,
          uniqueKey: newKey,
          title: "새 캠페인",
          icon: "",
          href: "",
          content: null,
          params: {
            tenantId,
          },
        });
        setIsAlreadyOpend(false);
        setActiveTab(13, newKey);
      },
    },

    {
      id: 22,
      menuId: 16,
      title: "상담사 상태 모니터",
      handler: () => {
        addTab({
          id: 22,
          uniqueKey: `22-${Date.now()}`,
          title: "상담사 상태 모니터",
          icon: "",
          href: "",
          content: null,
          params: {
            sessionKey: session_key,
            campaignId: 0,
            tenantId: item.id,
          }

        });
      },
    },
  ];

  const filteredMenuItems = menuItems.filter((menuItem) =>
    availableCampaignTenantContextMenuIds.includes(menuItem.menuId)
  );
  // console.log("availableCampaignTenantContextMenuIds : ", availableCampaignTenantContextMenuIds);
  // console.log("filteredMenuItems : ", filteredMenuItems);  

  return (
    <ContextMenuContent>
      {filteredMenuItems.map((menuItem) => (
        <ContextMenuItem
          key={menuItem.id}
          onClick={menuItem.handler}
          className="cursor-pointer hover:bg-[#F4F6F9] focus:bg-[#F4F6F9] flex items-center text-[#333] px-[6px] py-[4px]"
        >
          <span>{menuItem.title}</span>
        </ContextMenuItem>
      ))}
    </ContextMenuContent>
  );
}