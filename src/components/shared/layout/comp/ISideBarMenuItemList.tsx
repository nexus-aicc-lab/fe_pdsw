"use client";

import { MainDataResponse } from "@/features/auth/types/mainIndex";
import { ITenant } from "@/features/campaignManager/types/typeForMainSideBar";
import Image from "next/image";

interface ISideBarMenuItemListProps {
  _tenantId: number;
  tenants: ITenant[];  // any[] 대신 ITenant[] 사용
  campaigns: MainDataResponse[];
  expandedTenants: number[];
  toggleTenant: (tenantId: number) => void;
  handleCampaignClick: (campaign: MainDataResponse) => void;
}

export default function ISideBarMenuItemList({
  _tenantId,
  tenants,
  campaigns,
  expandedTenants,
  toggleTenant,
  handleCampaignClick,
}: ISideBarMenuItemListProps) {
  // 기존에 Sidebar 컴포넌트 안의 renderContent() 함수에서
  // UI를 그리던 부분만 그대로 옮겨옵니다.
  
  // (중간 콘솔 로그도 모두 그대로 사용 가능)

  // 필요하다면 추가로 props나 함수를 활용하여 로직을 동작시킵니다.

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <p>등록된 캠페인이 없습니다.</p>
        <p className="text-sm mt-2">캠페인을 추가해주세요.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-2 cursor-pointer flex items-center">
        <Image
          src="/sidebar-menu/company_icon.svg"
          alt="Company"
          width={16}
          height={16}
          className="object-contain mr-2"
        />
        <span className="text-sm font-semibold text-gray-700">NEXUS</span>
      </div>

      {/* _tenantId === 0 인 경우와 아닌 경우에 대한 분기 */}
      {_tenantId === 0 ? (
        tenants.map((tenant) => (
          <div key={tenant.tenant_id} className="mb-1 ml-2">
            <div
              className="p-2 cursor-pointer flex items-center justify-between"
              onClick={() => toggleTenant(tenant.tenant_id)}
            >
              <div className="flex items-center">
                <Image
                  src={`/sidebar-menu/${
                    expandedTenants.includes(tenant.tenant_id)
                      ? "arrow_minus"
                      : "arrow_plus"
                  }.svg`}
                  alt="Toggle"
                  width={12}
                  height={12}
                  className="object-contain mx-1"
                />
                <Image
                  src="/sidebar-menu/tree_folder.svg"
                  alt="Folder"
                  width={16}
                  height={16}
                  className="object-contain mr-2"
                />
                <span className="text-sm font-semibold text-gray-700">
                  [ {tenant.tenant_id} ] {tenant.tenant_name}
                </span>
              </div>
            </div>
            {expandedTenants.includes(tenant.tenant_id) && (
              <div className="pl-7">
                {campaigns
                  .filter((campaign) => campaign.tenant_id === tenant.tenant_id)
                  .map((campaign) => (
                    <div
                      key={campaign.campaign_id}
                      onClick={() => handleCampaignClick(campaign)}
                      className="p-1 hover:bg-gray-100 cursor-pointer flex items-center"
                    >
                      <Image
                        src="/sidebar-menu/tree_folder.svg"
                        alt="Campaign"
                        width={14}
                        height={14}
                        className="object-contain mr-2"
                      />
                      <span className="text-sm text-gray-600">
                        {campaign.campaign_name}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))
      ) : (
        tenants
          .filter((tenant) => tenant.tenant_id === _tenantId)
          .map((tenant) => (
            <div key={tenant.tenant_id} className="mb-1">
              <div
                className="p-2 cursor-pointer flex items-center justify-between"
                onClick={() => toggleTenant(tenant.tenant_id)}
              >
                <div className="flex items-center">
                  <Image
                    src="/sidebar-menu/folder.svg"
                    alt="Folder"
                    width={16}
                    height={16}
                    className="object-contain mr-2"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    [ {tenant.tenant_id} ] {tenant.tenant_name}
                  </span>
                </div>
                <Image
                  src={`/sidebar-menu/${
                    expandedTenants.includes(tenant.tenant_id)
                      ? "opened"
                      : "closed"
                  }.svg`}
                  alt="Toggle"
                  width={12}
                  height={12}
                  className="object-contain"
                />
              </div>
              {expandedTenants.includes(tenant.tenant_id) && (
                <div className="pl-7">
                  {campaigns
                    .filter((campaign) => campaign.tenant_id === tenant.tenant_id)
                    .map((campaign) => (
                      <div
                        key={campaign.campaign_id}
                        onClick={() => handleCampaignClick(campaign)}
                        className="p-1 hover:bg-gray-100 cursor-pointer flex items-center"
                      >
                        <Image
                          src="/sidebar-menu/tree_folder.svg"
                          alt="Campaign"
                          width={14}
                          height={14}
                          className="object-contain mr-2"
                        />
                        <span className="text-sm text-gray-600">
                          {campaign.campaign_name}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
      )}
    </div>
  );
}
