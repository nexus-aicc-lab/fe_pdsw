"use client";

import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import SkilFilterOptionPannelForCampaignTab from "./SkilFilterOptionPannelForCampaignTab";

const IButtonForFilterCampaignAboutCheckedSkils = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="p-2" size={"sm"}>
          {/* 아이콘이 있다면 Icon 컴포넌트를 사용하거나, 텍스트로 표시할 수 있습니다 */}
          <span>Skill</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <SkilFilterOptionPannelForCampaignTab shouldCloseOnConfirm />
      </PopoverContent>
    </Popover>
  );
};

export default IButtonForFilterCampaignAboutCheckedSkils;
