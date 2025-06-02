import { TabData, TreeItem, FilterType, SortType } from '@/features/campaignManager/types/typeForSidebar2';
import { TabActions } from './comp/TabActions';

interface TreeNodeProps {
  item: any;
  level: number;
  expandedNodes: Set<string>;
  selectedNodeId?: string;
  getStatusIcon: (status?: string) => string | null;
  onNodeToggle: (nodeId: string) => void;
  onNodeSelect: (nodeId: string) => void;
  compact?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  level,
  expandedNodes,
  selectedNodeId,
  getStatusIcon,
  onNodeToggle,
  onNodeSelect,
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedNodes.has(item.id);
  const isSelected = selectedNodeId === item.id;
  const statusIcon = getStatusIcon(item.status);

  return (
    <div className="select-none">
      <div 
        className={`flex items-center hover:bg-gray-100 rounded px-2 py-1 cursor-pointer
          ${isSelected ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}`}
        onClick={() => {
          onNodeSelect(item.id);
          if (hasChildren) {
            onNodeToggle(item.id);
          }
        }}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <div className="flex items-center w-full">
          {hasChildren ? (
            <img 
              src={`/sidebar-menu/arrow_${isExpanded ? 'minus' : 'plus'}.svg`}
              alt={isExpanded ? 'collapse' : 'expand'} 
              className="w-4 h-4 mr-1"
            />
          ) : (
            <span className="w-4 h-4 mr-1" />
          )}
          
          {item.type === 'folder' ? (
            <img 
              src="/sidebar-menu/tree_folder.svg" 
              alt="folder" 
              className="w-4 h-4 mr-2"
            />
          ) : (
            statusIcon && <img src={statusIcon} alt="status" className="w-4 h-4 mr-2" />
          )}
          
          <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
            {item.label}
          </span>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {item.children?.map((child: TreeItem) => (
            <TreeNode 
              key={child.id} 
              item={child} 
              level={level + 1}
              expandedNodes={expandedNodes}
              selectedNodeId={selectedNodeId}
              getStatusIcon={getStatusIcon}
              onNodeToggle={onNodeToggle}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarPresenterProps {
  // 기본 정보
  width: number;
  selectedTabId: string;
  selectedNodeId?: string;
  
  // 크기 조정 관련
  isResizing: boolean;
  onResizeStart: () => void;
  
  // 트리 노드 관련
  expandedNodes: Set<string>;
  tabs: TabData[];
  getStatusIcon: (status?: string) => string | null;
  onNodeToggle: (nodeId: string) => void;
  onNodeSelect: (nodeId: string) => void;
  
  // 탭 관련
  onTabChange: (tabId: string) => void;
  
  // 필터 관련
  onFilter?: (type: FilterType) => void;
  selectedFilter: FilterType;
  
  // 정렬 관련
  onSort?: (type: SortType) => void;
  selectedSort: SortType;
  
  // 상태 관련
  isLoading?: boolean;
  error?: string | null;
}

export default function SidebarPresenter({
  width,
  selectedTabId,
  selectedNodeId,
  isResizing,
  expandedNodes,
  tabs,
  getStatusIcon,
  onTabChange,
  onNodeToggle,
  onNodeSelect,
  onResizeStart,
  onSort,
  onFilter,
  selectedSort,
  selectedFilter,
  isLoading,
  error
}: SidebarPresenterProps) {
  const currentTab = tabs.find(tab => tab.id === selectedTabId);

  return (
    <div className="flex h-full relative">
      <div className="bg-white border-r flex flex-col flex-none" style={{ width: `${width}px` }}>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-none flex items-center justify-between p-2 bg-gray-50 px-3 border-b">
            <div className="flex items-center gap-2 py-1.5">
              <img src="/sidebar-menu/phone_icon.svg" alt="navigation" className="w-4 h-4" />
              <span className="text-sm text-gray-800 font-medium">{currentTab?.label}</span>
            </div>
            <div className="flex items-center gap-1">
                <TabActions
                  tabId={selectedTabId}
                  onFilter={onFilter || (() => {})}
                  onSort={onSort || (() => {})}
                  selectedFilter={selectedFilter}
                  selectedSort={selectedSort}
                />
            </div>
          </div>

          <div className="flex-1 overflow-auto relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}
            {error ? (
              <div className="p-4 text-red-600 text-sm">{error}</div>
            ) : (
              currentTab?.items.map(item => (
                <TreeNode
                  key={item.id}
                  item={item}
                  level={0}
                  expandedNodes={expandedNodes}
                  selectedNodeId={selectedNodeId}
                  getStatusIcon={getStatusIcon}
                  onNodeToggle={onNodeToggle}
                  onNodeSelect={onNodeSelect}
                />
              ))
            )}
          </div>

          <div className="flex-none border-t">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`w-full text-left px-4 py-2 text-sm font-medium 
                  ${selectedTabId === tab.id 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="w-1 cursor-col-resize hover:bg-gray-300 active:bg-gray-400"
        onMouseDown={onResizeStart}
      />
    </div>
  );
}

export type { SidebarPresenterProps, TreeNodeProps };