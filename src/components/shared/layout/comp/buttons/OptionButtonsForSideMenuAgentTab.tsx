"use client";

import React, { useState } from "react";
import { FilterIcon } from "lucide-react";
import CommonButton from "@/components/shared/CommonButton";
import { useCounselorFilterStore } from "@/store/storeForSideMenuCounselorTab";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ISortButtonForSideMenuCounselorTab from "./ISortButtonForSideMenuCounselorTab";

const OptionButtonsForSideMenuAgentTab = () => {
  return (
    <div className="flex gap-2">
      {/* 정렬 버튼 */}
      <ISortButtonForSideMenuCounselorTab />
    </div>
  );
};

export default OptionButtonsForSideMenuAgentTab;
