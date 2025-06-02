// src\widgets\header\api\typeForMenusAuthorityInfo.ts

export interface IRequestTypeForGetAuthorizedMenusInfoForMenuRoleId {
    roleId: number;
  }
  
  export interface IMenuInfo {
    menuId: number;
    upperMenuId: number;
    menuName: string;
    locationDistinctionCode: string;
    connectionType: string;
    connectionScreenId: string;
  }
  
  export interface IResponseTypeForGetAuthorizedMenusInfoForMenuRoleId {
    code: string;
    message: string;
    availableMenuList: IMenuInfo[];
  }