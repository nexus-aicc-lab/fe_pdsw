import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useSideMenuCampaignGroupTabStore } from "@/store/storeForSideMenuCampaignGroupTab";
import CommonButton from '@/components/shared/CommonButton';

interface ISearchButtonProps {
  onSearch?: (searchTerm: string) => void;
}

const ISearchButtonForFindForGroupOrCampaign: React.FC<ISearchButtonProps> = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFeedback, setSearchFeedback] = useState<{
    message: string;
    type: "success" | "error" | "idle";
  }>({ message: "", type: "idle" });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  
  // Get searchNode function directly from the store
  const searchNode = useSideMenuCampaignGroupTabStore(state => state.searchNode);

  // Handle clicks outside the search box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current && 
        !searchBoxRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Reset search state when opening
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchFeedback({ message: "", type: "idle" });
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Use the store's searchNode function
      const foundNodeId = searchNode(searchTerm);
      
      if (foundNodeId) {
        // On success, close the search box after a brief delay
        setSearchFeedback({ 
          message: "항목을 찾았습니다.", 
          type: "success"
        });
        
        // Also call the passed onSearch if provided
        if (onSearch) {
          onSearch(searchTerm);
        }
        
        // Close the search box after a short delay so user can see success message
        setTimeout(() => {
          setIsOpen(false);
        }, 1000);
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
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <CommonButton 
        ref={buttonRef}
        onClick={handleToggle}
        variant="ghost" 
        size="sm" 
        className="text-xs font-normal gap-[2px] hover:bg-[transparent] text-[#888] !p-0 flex items-center"
        aria-label="검색"
      >
        검색
        <Search className="h-3 w-3" />
      </CommonButton>

      {isOpen && (
        <div
          ref={searchBoxRef}
          className="absolute top-full mt-1 right-0 transform translate-x-[26%] bg-white shadow-md rounded p-2 z-10 min-w-[240px] border border-[#333] rounded-[3px]"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border rounded px-2 py-1 text-sm w-full"
                placeholder="캠페인 또는 그룹 검색..."
              />
              <button
                onClick={handleSearch}
                className="text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1 text-sm"
              >
                검색
              </button>
            </div>
            
            {/* Feedback message */}
            {searchFeedback.message && (
              <div 
                className={`text-sm px-2 py-1 rounded ${
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
      )}
    </div>
  );
};

export default ISearchButtonForFindForGroupOrCampaign;