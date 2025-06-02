// // src\features\campaignManager\components\treeMenus\searchbar\utilsForSideMenuForCounselorTab.ts

// import { IOrganization } from "@/features/campaignManager/types/typeForSideBarCounselorTab2";

// export function findCounselorInfo(
//   organizations: IOrganization[],
//   searchTerm: string
// ): {
//   counselorId: string;
//   counselorName: string;
//   tenantId: string;
//   paths: string[];
// } | null {
//   for (const org of organizations) {
//     for (const tenant of org.tenantInfo) {
//       for (const group of tenant.groupInfo) {
//         for (const team of group.teamInfo) {
//           const counselor = team.counselorInfo.find(c => 
//             c.counselorname.toLowerCase().includes(searchTerm.toLowerCase())
//           );
//           if (counselor) {
//             return {
//               counselorId: counselor.counselorId,
//               counselorName: counselor.counselorname,
//               tenantId: tenant.tenantId,
//               paths: [
//                 `org-${org.centerId}`,
//                 `tenant-${tenant.tenantId}`,
//                 `group-${group.groupId}`,
//                 `team-${team.teamId}`
//               ]
//             };
//           }
//         }
//       }
//     }
//   }
//   return null;
// }

// src\features\campaignManager\components\treeMenus\searchbar\utilsForSideMenuForCounselorTab.ts

import { IOrganization } from "@/features/campaignManager/types/typeForSideBarCounselorTab2";

export function findCounselorInfo(
  organizations: IOrganization[],
  searchTerm: string
): {
  counselorId: string;
  counselorName: string;
  tenantId: string;
  paths: string[];
} | null {
  for (const org of organizations) {
    for (const tenant of org.tenantInfo) {
      for (const group of tenant.groupInfo) {
        for (const team of group.teamInfo) {
          const counselor = team.counselorInfo.find(c => 
            c.counselorname.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (counselor) {
            return {
              counselorId: counselor.counselorId,
              counselorName: counselor.counselorname,
              tenantId: tenant.tenantId,
              paths: [
                `org-${org.centerId}`,
                `tenant-${tenant.tenantId}`,
                `group-${group.groupId}`,
                `team-${team.teamId}`
              ]
            };
          }
        }
      }
    }
  }
  return null;
}

// 전체 상담사 리스트 가져오기 (자동완성용)
export function getAllCounselors(organizations: IOrganization[]): Array<{
  counselorId: string;
  counselorName: string;
  tenantId: string;
}> {
  const counselors: Array<{
    counselorId: string;
    counselorName: string;
    tenantId: string;
  }> = [];

  organizations.forEach(org => {
    org.tenantInfo.forEach(tenant => {
      tenant.groupInfo.forEach(group => {
        group.teamInfo.forEach(team => {
          team.counselorInfo.forEach(counselor => {
            counselors.push({
              counselorId: counselor.counselorId,
              counselorName: counselor.counselorname,
              tenantId: tenant.tenantId
            });
          });
        });
      });
    });
  });

  return counselors;
}