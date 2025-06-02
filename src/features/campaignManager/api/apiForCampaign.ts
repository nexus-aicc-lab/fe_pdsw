// src\features\campaignManager\api\apiForCampaign.ts
// 사이드바 메뉴에 표시할 캠페인 리스트를 가져오는 API 함수

// src/features/campaignManager/api/apiForCampaignList.ts
import { axiosInstance } from "@/lib/axios";
import { CampaignApiError, CampaignListResponse } from "../types/typeForCampaignForSideBar";
import { customAlertService } from "@/components/shared/layout/utils/CustomAlertService";


export const apiForGetCampaignList = async (): Promise<CampaignListResponse> => {
    const campaignRequestData = {
        sort: {
            campaign_id: 0,
        },
    };

    try {
        const { data } = await axiosInstance.post<CampaignListResponse>(
            '/collections/campaign',
            campaignRequestData
        );

        if (data.result_code === 0 && data.result_msg === "Success") {
            // console.log("api for campaign data check : ", data);
            return data;
        } else {
            throw new Error(`API Error: ${data.result_msg}`);
        }
    } catch (error:any) {

        // if (error.response.data.result_code === 5) {
        //     // 세션 만료 시 알럿 표시 후 로그인 페이지로 리다이렉트
        //     customAlertService.error('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.', '세션 만료', () => {
        //       window.location.href = '/login';
        //     });
        //   }

        const typedError = error as CampaignApiError;
        throw new Error(
            typedError.response?.data?.result_msg || '캠페인 목록을 가져오는데 실패했습니다.'
        );
    }
};