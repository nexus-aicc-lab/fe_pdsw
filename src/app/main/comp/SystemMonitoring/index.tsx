import React, { useEffect, useState } from "react";
import TitleWrap from "@/components/shared/TitleWrap";
import { Table, TableRow, TableHeader, TableCell } from "@/components/ui/table-custom";
import { useApiForSystemMonitoring } from "@/features/monitoring/hooks/useApiForSystemMonitoring";
import { useEnvironmentStore } from '@/store/environmentStore';

// 시스템 상태에 따른 타입 정의
type SystemStatus = "normal" | "abnormal";

// API 응답 타입 정의
interface ApiResponse {
  code: string;
  message: string;
  processStatusList: ProcessStatus[];
}

interface ProcessStatus {
  name: string;
  pid: number;
  state: number; // 1: normal, 0: abnormal
  time: string;
}

// 각 시스템의 데이터 타입 정의
interface SystemData {
  id: number;  
  title: string;
  status: SystemStatus;
  pid: string;
  time: string;
}

type SystemCardProps = Omit<SystemData, 'id'>;

// 상태에 따른 스타일 설정
const statusStyles = {
  normal: {
    bgColor: "#44B67D",
    text: "정상"
  },
  abnormal: {
    bgColor: "#FC5858",
    text: "비정상"
  }
};

// 개별 시스템 컴포넌트
const SystemCard: React.FC<SystemCardProps> = ({ title, status, pid, time }) => {
  const style = status === "normal" ? statusStyles.normal : statusStyles.abnormal;

  return (
    <div>
      <TitleWrap title={title} />
      <div className="border border-[#ebebeb] rounded-[3px] px-[40px] py-[25px] flex flex-col gap-5 items-center">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: style.bgColor }}
          />
          <div className="text-sm" style={{ color: style.bgColor }}>
            {style.text}
          </div>
        </div>
        <Table className="!w-[80%] text-[#333]">
          <tbody>
            <TableRow>
              <TableHeader className="text-sm font-normal">pid</TableHeader>
              <TableCell className="text-sm">{pid}</TableCell>
            </TableRow>
            <TableRow>
              <TableHeader className="text-sm font-normal">time</TableHeader>
              <TableCell className="text-sm">{time}</TableCell>
            </TableRow>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

const SystemMonitoring: React.FC = () => {
  // 상태 관리 추가
  const [systemsData, setSystemsData] = useState<SystemData[]>([]);
  const { statisticsUpdateCycle } = useEnvironmentStore();

  // API 호출 및 응답 처리
  const { mutate: systemMonitoring } = useApiForSystemMonitoring({
    onSuccess: (data: ApiResponse) => {
      // API 응답 데이터를 컴포넌트 데이터 형식으로 변환
      if (data && data.processStatusList && Array.isArray(data.processStatusList)) {
        if (data.processStatusList.length === 0) {
          setSystemsData([]);
        } else {
          const formattedData: SystemData[] = data.processStatusList.map((item, index) => ({
            id: index + 1,
            title: item.name, // name을 title로 매핑
            status: item.state === 1 ? "normal" : "abnormal", // state 1은 normal, 그 외는 abnormal
            pid: item.pid.toString(), // pid를 문자열로 변환하여 pdi에 매핑  ==> pid로 수정
            time: item.time // time은 그대로 사용
          }));
          
          // #### 요구 사항 정렬 순서 텍스트 배열
          const customOrder = [
            "EXDdesigner", 
            "EXDdbcontrol", 
            "EXDfr", 
            "EXDdialer", 
            "EXDcallpacing", 
            "EXDassist", 
            "EXDListAutomation", 
            "EXDfw", 
            "EXDMMService", 
            "CCbridge1", 
            "CCbridge2"
          ];
          // ####
          const sortedProcessData = formattedData.sort((a, b) => {
            
            // b는 원본객체, a는 b의 다음순서객체이며,
            // customOrder 순서에서 a와 b의 index를 구하고, 음수면 a가 앞으로, 양수면 b가 앞으로 옴
            // 즉, api받아온 순서를 customOrder의 index에 맞게 앞으로 뒤로 정렬시킨다.

            return customOrder.indexOf(a.title) - customOrder.indexOf(b.title);
          });
          
          setSystemsData(sortedProcessData);
        }
      }
    },
    onError: (error) => {
      console.error(error);
    }
  });

  useEffect(() => {
    systemMonitoring({}); // 시스템 모니터링 API 호출
    if( statisticsUpdateCycle > 0 ){        
      const interval = setInterval(() => {  
        systemMonitoring({}); // 시스템 모니터링 API 호출
      }, statisticsUpdateCycle * 1000);  
      return () => clearInterval(interval);
    }
  }, [systemMonitoring,statisticsUpdateCycle]);

  return (
    <div className="w-full limit-width">
      {systemsData.length > 0 ? (
        <div className="grid grid-cols-3 grid-rows-3 gap-[30px]">
          {systemsData.map((system) => (
            <SystemCard
              key={system.id}
              title={system.title}
              status={system.status}
              pid={system.pid}
              time={system.time}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-lg text-gray-500">데이터가 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default SystemMonitoring;