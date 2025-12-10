import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from 'next/image'
import { SortType } from '@/features/campaignManager/types/typeForSidebar2';
import CommonButton from "@/components/shared/CommonButton";

interface Props {
  onSort?: (type: SortType) => void;
  selectedSort?: SortType;
}

const counsellorGroupSortOptions: Array<{ id: SortType; label: string }> = [
  { id: 'name', label: '이름순' },
  { id: 'department', label: '부서순' },
  { id: 'memberCount', label: '인원순' },
  { id: 'status', label: '상태순' }
];

const SortButtonForCounsellorGroup = ({ 
  onSort, 
  selectedSort 
}: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <CommonButton 
          variant="ghost" 
          size="sm" 
          className="text-xs font-normal gap-[2px]  hover:bg-[transparent] text-[#888] !p-0"
        >
          정렬
          <Image 
            src={`/tree-menu/array.png`} 
            alt={`정렬`} 
            width={9} 
            height={10} 
          />
        </CommonButton>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-1" align="end">
        <div className="flex flex-col">
          {counsellorGroupSortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSort?.(option.id)}
              className={`flex items-center justify-between text-left px-2 py-1.5 text-xs hover:bg-gray-100 rounded
                ${selectedSort === option.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-800'}`}
            >
              {option.label}
              {selectedSort === option.id && (
                <svg className="w-3 h-3" viewBox="0 0 24 24">
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

export default SortButtonForCounsellorGroup;