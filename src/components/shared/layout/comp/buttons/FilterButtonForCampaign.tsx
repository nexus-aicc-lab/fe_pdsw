import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { FilterType } from '@/features/campaignManager/types/typeForSidebar2';
import Image from 'next/image'

interface FilterButtonForCampaignProps {
  onFilter?: (type: FilterType) => void;
  selectedFilter?: FilterType;
}

const campaignFilterOptions: Array<{ id: FilterType; label: string }> = [
  { id: 'all', label: '전체보기' },
  { id: 'inbound', label: '인바운드' },
  { id: 'outbound', label: '아웃바운드' },
];

export function FilterButtonForCampaign({ 
  onFilter, 
  selectedFilter 
}: FilterButtonForCampaignProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-0 text-sm font-normal gap-1 text-[#888] hover:bg-transparent">
          필터
           <Image 
              src={`/tree-menu/filter.png`} 
              alt={`필터`} 
              width={9} 
              height={10} 
            />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-28 p-1" align="end">
        <div className="flex flex-col">
          {campaignFilterOptions.map((option) => (
            <button
              key={option.id}
              // onClick={() => onFilter(option.id)}
              className={`flex items-center justify-between text-left px-2 py-1.5 text-xs hover:bg-gray-100 rounded
                ${selectedFilter === option.id ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              {option.label}
              {selectedFilter === option.id && (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path 
                    fill="currentColor" 
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}