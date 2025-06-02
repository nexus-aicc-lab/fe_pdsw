import { useState, useEffect } from 'react';
import { 
  apiForGetAuthorizedMenusInfoForMenuRoleId 
} from '../api/apiForHeader';
import { 
  IMenuInfo, 
  IResponseTypeForGetAuthorizedMenusInfoForMenuRoleId 
} from '../api/typeForMenusAuthorityInfo';
import { useAvailableMenuStore } from '@/store/useAvailableMenuStore';

interface UseApiForGetAuthorizedMenusInfoForMenuRoleIdProps {
  roleId: number;
  enabled?: boolean;
}

interface UseApiForGetAuthorizedMenusInfoForMenuRoleIdReturn {
  data: IResponseTypeForGetAuthorizedMenusInfoForMenuRoleId | null;
  menuList: IMenuInfo[];
  headerMenuList: IMenuInfo[];
  headerMenuIds: number[];
  campaignTenantContextMenuList: IMenuInfo[];
  campaignTenantContextMenuIds: number[];
  campaignTabCampaignContextMenuList: IMenuInfo[];
  campaignTabCampaignContextMenuIds: number[];
  skillAssignmentMenuList: IMenuInfo[];
  skillAssignmentMenuIds: number[];
  // 추가된 반환값
  campaignGroupTabTenantMenuList: IMenuInfo[];
  campaignGroupTabTenantMenuIds: number[];
  campaignGroupTabCampaignGroupMenuList: IMenuInfo[];
  campaignGroupTabCampaignGroupMenuIds: number[];
  campaignGroupTabCampaignMenuList: IMenuInfo[];
  campaignGroupTabCampaignMenuIds: number[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

/**
 * 권한이 있는 메뉴 정보를 가져오는 custom hook
 * 메뉴 정보를 가져온 후 자동으로 useAvailableMenuStore에 저장합니다.
 * @param roleId 역할 ID (1: 시스템관리자, 2: 테넌트관리자01, 3: 테넌트관리자02)
 * @param enabled 자동으로 API 호출을 시작할지 여부 (기본값: true)
 * @returns 메뉴 데이터, 로딩 상태, 에러 상태, refetch 함수
 */
export const useApiForGetAuthorizedMenusInfoForMenuRoleId = ({
  roleId,
  enabled = true
}: UseApiForGetAuthorizedMenusInfoForMenuRoleIdProps): UseApiForGetAuthorizedMenusInfoForMenuRoleIdReturn => {
  const [data, setData] = useState<IResponseTypeForGetAuthorizedMenusInfoForMenuRoleId | null>(null);
  const [menuList, setMenuList] = useState<IMenuInfo[]>([]);
  const [headerMenuList, setHeaderMenuList] = useState<IMenuInfo[]>([]);
  const [headerMenuIds, setHeaderMenuIds] = useState<number[]>([]);
  const [campaignTenantContextMenuList, setCampaignTenantContextMenuList] = useState<IMenuInfo[]>([]);
  const [campaignTenantContextMenuIds, setCampaignTenantContextMenuIds] = useState<number[]>([]);
  const [campaignTabCampaignContextMenuList, setCampaignTabCampaignContextMenuList] = useState<IMenuInfo[]>([]);
  const [campaignTabCampaignContextMenuIds, setCampaignTabCampaignContextMenuIds] = useState<number[]>([]);
  const [skillAssignmentMenuList, setSkillAssignmentMenuList] = useState<IMenuInfo[]>([]);
  const [skillAssignmentMenuIds, setSkillAssignmentMenuIds] = useState<number[]>([]);
  
  // 추가된 상태 변수들
  const [campaignGroupTabTenantMenuList, setCampaignGroupTabTenantMenuList] = useState<IMenuInfo[]>([]);
  const [campaignGroupTabTenantMenuIds, setCampaignGroupTabTenantMenuIds] = useState<number[]>([]);
  const [campaignGroupTabCampaignGroupMenuList, setCampaignGroupTabCampaignGroupMenuList] = useState<IMenuInfo[]>([]);
  const [campaignGroupTabCampaignGroupMenuIds, setCampaignGroupTabCampaignGroupMenuIds] = useState<number[]>([]);
  const [campaignGroupTabCampaignMenuList, setCampaignGroupTabCampaignMenuList] = useState<IMenuInfo[]>([]);
  const [campaignGroupTabCampaignMenuIds, setCampaignGroupTabCampaignMenuIds] = useState<number[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  // Zustand 스토어에서 필요한 함수들 가져오기
  const { 
    setAvailableMenus, 
    setAvailableHeaderMenus,
    setAvailableHeaderMenuIds,
    setAvailableCampaignTenantContextMenus,
    setAvailableCampaignTenantContextMenuIds,
    setAvailableCampaignTabCampaignContextMenus,
    setAvailableCampaignTabCampaignContextMenuIds,
    setAvailableMenuIdsForSkilAssignment,
    // 추가된 setter 함수들
    setAvailableMenuIdsForCampaignGroupTabTenant,
    setAvailableMenuIdsForCampaignGroupTabCampaignGroup,
    setAvailableMenuIdsForCampaignGroupTabCampaign,
    setLoading: setStoreLoading, 
    setError: setStoreError 
  } = useAvailableMenuStore();

  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    setStoreLoading(true);
    setIsError(false);
    setStoreError(false);
    setError(null);

    try {
      const response = await apiForGetAuthorizedMenusInfoForMenuRoleId({ roleId });
      
      // 전체 메뉴 리스트
      const allMenus = response.availableMenuList || [];
      
      // TOP 코드를 가진 헤더용 메뉴 필터링
      const headerMenus = allMenus.filter(menu => menu.locationDistinctionCode === 'TOP');
      
      // 헤더 메뉴 ID 배열 생성
      const headerIds = headerMenus.map(menu => menu.menuId);
      
      // CTC 코드를 가진 캠페인 테넌트 컨텍스트 메뉴 필터링
      const campaignTenantContextMenus = allMenus.filter(menu => menu.locationDistinctionCode === 'SCC');
      
      // 캠페인 테넌트 컨텍스트 메뉴 ID 배열 생성
      const campaignTenantContextIds = campaignTenantContextMenus.map(menu => menu.menuId);
      
      // CCC 코드를 가진 캠페인 탭 캠페인 컨텍스트 메뉴 필터링
      const campaignTabCampaignContextMenus = allMenus.filter(menu => menu.locationDistinctionCode === 'SCM');
      
      // 캠페인 탭 캠페인 컨텍스트 메뉴 ID 배열 생성
      const campaignTabCampaignContextIds = campaignTabCampaignContextMenus.map(menu => menu.menuId);
      
      // SSG, SST, SSS 코드를 가진 스킬 할당 메뉴 필터링
      const skillAssignmentMenus = allMenus.filter(menu => 
        menu.locationDistinctionCode === 'SSG' || 
        menu.locationDistinctionCode === 'SST' || 
        menu.locationDistinctionCode === 'SSS'
      );
      
      // 스킬 할당 메뉴 ID 배열 생성
      const skillAssignmentIds = skillAssignmentMenus.map(menu => menu.menuId);
      
      // SGT 코드를 가진 캠페인 그룹 탭 테넌트 메뉴 필터링
      const campaignGroupTabTenantMenus = allMenus.filter(menu => menu.locationDistinctionCode === 'SGT');
      
      // 캠페인 그룹 탭 테넌트 메뉴 ID 배열 생성
      const campaignGroupTabTenantIds = campaignGroupTabTenantMenus.map(menu => menu.menuId);
      
      // SGG 코드를 가진 캠페인 그룹 탭 캠페인 그룹 메뉴 필터링
      const campaignGroupTabCampaignGroupMenus = allMenus.filter(menu => menu.locationDistinctionCode === 'SGG');
      
      // 캠페인 그룹 탭 캠페인 그룹 메뉴 ID 배열 생성
      const campaignGroupTabCampaignGroupIds = campaignGroupTabCampaignGroupMenus.map(menu => menu.menuId);
      
      // SSS 코드를 가진 캠페인 그룹 탭 캠페인 메뉴 필터링
      const campaignGroupTabCampaignMenus = allMenus.filter(menu => menu.locationDistinctionCode === 'SGC');
      
      // 캠페인 그룹 탭 캠페인 메뉴 ID 배열 생성
      const campaignGroupTabCampaignIds = campaignGroupTabCampaignMenus.map(menu => menu.menuId);
      
      // 로컬 상태 업데이트
      setData(response);
      setMenuList(allMenus);
      setHeaderMenuList(headerMenus);
      setHeaderMenuIds(headerIds);
      setCampaignTenantContextMenuList(campaignTenantContextMenus);
      setCampaignTenantContextMenuIds(campaignTenantContextIds);
      setCampaignTabCampaignContextMenuList(campaignTabCampaignContextMenus);
      setCampaignTabCampaignContextMenuIds(campaignTabCampaignContextIds);
      setSkillAssignmentMenuList(skillAssignmentMenus);
      setSkillAssignmentMenuIds(skillAssignmentIds);
      setCampaignGroupTabTenantMenuList(campaignGroupTabTenantMenus);
      setCampaignGroupTabTenantMenuIds(campaignGroupTabTenantIds);
      setCampaignGroupTabCampaignGroupMenuList(campaignGroupTabCampaignGroupMenus);
      setCampaignGroupTabCampaignGroupMenuIds(campaignGroupTabCampaignGroupIds);
      setCampaignGroupTabCampaignMenuList(campaignGroupTabCampaignMenus);
      setCampaignGroupTabCampaignMenuIds(campaignGroupTabCampaignIds);
      
      // console.log("메뉴 권한 정보가 로컬 상태에 저장되었습니다:", allMenus);
      // console.log("헤더 메뉴 정보가 로컬 상태에 저장되었습니다:", headerMenus);
      // console.log("헤더 메뉴 ID가 로컬 상태에 저장되었습니다:", headerIds);
      // console.log("캠페인 테넌트 컨텍스트 메뉴가 로컬 상태에 저장되었습니다:", campaignTenantContextMenus);
      // console.log("캠페인 테넌트 컨텍스트 메뉴 ID가 로컬 상태에 저장되었습니다:", campaignTenantContextIds);
      // console.log("캠페인 탭 캠페인 컨텍스트 메뉴가 로컬 상태에 저장되었습니다:", campaignTabCampaignContextMenus);
      // console.log("캠페인 탭 캠페인 컨텍스트 메뉴 ID가 로컬 상태에 저장되었습니다:", campaignTabCampaignContextIds);
      // console.log("스킬 할당 메뉴가 로컬 상태에 저장되었습니다:", skillAssignmentMenus);
      // console.log("스킬 할당 메뉴 ID가 로컬 상태에 저장되었습니다:", skillAssignmentIds);
      // console.log("캠페인 그룹 탭 테넌트 메뉴가 로컬 상태에 저장되었습니다:", campaignGroupTabTenantMenus);
      // console.log("캠페인 그룹 탭 테넌트 메뉴 ID가 로컬 상태에 저장되었습니다:", campaignGroupTabTenantIds);
      // console.log("캠페인 그룹 탭 캠페인 그룹 메뉴가 로컬 상태에 저장되었습니다:", campaignGroupTabCampaignGroupMenus);
      // console.log("캠페인 그룹 탭 캠페인 그룹 메뉴 ID가 로컬 상태에 저장되었습니다:", campaignGroupTabCampaignGroupIds);
      // console.log("캠페인 그룹 탭 캠페인 메뉴가 로컬 상태에 저장되었습니다:", campaignGroupTabCampaignMenus);
      // console.log("캠페인 그룹 탭 캠페인 메뉴 ID가 로컬 상태에 저장되었습니다:", campaignGroupTabCampaignIds);

      // Zustand 스토어 업데이트
      setAvailableMenus(allMenus);
      setAvailableHeaderMenus(headerMenus);
      setAvailableHeaderMenuIds(headerIds);
      setAvailableCampaignTenantContextMenus(campaignTenantContextMenus);
      setAvailableCampaignTenantContextMenuIds(campaignTenantContextIds);
      setAvailableCampaignTabCampaignContextMenus(campaignTabCampaignContextMenus);
      setAvailableCampaignTabCampaignContextMenuIds(campaignTabCampaignContextIds);
      setAvailableMenuIdsForSkilAssignment(skillAssignmentIds);
      setAvailableMenuIdsForCampaignGroupTabTenant(campaignGroupTabTenantIds);
      setAvailableMenuIdsForCampaignGroupTabCampaignGroup(campaignGroupTabCampaignGroupIds);
      setAvailableMenuIdsForCampaignGroupTabCampaign(campaignGroupTabCampaignIds);
      
    } catch (err) {
      console.error('Error fetching authorized menus:', err);
      
      // 로컬 상태 업데이트
      setIsError(true);
      setError(err);
      
      // Zustand 스토어 업데이트
      setStoreError(true);
    } finally {
      // 로컬 상태 업데이트
      setIsLoading(false);
      
      // Zustand 스토어 업데이트
      setStoreLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [roleId, enabled]);

  return {
    data,
    menuList,
    headerMenuList,
    headerMenuIds,
    campaignTenantContextMenuList,
    campaignTenantContextMenuIds,
    campaignTabCampaignContextMenuList,
    campaignTabCampaignContextMenuIds,
    skillAssignmentMenuList,
    skillAssignmentMenuIds,
    // 추가된 반환값
    campaignGroupTabTenantMenuList,
    campaignGroupTabTenantMenuIds,
    campaignGroupTabCampaignGroupMenuList,
    campaignGroupTabCampaignGroupMenuIds,
    campaignGroupTabCampaignMenuList,
    campaignGroupTabCampaignMenuIds,
    isLoading,
    isError,
    error,
    refetch: fetchData
  };
};