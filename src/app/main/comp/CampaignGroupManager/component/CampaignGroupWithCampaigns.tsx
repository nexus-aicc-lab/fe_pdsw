import React, { useEffect, useState } from 'react';
import DataGrid from "react-data-grid";
import TitleWrap from "@/components/shared/TitleWrap";
import { useApiForCampaignGroupCampaignList } from "@/features/preferences/hooks/useApiForCampaignGroupList";
import { CampaignGroup, GroupCampaign } from '@/features/campaignManager/types/typeForCampaignGroup';
import { useApiForCampaignGroupDataForCampaignGroupAdmin } from '@/features/preferences/hooks/useApiForapiForCampaignGroupDataForCampaignGroupAdmin';

interface Props {
    groupId: string;
    groupName: string;
    // onCampaignSelect: (id: string) => void;
}

interface GroupRow {
    no: number;
    tenant: string;
    groupId: number;
    groupName: string;
}

interface CampaignRow {
    no: number;
    tenant: string | null;
    campaignId: number;
    campaignName: string;
}

const CampaignGroupWithCampaigns = ({ groupId, groupName }: Props) => {
    const [groupRows, setGroupRows] = useState<GroupRow[]>([]);
    const [campaignRows, setCampaignRows] = useState<CampaignRow[]>([]);
    
    // Columns for the group grid
    const groupColumns = [
        { key: "no", name: "NO." },
        { key: "tenant", name: "테넌트" },
        { key: "groupId", name: "캠페인 그룹 아이디" },
        { key: "groupName", name: "캠페인 그룹명" },
    ];
    
    // Columns for the campaigns grid
    const campaignColumns = [
        { key: "no", name: "NO." },
        { key: "tenant", name: "테넌트" },
        { key: "campaignId", name: "캠페인 아이디" },
        { key: "campaignName", name: "캠페인명" },
    ];

    // Fetch group data
    const { data: groupData, isLoading: isGroupLoading } = useApiForCampaignGroupDataForCampaignGroupAdmin(
        groupId ? parseInt(groupId) : undefined
    );
    
    // Fetch campaigns for this group
    const { data: campaignData, isLoading: isCampaignLoading } = useApiForCampaignGroupCampaignList(
        groupId ? parseInt(groupId) : 0
    );

    // Process group data when it's loaded
    useEffect(() => {
        if (groupData && groupData.result_data) {
            const rows = groupData.result_data.map((group: CampaignGroup, index: number) => ({
                no: index + 1,
                tenant: "NONE", // Replace with actual tenant name if available
                groupId: group.group_id,
                groupName: group.group_name,
            }));
            setGroupRows(rows);
        }
    }, [groupData]);

    // Process campaign data when it's loaded
    useEffect(() => {
        if (campaignData && campaignData.result_data) {
            const rows = campaignData.result_data.map((campaign: GroupCampaign, index: number) => ({
                no: index + 1,
                tenant: "NONE", // Replace with actual tenant name if available
                campaignId: campaign.campaign_id,
                campaignName: campaign.campaign_name,
            }));
            setCampaignRows(rows);
        }
    }, [campaignData]);

    const handleCampaignCellClick = (args: any) => {
        // onCampaignSelect(args.row.campaignId.toString());
    };

    return (
        <div className="w-[40%] shrink-0">
            <TitleWrap title={`캠페인 그룹 검색목록 (총 ${groupRows.length}건)`} />
            <div className="overflow-x-auto">
                <div className="grid-custom-wrap h-[200px]">
                    <DataGrid 
                        columns={groupColumns} 
                        rows={groupRows} 
                        className="grid-custom" 
                        rowHeight={30}
                        headerRowHeight={30}
                    />
                </div>
            </div>
            
            <TitleWrap title={`캠페인 그룹 소속 캠페인 검색목록 (총 ${campaignRows.length}건)`} className="mt-5" />
            <div className="overflow-x-auto">
                <div className="grid-custom-wrap h-[200px]">
                    <DataGrid 
                        columns={campaignColumns} 
                        rows={campaignRows} 
                        className="grid-custom" 
                        rowHeight={30}
                        headerRowHeight={30}
                        onCellClick={handleCampaignCellClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default CampaignGroupWithCampaigns;