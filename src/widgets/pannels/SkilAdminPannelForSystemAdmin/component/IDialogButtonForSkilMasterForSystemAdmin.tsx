// src/widgets/dialogs/IDialogButtonForSkilMasterForSystemAdmin.tsx
"use client";

import React, { useEffect, useState } from "react";
import CustomAlert from "@/components/shared/layout/CustomAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiForCreateSkillForSystemAdmin } from "@/shared/hooks/skill/useApiForCreateSkillForSystemAdmin";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Hash, Tag, FileText } from "lucide-react";

interface IDialogButtonForSkilMasterProps {
  tenantOptions: { label: string; value: number }[];
  defaultTenantId?: number;
  onSuccess?: () => void;
  buttonText?: string;
}

const IDialogButtonForSkilMasterForSystemAdmin = ({
  tenantOptions,
  defaultTenantId,
  onSuccess,
  buttonText = "+ 스킬 추가",
}: IDialogButtonForSkilMasterProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tenantId, setTenantId] = useState<number>(0);
  const [skillId, setSkillId] = useState("");
  const [skillName, setSkillName] = useState("");
  const [skillDescription, setSkillDescription] = useState("");

  const mutation = useApiForCreateSkillForSystemAdmin();

  useEffect(() => {
    if (open && defaultTenantId) {
      setTenantId(defaultTenantId);
    }
  }, [open, defaultTenantId]);

  const handleCreate = async () => {
    try {
      await mutation.mutateAsync({
        skill_id: skillId,
        request: {
          request_data: {
            tenant_id: tenantId,
            skill_name: skillName,
            skill_description: skillDescription,
          },
        },
      });
      toast.success("스킬 생성 성공");
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["skillListForSystemAdmin"] });
      resetForm();
      setOpen(false);
    } catch (err) {
      toast.error("스킬 생성 실패");
    }
  };

  const resetForm = () => {
    setSkillId("");
    setSkillName("");
    setSkillDescription("");
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {buttonText}
      </Button>
      {open && (
        <CustomAlert
          title="스킬 마스터 추가"
          type="1"
          isOpen={true}
          onClose={handleCreate}
          onCancel={() => setOpen(false)}
          message={
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm">
                  <Building2 className="w-4 h-4 mr-1" />
                  테넌트 선택
                </label>
                <select
                  className="border rounded p-1 w-full"
                  value={tenantId}
                  onChange={(e) => setTenantId(Number(e.target.value))}
                >
                  {tenantOptions.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm">
                  <Hash className="w-4 h-4 mr-1" />
                  스킬 ID
                </label>
                <Input
                  value={skillId}
                  onChange={(e) => setSkillId(e.target.value)}
                  placeholder="예: 5001"
                />
              </div>
              <div>
                <label className="flex items-center text-sm">
                  <Tag className="w-4 h-4 mr-1" />
                  스킬 이름
                </label>
                <Input
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="예: 상담용 스킬"
                />
              </div>
              <div>
                <label className="flex items-center text-sm">
                  <FileText className="w-4 h-4 mr-1" />
                  스킬 설명
                </label>
                <Input
                  value={skillDescription}
                  onChange={(e) => setSkillDescription(e.target.value)}
                  placeholder="예: 상담용 스킬 설명"
                />
              </div>
            </div>
          }
        />
      )}
    </>
  );
};

export default IDialogButtonForSkilMasterForSystemAdmin;
