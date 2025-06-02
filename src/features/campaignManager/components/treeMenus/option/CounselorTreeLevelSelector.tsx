"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Layers } from "lucide-react";

interface CounselorTreeLevelSelectorProps {
  onExpandToLevel: (level: number) => void;
  onToggleAllNodes: (isExpanded: boolean) => void;
  onApplyDefaultExpansion: () => void;
}

export function CounselorTreeLevelSelector({
  onExpandToLevel,
  onToggleAllNodes,
  onApplyDefaultExpansion
}: CounselorTreeLevelSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs py-1 !px-2 flex items-center gap-1 border-[#ebebeb] border rounded-[3px] text-[#888] h-[26px] "
        >
          {/* <Layers size={14} /> */}
          lev 
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[150px] p-0 py-[10px] px-[12px] rounded-[3px] border border-[#333]" align="end">
        <div className="flex flex-col space-y-[2px]">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onExpandToLevel(1)}
            className="text-sm rounded-[3px] px-[6px] py-[4px] justify-start h-[26px]"
          >
            <Image src="/tree-menu/organization.png" alt="조직" width={14} height={12} className="mr-1" />
            1. 센터 {/* 0522 QA요청으로 인한 조직 -> 센터 로 변경 */}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onExpandToLevel(2)}
            className="text-sm rounded-[3px] px-[6px] py-[4px] justify-start h-[26px]"
          >
            <Image src="/tree-menu/tennant_office.png" alt="테넌트" width={14} height={12} className="mr-1" />
            2. 테넌트
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onExpandToLevel(3)}
            className="text-sm rounded-[3px] px-[6px] py-[4px] justify-start h-[26px]"
          >
            <Image src="/tree-menu/group_icon_for_tree.png" alt="그룹" width={15} height={12} className="mr-1" />
            3. 그룹
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onExpandToLevel(4)}
            className="text-sm rounded-[3px] px-[6px] py-[4px] justify-start h-[26px]"
          >
            <Image src="/tree-menu/team_icon_for_tree.png" alt="팀" width={14} height={12} className="mr-1" />
            4. 팀
          </Button>
          <hr className="my-1" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onToggleAllNodes(true)}
            className="text-sm rounded-[3px] px-[6px] py-[4px] justify-start h-[26px]"
          >
            <Layers size={14} className="mr-1" />
            전체
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onToggleAllNodes(false)}
            className="text-sm rounded-[3px] px-[6px] py-[4px] justify-start h-[26px]"
          >
            <Layers size={14} className="mr-1" />
            닫기
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}