// C:\Users\terec\fe_pdsw\src\app\main\comp\CampaignManager\index.tsx
import React, { useEffect } from 'react'
import NewCampaignManagerDetail from './NewCampaignManagerDetail';

type Props = {
  tenantId?: string;
  is_new?: boolean;
}

const NewCampaignManager = ({tenantId, is_new}: Props) => {
  
  // console.log("NewCampaignManager tenantId : ", tenantId);
  // console.log("NewCampaignManager is_new : ", is_new);
  

  return (
    <div>
      <div className='flex flex-col gap-[15px]'>
          <div className="flex gap-[30px]">
            <NewCampaignManagerDetail tenantId={tenantId} is_new={is_new}/>
          </div> 
        </div>
    </div>
  )
}

export default NewCampaignManager