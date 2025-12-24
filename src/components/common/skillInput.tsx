// skillInput.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";

type skillInputProps = {
  value: string;
  campaignId: number;
  onOpenPopup: () => void;
}

const skillInput: React.FC<skillInputProps> = ({ value, campaignId, onOpenPopup }) => {
  return (
    <div className="flex items-center gap-2 relative">
      <Label className="w-[74px] min-w-[74px]">스킬</Label>
      <CustomInput value={campaignId === 0 ? "" : value} readOnly />
      
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6"
        onClick={onOpenPopup}
      >
        <Image
          src="/skill-popup.svg"
          alt="스킬팝업"
          width={12}
          height={12}
          priority
        />
      </button>
    </div>
  );
};

export default skillInput;
