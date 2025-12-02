// import { useQuery } from '@tanstack/react-query';
// import { fetchCounselorAssignList
//   , CounselorAssignListCredentials
//   , CounselorAssignListResponse 
// } from '@/features/preferences/api/apiForCounselorList';

// interface Props {
//   credentials: CounselorAssignListCredentials;
//   enabled?: boolean;
//   sessionKey?: string;
// }

// const useApiForFetchCounselorAssignList = ({ credentials, enabled }: Props) => {
//   return useQuery<CounselorAssignListResponse>({
//     queryKey: ['counselorAssignList', credentials],
//     queryFn: () => fetchCounselorAssignList(credentials),
//     enabled: enabled !== undefined ? enabled : !!credentials.tenantId && !!credentials.skillId,
//   });
// };

// export default useApiForFetchCounselorAssignList;
