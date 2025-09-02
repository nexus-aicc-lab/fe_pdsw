"use client";

import {
  ChevronRight,
  ChevronDown,
  Building,
  Boxes,
  Users,
  UserCircle2
} from "lucide-react";
import { useCallback } from "react";
import { ContextMenuForAgentNode } from "./ContextMenuForAgentNode";
import { TreeItem } from "../../types/typeForSidebar2";

interface TreeNodeProps {
  item: TreeItem;
  level: number;
  expandedNodes: Set<string>;
  selectedNodeId?: string;
  onNodeToggle: (nodeId: string) => void;
  onNodeSelect: (nodeId: string) => void;
}

export function TreeNodeForTenantWithAgent({
  item,
  level,
  expandedNodes,
  selectedNodeId,
  onNodeToggle,
  onNodeSelect,
}: TreeNodeProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedNodes.has(item.id);
  const isSelected = selectedNodeId === item.id;

  // console.log("Rendering Node:", item.label, "Type:", item.type); // ✅ 타입 디버깅 로그 추가

  // 타입에 따른 아이콘 렌더링
  const renderIcon = () => {
    switch (item.type?.toLowerCase()) { // ✅ 대소문자 통일
      case "tenant":
        // console.log("Tenant Icon:", item.label);
        return <Building className="h-4 w-4 text-blue-600" />;
      case "group":
        // console.log("Group Icon:", item.label);
        return <Boxes className="h-4 w-4 text-green-600" />;
      case "team":
        // console.log("Team Icon:", item.label);
        return <Users className="h-4 w-4 text-purple-600" />;
      case "counselor":
        // console.log("Counselor Icon:", item.label);
        return <UserCircle2 className="h-4 w-4 text-gray-600" />;
      default:
        // console.log("Default Icon:", item.label);
        return <Building className="h-4 w-4 text-gray-500" />;
    }
  };

  // 클릭 핸들러 (노드 선택 + 확장/축소)
  const handleClick = useCallback(() => {
    onNodeSelect(item.id);
    if (hasChildren) {
      onNodeToggle(item.id);
    }
  }, [item.id, hasChildren, onNodeSelect, onNodeToggle]);

  // 우클릭 메뉴 핸들러
  const handleEdit = () => {
    // console.log("Edit item:", { id: item.id, label: item.label, type: item.type });
  };

  const handleDelete = () => {
    // console.log("Delete item:", { id: item.id, label: item.label, type: item.type });
  };

  const handleManage = () => {
    // console.log("Manage item:", { id: item.id, label: item.label, type: item.type });
  };

  return (
    <div className="select-none">
      <ContextMenuForAgentNode
        item={{
          type: item.type,
          id: item.id,
          label: item.label,
          tenantId: item.tenantId ?? "",
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onManage={handleManage}
      >
        <div
          className={`flex items-center hover:bg-[#FFFAEE] px-2 py-0.5 cursor-pointer transition-colors duration-150
            ${isSelected ? "bg-blue-50  hover:bg-blue-100" : ""}`}
          onClick={handleClick}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div className="flex items-center w-full gap-2">
            {/* 확장/축소 아이콘 */}
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )
            ) : (
              <span className="w-4" />
            )}

            {/* 아이콘 */}
            {renderIcon()}

            {/* 노드 라벨 */}
            <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>
              {item.label}
            </span>
          </div>
        </div>
      </ContextMenuForAgentNode>

      {/* 자식 노드 재귀 렌더링 */}
      {hasChildren && isExpanded && (
        <div>
          {item.children?.map((child) => (
            <TreeNodeForTenantWithAgent
              key={child.id}
              item={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              selectedNodeId={selectedNodeId}
              onNodeToggle={onNodeToggle}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
