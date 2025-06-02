import React,{ useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import TitleWrap from "@/components/shared/TitleWrap";
import { Table, TableRow, TableHeader, TableCell } from "@/components/ui/table-custom";
import { Label } from "@/components/ui/label";
import { CampaignProgressInformationResponseDataType } from '@/features/monitoring/types/monitoringIndex';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

type Props = {
  selectedCall: CampaignProgressInformationResponseDataType | null;
}

const ChartView: React.FC<Props> = ({ selectedCall }) => {

  const [tempCallStatusData, setTempCallStatusData] = useState<ChartData[]>([]);
  const [tempListStatusData, setTempListStatusData] = useState<ChartData[]>([]);
  const [failCnt, setFailCnt] = useState<number>(0);


  const [activeSection, setActiveSection] = useState<string>('발신성공'); // 클릭된 섹션 상태

  const handleToDialPieClick = (data: any) => {

    setActiveSection(data.name.split(":")[0].toString()); // 클릭된 섹션의 이름을 상태로 저장
  };

  

  const renderCustomizedLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex justify-center gap-4 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-1">
            <div 
              className="w-3 h-3"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, index } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1; // 레이블을 바깥쪽으로 이동
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const total = props.data.reduce((sum: number, entry: ChartData) => sum + entry.value, 0);
    const percentage = ((value / total) * 100).toFixed(0);

    return (
      <text
        x={x}
        y={y}
        fill="#666"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-[10px]"
      >
        {`${percentage}%`}
      </text>
    );
  };

  useEffect(() => {
    if( selectedCall ){
      const totalCnt = selectedCall.buct
      +selectedCall.fact
      +selectedCall.tect
      +selectedCall.customerOnHookCnt
      +selectedCall.dialToneSilence
      +selectedCall.nact
      +selectedCall.etct
      +selectedCall.lineStopCnt
      +selectedCall.detectSilenceCnt
      +selectedCall.acct
      ;
      setFailCnt(totalCnt);
      setTempCallStatusData([]);
      const callStatusData: ChartData[] = [
        { name: '발신시도:'+(selectedCall.dialingCall), value: selectedCall.dialingCall, color: '#40E0D0' },
        { name: '발신성공:'+(selectedCall.scct), value: selectedCall.scct, color: '#2CC7B5' },
        { name: '발신실패:'+totalCnt, value: totalCnt, color: '#20AE9C' }
      ];
      setTempCallStatusData(callStatusData);
      setTempListStatusData([]);
      // const delay = selectedCall.totLstCnt-selectedCall.scct-totalCnt-selectedCall.recallCnt;
      const delay = selectedCall.totLstCnt - selectedCall.nonTTCT;
      // 리스트 상태 데이터
      const listStatusData: ChartData[] = [
        { name: '대기리스트:'+delay, value: delay, color: '#87CEFA' },
        { name: '방지리스트:'+(selectedCall.nogdeleteGL), value: selectedCall.nogdeleteGL, color: '#FFB6C6' }
      ];
      setTempListStatusData(listStatusData);  
    }else{
      setTempCallStatusData([]);
      setTempListStatusData([]);
      const callStatusData: ChartData[] = [
        { name: '발신시도:'+0, value: 0, color: '#40E0D0' },
        { name: '발신성공:'+0, value: 0, color: '#2CC7B5' },
        { name: '발신실패:'+0, value: 0, color: '#20AE9C' }
      ];
      setTempCallStatusData(callStatusData);
    }
    setActiveSection('발신성공');
  }, [selectedCall]);
  
  return (
    <div className="flex flex-col gap-2">
      <div>
        <TitleWrap title="리스트 현황" />
        <Table className='table-continued'>
          <tbody>
            <TableRow>
              <TableHeader className="w-[120px]">
                <Label>진행률(%)</Label>
              </TableHeader>
              <TableCell className="text-center text-sm">
                {(selectedCall?.totLstCnt || 0) === 0 ? 0 : parseFloat(((selectedCall?.nonTTCT || 0) / (selectedCall?.totLstCnt || 0) * 100).toFixed(1))}
              </TableCell>
              <TableHeader className="w-[160px]">
                <Label>리스트 대비 성공률 (%)</Label>
              </TableHeader>
              <TableCell className="text-center text-sm">
                {(selectedCall?.totLstCnt || 0) === 0?0:parseFloat(((selectedCall?.scct || 0)/(selectedCall?.totLstCnt || 0)*100).toFixed(1))}
              </TableCell>
              <TableHeader className="w-[120px]">
                <Label>총 리스트</Label>
              </TableHeader>
              <TableCell className="text-center text-sm">
                {selectedCall?.totLstCnt || 0}
              </TableCell>
              <TableHeader className="w-[120px]">
                <Label>순수 발신</Label>
              </TableHeader>
              <TableCell className="text-center text-sm">
                {selectedCall?.nonTTCT||0}
              </TableCell>
              <TableHeader className="w-[120px]">
                <Label>미발신</Label>
              </TableHeader>
              <TableCell className="text-center text-sm">
                {(selectedCall?.totLstCnt || 0)-(selectedCall?.nonTTCT || 0)-(selectedCall?.nogdeleteGL || 0)}
              </TableCell>
              <TableHeader className="w-[120px]">
                <Label>상담 결과 예약</Label>
              </TableHeader>
              <TableCell className="text-center text-sm">
                {selectedCall?.recallCnt||0}
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
        <div className="h-[370px] border border-[#ebebeb] rounded-b-[3px] p-2 flex justify-center items-center gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-center">총 발신 : {selectedCall?.totDialCnt || 0}, 발신 대비 성공률 : 
              {(selectedCall?.scct || 0) === 0?0:parseFloat(((selectedCall?.scct || 0)/(selectedCall?.totDialCnt || 0)*100).toFixed(1))}
              %</p>
            <div className="relative">
              <PieChart width={260} height={250}>
                <Pie
                  data={tempCallStatusData}
                  cx={130}
                  cy={100}
                  innerRadius={30}
                  outerRadius={70}
                  paddingAngle={0}
                  label={({ value, x, y }) => {
                    // 총합 계산
                    const total = tempCallStatusData.reduce((sum, entry) => sum + entry.value, 0);
                    // 비율 계산
                    const percentage = total > 0 ? ((value / total) * 100).toFixed() : "0";
              
                    return (
                      <text x={x} y={y} className="text-[10px]" textAnchor="middle">
                        {`${percentage}%`}
                      </text>
                    );
                  }}
                  dataKey="value"
                  onClick={handleToDialPieClick}
                >
                  {tempCallStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  content={renderCustomizedLegend}
                  payload={tempCallStatusData.map(item => ({
                    value: item.name,
                    color: item.color,
                  }))}
                />
              </PieChart>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-sm text-center">미발신 : {(selectedCall?.totLstCnt || 0)-(selectedCall?.nonTTCT || 0)-(selectedCall?.nogdeleteGL || 0)}</p>
            <div className="relative">
              <PieChart width={260} height={250}>
                <Pie
                  data={tempListStatusData}
                  cx={130}
                  cy={100}
                  innerRadius={30}
                  outerRadius={70}
                  paddingAngle={0}
                  label={({ value, x, y }) => {
                    // 총합 계산
                    const total = tempListStatusData.reduce((sum, entry) => sum + entry.value, 0);
                    // 비율 계산
                    const percentage = total > 0 ? ((value / total) * 100).toFixed() : "0";
              
                    return (
                      <text x={x} y={y} className="text-[10px]" textAnchor="middle">
                        {`${percentage}%`}
                      </text>
                    );
                  }}
                  dataKey="value"
                  onClick={handleToDialPieClick}
                >
                  {tempListStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  content={renderCustomizedLegend}
                  payload={tempListStatusData.map(item => ({
                    value: item.name,
                    color: item.color,
                  }))}
                />
              </PieChart>
            </div>
          </div>
        </div>
      </div>
      
      {activeSection === '발신성공' && (
        <div>
        <TitleWrap title="발신 성공" />
        <Table className='table-continued'>
          <tbody>
            <TableRow>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>대기 상담사 없음</Label>
              </TableHeader>
              <TableHeader className="w-[160px] !text-center border-r border-b">
                <Label>상담사 연결</Label>
              </TableHeader>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>상담사 연결 실패</Label>
              </TableHeader>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>상담사 무응답</Label>
              </TableHeader>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>상담사 통화 중</Label>
              </TableHeader>
            </TableRow>
            <TableRow>
              <TableCell className="text-sm !text-center">
                {selectedCall?.overDial||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.agentConnect||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.abct||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.agentNoAnswerCnt||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.agentBusyCnt||0}
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
        <Table>
          <tbody>
            <TableRow>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>상담사 바로 끊음</Label>
              </TableHeader>
              <TableHeader className="w-[160px] !text-center border-r border-b">
                <Label>고객 포기</Label>
              </TableHeader>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>고객 최대 대기 시간 초과</Label>
              </TableHeader>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>멘트 청취 후 상담사 연결 안함</Label>
              </TableHeader>
            </TableRow>
            <TableRow>
              <TableCell className="text-sm !text-center">
                {selectedCall?.agentDropCnt||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.customerDropCnt||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nonServiceCnt||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.noAgentCnt||0}
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
        </div>
      )}


      {activeSection === '발신실패' && (
        <div>
          <TitleWrap title="발신 실패" />
          <Table className='table-continued'>
            <tbody>
              <TableRow>
                <TableHeader className="w-[120px] !text-center border-r border-b">
                  <Label>통화중</Label>
                </TableHeader>
                <TableHeader className="w-[160px] !text-center border-r border-b">
                  <Label>무응답</Label>
                </TableHeader>
                <TableHeader className="w-[120px] !text-center border-r border-b">
                  <Label>팩스/모뎀</Label>
                </TableHeader>
                <TableHeader className="w-[120px] !text-center border-r border-b">
                  <Label>기타</Label>
                </TableHeader>
                <TableHeader className="w-[120px] !text-center border-r border-b">
                  <Label>전화번호 오류</Label>
                </TableHeader>
              </TableRow>
              <TableRow>
                <TableCell className="text-sm !text-center">
                  
                  {selectedCall?.buct||0}
                </TableCell>
                <TableCell className="text-sm !text-center">
                  {selectedCall?.nact||0}
                </TableCell>
                <TableCell className="text-sm !text-center">
                  {selectedCall?.fact||0}
                </TableCell>
                <TableCell className="text-sm !text-center">
                  {selectedCall?.etct||0}
                </TableCell>
                <TableCell className="text-sm !text-center">
                  {selectedCall?.tect||0}
                </TableCell>
              </TableRow>
            </tbody>
          </Table>
          <Table>
            <tbody>
              <TableRow>
                <TableHeader className="w-[120px] !text-center border-r border-b">
                  <Label>회선 오류</Label>
                </TableHeader>
                <TableHeader className="w-[160px] !text-center border-r border-b">
                  <Label>고객 바로 끊음</Label>
                </TableHeader>
                <TableHeader className="w-[120px] !text-center border-r border-b">
                  <Label>통화음 없음</Label>
                </TableHeader>
                <TableHeader className="w-[120px] !text-center border-r border-b">
                  <Label>다이얼음 없음</Label>
                </TableHeader>
                <TableHeader className="w-[120px] !text-center border-r border-b">
                  <Label>기계음</Label>
                </TableHeader>
              </TableRow>
              <TableRow>
                <TableCell className="text-sm !text-center">
                  {selectedCall?.lineStopCnt||0}
                </TableCell>
                <TableCell className="text-sm !text-center">
                  {selectedCall?.customerOnHookCnt||0}
                </TableCell>
                <TableCell className="text-sm !text-center">
                  {selectedCall?.detectSilenceCnt||0}
                </TableCell>
                <TableCell className="text-sm !text-center">
                  {selectedCall?.dialToneSilence||0}
                </TableCell>
                <TableCell className="text-sm !text-center">
                  {selectedCall?.acct||0}
                </TableCell>
              </TableRow>
            </tbody>
          </Table>
          
        </div>
      )}


      {activeSection === '대기리스트' && (
        <div>
        <TitleWrap title="대기 리스트" />
        <Table className='table-continued'>
          <tbody>
            <TableRow>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>스케줄 대기(발신 가능)</Label>
              </TableHeader>
              <TableHeader className="w-[160px] !text-center border-r border-b">
                <Label>진행 대기(발신 가능)</Label>
              </TableHeader>
              
            </TableRow>
            <TableRow>
              <TableCell className="text-sm !text-center border-r border-b">
                {(selectedCall?.totLstCnt || 0)-(selectedCall?.scct || 0)-failCnt-(selectedCall?.recallCnt || 0)-(selectedCall?.nogblockTime || 0)-(selectedCall?.nogdeleteGL || 0)}
              </TableCell>
              <TableCell className="text-sm !text-center border-r border-b">
                {selectedCall?.nogblockTime||0}
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
        </div>
      )}


      {activeSection === '방지리스트' && (
        <div>
        <TitleWrap title="방지 리스트" />
        <Table className='table-continued'>
          <tbody>
            <TableRow>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>블랙 리스트</Label>
              </TableHeader>
              <TableHeader className="w-[160px] !text-center border-r border-b">
                <Label>실시간 리스트 삭제</Label>
              </TableHeader>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>스케줄 설정 실패</Label>
              </TableHeader>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>콜백 타임 아웃</Label>
              </TableHeader>
            </TableRow>
            <TableRow>
              <TableCell className="text-sm !text-center">
                {selectedCall?.blackList||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nogdeleteGL||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nogtimeContradictory||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nogtimeOutCallback||0}
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
        <Table>
          <tbody>
            <TableRow>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>팝업 후 상담사 미발신 선택</Label>
              </TableHeader>
              <TableHeader className="w-[160px] !text-center border-r border-b">
                <Label>팝업 후 발신 여부 미선택</Label>
              </TableHeader>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>팝업 후 상담사 상태 변경</Label>
              </TableHeader>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>팝업 후 상담사 모드 변경</Label>
              </TableHeader>
            </TableRow>
            <TableRow>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nogautoPopNotDial||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nogautoPopNoAnswer||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nogautoPopNoReady||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nogautoPopFailMode||0}
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
        <Table>
          <tbody>
            <TableRow>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>발신확인 전 상담사 상태 변경</Label>
              </TableHeader>
              <TableHeader className="w-[160px] !text-center border-r border-b">
                <Label>발신확인 전 상담사 모드 변경</Label>
              </TableHeader>
              <TableHeader className="w-[120px] !text-center border-r border-b">
                <Label>지정 상담사 정보 미입력</Label>
              </TableHeader>
            </TableRow>
            <TableRow>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nogautoDialNoReady||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nogautoPopFailMode||0}
              </TableCell>
              <TableCell className="text-sm !text-center">
                {selectedCall?.nogautoNoEmployeeId||0}
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
        </div>
      )}
        
      
    </div>
  );
};

export default ChartView;