import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useSideMenuCampaignGroupTabStore } from "@/store/storeForSideMenuCampaignGroupTab";

/**
 * 캠페인/그룹 검색 바 컴포넌트
 */
interface SearchBarForSideMenuForCampaignGroupTabProps {
  placeholder?: string;
}

export const SearchBarForSideMenuForCampaignGroupTab: React.FC<SearchBarForSideMenuForCampaignGroupTabProps> = ({
  placeholder = "캠페인 또는 그룹 검색..."
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFeedback, setSearchFeedback] = useState<{
    message: string;
    type: "success" | "error" | "idle";
  }>({ message: "", type: "idle" });

  // Get searchNode function directly from the store
  const searchNode = useSideMenuCampaignGroupTabStore(state => state.searchNode);

  // 피드백 메시지가 표시된 후 일정 시간 후에 자동으로 사라지게 처리
  useEffect(() => {
    if (searchFeedback.type !== "idle") {
      const timer = setTimeout(() => {
        setSearchFeedback({ message: "", type: "idle" });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [searchFeedback]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Use the store's searchNode function
      const foundNodeId = searchNode(searchTerm);
      
      if (foundNodeId) {
        setSearchFeedback({ 
          message: "항목을 찾았습니다.", 
          type: "success"
        });
      } else {
        setSearchFeedback({ 
          message: "검색 결과가 없습니다.", 
          type: "error" 
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full px-2 py-1">
      <div className="relative">
        {/* 검색창 */}
        <div className="flex items-center border rounded w-full relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-none rounded outline-none pl-2 pr-7 py-1 text-sm w-full"
            placeholder={placeholder}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="검색"
          >
            <Search size={14}/>
          </button>
        </div>
        
        {/* 피드백 메시지 */}
        {searchFeedback.message && (
          <div 
            className={`text-xs mt-1 px-2 py-1 rounded ${
              searchFeedback.type === "success" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}
          >
            {searchFeedback.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBarForSideMenuForCampaignGroupTab;