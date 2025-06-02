// C:\nproject\fe_pdsw\src\features\campaignManager\types\typeForSideBarCounselorTab2.tsx

export interface IResponseTypeForApiForGetCounselorList {
  code: string;
  message: string;
  organizationList: IOrganization[];
}

export interface IOrganization {
  centerId: string;
  centerName: string;
  tenantInfo: ITenant[];
}

export interface ITenant {
  tenantId: string;
  tenantName: string;
  groupInfo: IGroup[];
}

export interface IGroup {
  groupId: string;
  groupName: string;
  teamInfo: ITeam[];
}

export interface ITeam {
  teamId: string;
  teamName: string;
  counselorInfo: ICounselor[];
}

export interface ICounselor {
  assignedSkills: any;
  counselorId: string;
  counselorname: string;
  blendKind: string;
}

export interface IParmaterForFetchCounsolorList {
  tenant_id: string;
  roleId: string;
}