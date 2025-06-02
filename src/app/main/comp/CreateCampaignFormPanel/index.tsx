// C:\Users\terec\fe_pdsw\src\app\main\comp\CampaignManager\index.tsx
import React, { useState, useEffect } from 'react'
// import { useApiForSchedules } from '@/features/campaignManager/hooks/useApiForSchedules';
// import { useApiForSkills } from '@/features/campaignManager/hooks/useApiForSkills';
// import { useApiForCallingNumber } from '@/features/campaignManager/hooks/useApiForCallingNumber';
// import { useApiForCampaignSkill } from '@/features/campaignManager/hooks/useApiForCampaignSkill';
// import { useApiForPhoneDescription } from '@/features/campaignManager/hooks/useApiForPhoneDescription';
import { useMainStore, useCampainManagerStore, useTabStore } from '@/store';
import CreateCampaignFormsContainer from './comp/CreateCampaignFormsContainer';

type Props = {
  tenantId?: string;
}

const CreateCampaignFormPanel = ({ tenantId }: Props) => {

  const { tenants } = useMainStore();
  const { campaignIdForUpdateFromSideMenu } = useTabStore();

  const { setSchedules, setSkills, setCallingNumbers, setCampaignSkills, setPhoneDescriptions } = useCampainManagerStore();

  useEffect(() => {
    if (typeof tenantId !== 'undefined') {
      console.log("새캠페인 탭에 전달된 tenant id", tenantId);
    }
  }, [tenantId]);

  return (
    <div>
      <div className='flex flex-col gap-[15px]'>
        <div className="flex gap-[30px]">
          <CreateCampaignFormsContainer tenantId={tenantId} />
        </div>
      </div>
    </div>
  )
}

export default CreateCampaignFormPanel