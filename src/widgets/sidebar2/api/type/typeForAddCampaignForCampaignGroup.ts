// // sidebar\api\type\typeForAddCampaignForCampaignGroup.ts
// // 스킬 API 요청을 위한 타입 정의
// export interface SkillListRequest {
//   filter: {
//     skill_id?: {
//       start: number;
//       end: number;
//     };
//     tenant_id?: number[];
//   };
//   sort?: {
//     skill_id?: number;
//     tenant_id?: number;
//   };
//   page?: {
//     index: number;
//     items: number;
//   };
// }

// // 스킬 정보 아이템 타입
// export interface SkillInfo {
//   tenant_id: number;
//   skill_id: number;
//   skill_name: string;
//   skill_description: string;
// }

// // 스킬 API 응답 타입
// export interface SkillListResponse {
//   result_code: number;
//   result_msg: string;
//   result_count: number;
//   result_data: SkillInfo[];
// }

// // 캠페인 API 요청을 위한 타입 정의
// export interface CampaignListRequest {
//   filter: {
//     tenant_id?: {
//       start: number;
//       end: number;
//     };
//   };
//   sort?: {
//     tenant_id?: number;
//   };
//   page?: {
//     index: number;
//     items: number;
//   };
// }

// // 캠페인 정보 아이템 타입
// export interface CampaignInfo {
//   campaign_id: number;
//   campaign_name: string;
//   campaign_desc: string;
//   tenant_id: number;
// }

// // 캠페인 API 응답 타입
// export interface CampaignListResponse {
//   result_code: number;
//   result_msg: string;
//   result_count: number;
//   total_count: number;
//   result_data: CampaignInfo[];
// }

// // 캠페인 스킬 조회 요청 인터페이스
// export interface CampaignSkillsRequest {
//   // filter: {
//   //   skill_id?: {
//   //     start: number;
//   //     end: number;
//   //   };
//   // };
//   sort?: {
//     skill_id?: number;
//   };
//   page?: {
//     index: number;
//     items: number;
//   };
// }

// // 캠페인에 할당된 스킬 정보 인터페이스
// export interface CampaignSkillsInfo {
//   campaign_id: number;
//   tenant_id: number;
//   skill_id: number[];
// }

// // 캠페인 스킬 조회 응답 인터페이스
// export interface CampaignSkillsResponse {
//   result_code: number;
//   result_msg: string;
//   result_count: number;
//   total_count: number;
//   result_data: CampaignSkillsInfo[];
// }

// // 캠페인 그룹에 대한 캠페인 목록 조회 요청 인터페이스
// export interface CampaignGroupSkillsRequest {
//   filter: {
//     group_id: number[]; // 빈 배열도 가능하도록 설정
//     campaign_id: {
//       start: number;
//       end: number;
//     };
//   };
//   sort?: {
//     campaign_id?: number; // 정렬 기준을 campaign_id로 변경
//   };
//   page?: {
//     index: number;
//     items: number;
//   };
// }


// // 캠페인 그룹 정보 인터페이스
// export interface CampaignGroupSkillsInfo {
//   tenant_id: number;
//   group_id: number;
//   group_name: string;
//   campaign_id: number;
//   campaign_name: string;
//   start_flag: number;
// }

// // 캠페인 그룹 스킬 조회 응답 인터페이스
// export interface CampaignGroupSkillsResponse {
//   result_code: number;
//   result_msg: string;
//   result_count: number;
//   total_count: number;
//   result_data: CampaignGroupSkillsInfo[];
// }

// sidebar\api\type\typeForAddCampaignForCampaignGroup.ts
// 스킬 API 요청을 위한 타입 정의
export interface SkillListRequest {
  filter: {
    skill_id?: {
      start: number;
      end: number;
    };
    tenant_id?: number[];
  };
  sort?: {
    skill_id?: number;
    tenant_id?: number;
  };
  page?: {
    index: number;
    items: number;
  };
}

// 스킬 정보 아이템 타입
export interface SkillInfo {
  tenant_id: number;
  skill_id: number;
  skill_name: string;
  skill_description: string;
}

// 스킬 API 응답 타입
export interface SkillListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  result_data: SkillInfo[];
}

// 캠페인 API 요청을 위한 타입 정의
export interface CampaignListRequest {
  filter: {
    tenant_id?: {
      start: number;
      end: number;
    };
  };
  sort?: {
    tenant_id?: number;
  };
  page?: {
    index: number;
    items: number;
  };
}

// 캠페인 정보 아이템 타입
export interface CampaignInfo {
  campaign_id: number;
  campaign_name: string;
  campaign_desc: string;
  tenant_id: number;
}

// 캠페인 API 응답 타입
export interface CampaignListResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: CampaignInfo[];
}

// 캠페인 스킬 조회 요청 인터페이스
export interface CampaignSkillsRequest {
  // filter: {
  //   skill_id?: {
  //     start: number;
  //     end: number;
  //   };
  // };
  sort?: {
    skill_id?: number;
  };
  page?: {
    index: number;
    items: number;
  };
}

// 캠페인에 할당된 스킬 정보 인터페이스
export interface CampaignSkillsInfo {
  campaign_id: number;
  tenant_id: number;
  skill_id: number[];
}

// 캠페인 스킬 조회 응답 인터페이스
export interface CampaignSkillsResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: CampaignSkillsInfo[];
}

// 캠페인 그룹에 대한 캠페인 목록 조회 요청 인터페이스
export interface CampaignGroupSkillsRequest {
  filter: {
    group_id: number[]; // 빈 배열도 가능하도록 설정
    campaign_id: {
      start: number;
      end: number;
    };
  };
  sort?: {
    campaign_id?: number; // 정렬 기준을 campaign_id로 변경
  };
  page?: {
    index: number;
    items: number;
  };
}


// 캠페인 그룹 정보 인터페이스
export interface CampaignGroupSkillsInfo {
  tenant_id: number;
  group_id: number;
  group_name: string;
  campaign_id: number;
  campaign_name: string;
  start_flag: number;
}

// 캠페인 그룹 스킬 조회 응답 인터페이스
export interface CampaignGroupSkillsResponse {
  result_code: number;
  result_msg: string;
  result_count: number;
  total_count: number;
  result_data: CampaignGroupSkillsInfo[];
}
