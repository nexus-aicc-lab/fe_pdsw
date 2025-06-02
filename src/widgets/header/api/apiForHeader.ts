// src\widgets\header\api\apiForHeader.ts

import { axiosRedisInstance } from "@/lib/axios";
import { 
  IRequestTypeForGetAuthorizedMenusInfoForMenuRoleId,
  IResponseTypeForGetAuthorizedMenusInfoForMenuRoleId 
} from "./typeForMenusAuthorityInfo";
import axios from "axios";
// axiosRedisInstance
/**
 * 사용자 권한에 따른 사용가능한 메뉴 리스트를 가져오는 API 함수
 * @param param0 roleId - 역할 ID (1: 시스템관리자, 2: 테넌트관리자01, 3: 테넌트관리자02)
 * @returns 사용가능한 메뉴 리스트 정보
 */
export async function apiForGetAuthorizedMenusInfoForMenuRoleId({
  roleId
}: IRequestTypeForGetAuthorizedMenusInfoForMenuRoleId): Promise<IResponseTypeForGetAuthorizedMenusInfoForMenuRoleId> {


    const response = await axiosRedisInstance.get(
    `/auth/availableMenuList?roleId=${roleId}`
  );  
  // console.log("Available menu list response:", response.data);
  return response.data;
}