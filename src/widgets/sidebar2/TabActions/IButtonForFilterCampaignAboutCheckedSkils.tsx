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
