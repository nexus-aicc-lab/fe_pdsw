"use client";

import { TreeRoot } from "../tree-structure/TreeRootForCampaign";

const CampaignSkillsForSystemAdmin = () => {
  return (
    <div className="p-4 bg-white rounded border shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-800">캠페인 스킬 관리</h2>
        <p className="text-sm text-gray-600">테넌트와 캠페인 스킬을 관리합니다. 상위 항목 선택 시 하위 항목도 자동으로 선택됩니다.</p>
      </div>
      <TreeRoot />
    </div>
  );
};

export default CampaignSkillsForSystemAdmin;