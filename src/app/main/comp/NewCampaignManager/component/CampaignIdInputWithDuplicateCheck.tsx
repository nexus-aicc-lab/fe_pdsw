// src/components/form/CampaignIdInputWithDuplicateCheck.tsx
"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CustomAlert from "@/components/shared/layout/CustomAlert";
import { useMainStore } from "@/store";
import { CustomInputNumber } from "@/components/shared/CustomInputNumber";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  onBlur?: () => void;
}

const CampaignIdInputWithDuplicateCheck: React.FC<Props> = ({
  value,
  onChange,
  onBlur,
}) => {
  const campaigns = useMainStore((state) => state.campaigns);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState<React.ReactNode>(null);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertType, setAlertType] = useState("1");

  const handleCheckDuplicate = () => {
    if (!value || isNaN(Number(value))) {
      setAlertTitle("입력 오류");
      setAlertContent("유효한 캠페인 ID를 입력해주세요.");
      setIsAlertOpen(true);
      return;
    }

    const inputId = Number(value);
    const isDuplicate = campaigns.some(
      (campaign) => campaign.campaign_id === inputId
    );

    if (isDuplicate) {
      const rows = campaigns
        .map((c) => c.campaign_id)
        .sort((a, b) => a - b)
        .map((id) => (
          <tr key={id}>
            <td className="border px-2 py-1 text-center">{id}</td>
            <td className="border px-2 py-1 text-center">
              {id === inputId ? "🔴 중복" : ""}
            </td>
          </tr>
        ));

      setAlertTitle("중복 캠페인 ID");
      setAlertContent(
        <div>
          <p className="mb-2">입력한 캠페인 ID <strong>{inputId}</strong>는 이미 존재합니다.</p>
          <div className="max-h-[200px] overflow-auto border rounded-md">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border px-2 py-1">캠페인 ID</th>
                  <th className="border px-2 py-1">상태</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </div>
        </div>
      );
    } else {
      setAlertTitle("사용 가능");
      setAlertContent(
        <p>
          입력한 캠페인 ID <strong>{inputId}</strong>는 사용 가능합니다.
        </p>
      );
    }

    setIsAlertOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      <Label className="w-[90px] min-w-[90px]">캠페인 아이디</Label>
      <CustomInputNumber
        value={value}
        onChange={(value) => onChange(value)}
        className=""
        min="0"
        onBlur={onBlur}
      />
      <Button variant="outline" size="sm" onClick={handleCheckDuplicate}>
        중복 확인
      </Button>

      <CustomAlert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertContent}
        type={alertType}
      />
    </div>
  );
};

export default CampaignIdInputWithDuplicateCheck;
