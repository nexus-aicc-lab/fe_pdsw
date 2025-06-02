interface Props {
    campaignId?: string;
}

const CampaignUpdatePanel = ({ campaignId }: Props) => {
    return (
        <div>
            CampaignUpdatePanel - Campaign ID: {campaignId}
        </div>
    )
}

export default CampaignUpdatePanel