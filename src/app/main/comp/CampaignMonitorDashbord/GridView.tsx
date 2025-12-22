import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, CartesianGrid } from 'recharts';
import TitleWrap from "@/components/shared/TitleWrap";
import { Table, TableRow, TableHeader, TableCell } from "@/components/ui/table-custom";
import { Label } from "@/components/ui/label";
import { CampaignProgressInformationResponseDataType } from '@/features/monitoring/types/monitoringIndex';


interface CallStatusData {
  name: string;
  value: number;
  color: string;
}

interface SuccessRateData {
  name: string;
  value: number;
  color: string;
}

type Props = {
  selectedCall: CampaignProgressInformationResponseDataType | null;
}

const GridView: React.FC<Props> = ({ selectedCall }) => {
  const [tempPieChartData, setTempPieChartData] = useState<CallStatusData[]>([]);
  const [tempBarChartData, setTempBarChartData] = useState<SuccessRateData[]>([]);
  const [failCnt, setFailCnt] = useState<number>(0);
  const [blocklistCnt, setBlocklistCnt] = useState<number>(0);
  // const pieChartData = [
  //   { name: '통화중', value: 25, color: '#4AD3C8' },        //buct
  //   { name: '팩스/모뎀', value: 25, color: '#19BEB2' },     //fact
  //   { name: '전화번호 오류', value: 5, color: '#20A99F' },  //tect
  //   { name: '고객 바로 끊음', value: 5, color: '#1A948B' }, //customerOnHookCnt
  //   { name: '다이얼음 없음', value: 10, color: '#8EAEE4' }, //dialToneSilence
  //   { name: '무응답', value: 10, color: '#5085DB' },        //nact
  //   { name: '기타', value: 10, color: '#336BC7' },          //etct
  //   { name: '회선오류', value: 10, color: '#785CCF' },      //lineStopCnt
  //   { name: '통화음 없음', value: 10, color: '#9C82EC' },   //detectSilenceCnt
  //   { name: '기계음', value: 10, color: '#C98DF6' },        //acct
  // ];

  const barChartData: SuccessRateData[] = [
    { name: '발신대비(%)', value: 70, color: '#FF8DA0' },
    { name: '리스트대비(%)', value: 45, color: '#88B3FC' }
  ];

  useEffect(() => {
    if( selectedCall ){
      setTempPieChartData([]);
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
      const _blocklistCnt = selectedCall.blackList
        + selectedCall.nogdeleteGL
        + selectedCall.nogtimeContradictory
        + selectedCall.nogtimeOutCallback
        + selectedCall.nogautoPopNotDial
        + selectedCall.nogautoPopNoAnswer
        + selectedCall.nogautoPopNoReady
        + selectedCall.nogautoPopFailMode
        + selectedCall.nogautoDialNoReady
        + selectedCall.nogautoNoEmployeeId
      ;
      setBlocklistCnt(_blocklistCnt);

      const dataLabels = [
        { key: 'buct', label: '통화중', color: '#4AD3C8' },
        { key: 'fact', label: '팩스/모뎀', color: '#19BEB2' },
        { key: 'tect', label: '전화번호 오류', color: '#20A99F' },
        { key: 'customerOnHookCnt', label: '고객 바로 끊음', color: '#1A948B' },
        { key: 'dialToneSilence', label: '다이얼음 없음', color: '#8EAEE4' },
        { key: 'nact', label: '무응답', color: '#5085DB' },
        { key: 'etct', label: '기타', color: '#336BC7' },
        { key: 'lineStopCnt', label: '회선오류', color: '#785CCF' },
        { key: 'detectSilenceCnt', label: '통화음 없음', color: '#9C82EC' },
        { key: 'acct', label: '기계음', color: '#C98DF6' },
      ];
  
      dataLabels.forEach(({ key, label, color }) => {
        const value = selectedCall[key as keyof CampaignProgressInformationResponseDataType] || 0;
        const percentage = totalCnt > 0 ? (Number(value) / totalCnt) * 100 : 0;
        const tempData = { name: `${label}:${value}`, value: percentage, color };
        setTempPieChartData(prev => [...prev, tempData]);
      });
      setTempBarChartData([]);
      const tempBarChartData: SuccessRateData[] = [
        { name: '발신대비(%)', value: (selectedCall?.scct || 0) === 0?0:parseFloat(((selectedCall?.scct || 0)/(selectedCall?.totDialCnt || 0)*100).toFixed(1)), color: '#FF8DA0' },
        { name: '리스트대비(%)', value: (selectedCall?.scct || 0) === 0?0:parseFloat(((selectedCall?.scct || 0)/(selectedCall?.totLstCnt || 0)*100).toFixed(1)), color: '#88B3FC' }
      ];
      setTempBarChartData(tempBarChartData);
    }else{
      const tempBarChartData: SuccessRateData[] = [
        { name: '발신대비(%)', value: 0, color: '#FF8DA0' },
        { name: '리스트대비(%)', value: 0, color: '#88B3FC' }
      ];
      setTempBarChartData(tempBarChartData);
    }
  }, [selectedCall]);
  
  return (
      <div className="flex flex-col gap-2">
          
          <div className="flex gap-5">
              <div className="w-1/2">
                <TitleWrap title="발신 실패 사유 현황" />
                <div className="border rounded h-[170px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tempPieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ value, x, y }) => (
                          <text x={x} y={y} className="text-[10px]" textAnchor="middle">
                            {`${parseFloat(value.toFixed(1))}%`}
                          </text>
                        )}
                        labelLine={{ stroke: '#999999', strokeWidth: 1 }}
                      >
                        {tempPieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        content={({ payload }) => {
                          if (!payload) return null;
                          const halfLength = Math.ceil(payload.length / 2);
                          
                          return (
                            <div className="flex gap-4 px-2">
                              <div className="flex flex-col gap-1">
                                {payload.slice(0, halfLength).map((entry, index) => (
                                  <div key={`legend-${index}`} className="flex items-center gap-1">
                                    <div 
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-xs text-gray-600">{entry.value}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-col gap-1">
                                {payload.slice(halfLength).map((entry, index) => (
                                  <div key={`legend-${index}`} className="flex items-center gap-1">
                                    <div 
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-xs text-gray-600">{entry.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{
                          right: 20,
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="w-1/2">
                <TitleWrap title="발신 성공률" />
                <div className="border rounded h-[170px] p-4">
                  <ResponsiveContainer width="100%" height="100%" className="m-auto">
                    <BarChart
                      data={tempBarChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical" 
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                      <XAxis 
                        type="number" 
                        tick={{ fontSize: 13 }}
                        axisLine={{ stroke: '#999' }}
                        />  
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        tick={{ fontSize: 13 }}
                        axisLine={{ stroke: '#999' }}
                      />
                      <Tooltip />
                      <Bar 
                        dataKey="value" 
                        barSize={20}
                      >
                        {tempBarChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
          </div>

          <div>
            <TitleWrap title="리스트 현황" />
             <Table>
              <tbody>
                <TableRow>
                  <TableHeader className="w-[120px]">
                    <Label>진행률(%)</Label>
                  </TableHeader>
                  <TableCell className="text-center text-sm">
                  {(selectedCall?.totLstCnt || 0) === 0 ? 0 : parseFloat((((selectedCall?.nonTTCT || 0) + blocklistCnt) / (selectedCall?.totLstCnt || 0) * 100).toFixed(1))}
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
                  <TableHeader className="w-[120px] !bg-[#DDF4F2]">
                    <Label>순수 발신</Label>
                  </TableHeader>
                  <TableCell className="text-center text-sm">
                    {selectedCall?.nonTTCT||0}
                  </TableCell>
                  <TableHeader className="w-[120px] !bg-[#DDF4F2]">
                    <Label>미발신</Label>
                  </TableHeader>
                  <TableCell className="text-center text-sm">
                    {(selectedCall?.totLstCnt || 0)-(selectedCall?.nonTTCT || 0)}
                  </TableCell>
                  <TableHeader className="w-[120px] !bg-[#DDF4F2]">
                    <Label>상담 결과 예약</Label>
                  </TableHeader>
                  <TableCell className="text-center text-sm">
                    {selectedCall?.recallCnt||0}
                  </TableCell>
                </TableRow>
              </tbody>
            </Table>
          </div>

          <div>
            <TitleWrap title="발신 현황" />
            <Table>
              <tbody>
                {/* 첫 번째 행 */}
                <TableRow>
                  <TableHeader rowSpan={2} className="!border-b-0 w-[120px]">
                    <Label>발신 대비<br/> 성공률(%)</Label>
                  </TableHeader>
                  <TableCell rowSpan={2} className="text-center text-sm !border-b-0">
                    {(selectedCall?.scct || 0) === 0?0:parseFloat(((selectedCall?.scct || 0)/(selectedCall?.totDialCnt || 0)*100).toFixed(1))}
                  </TableCell>
                  <TableHeader className="!bg-[#DDF4F2] w-[120px]"><Label>총발신</Label></TableHeader>
                  <TableCell className="text-center text-sm">{selectedCall?.totDialCnt || 0}</TableCell>
                  <TableHeader className="!bg-[#FEE9EC] w-[120px]"><Label>발신 시도</Label></TableHeader>
                  <TableCell className="text-center text-sm">{selectedCall?.dialingCall || 0}</TableCell>
                  <TableHeader className="!bg-[#FEE9EC] w-[120px]"><Label>발신 성공</Label></TableHeader>
                  <TableCell className="text-center text-sm">{selectedCall?.scct || 0}</TableCell>
                  <TableHeader className="!bg-[#FEE9EC] w-[120px]"><Label>발신 실패</Label></TableHeader>
                  <TableCell className="text-center text-sm">{failCnt}</TableCell>
                </TableRow>

                {/* 두 번째 행 */}
                <TableRow>
                  <TableHeader className="!bg-[#DDF4F2] w-[120px]"><Label>미발신</Label></TableHeader>
                  <TableCell className="text-center text-sm">{(selectedCall?.totLstCnt || 0)-(selectedCall?.nonTTCT || 0)}</TableCell>
                  {/* 미발신 = 총 리스트 - 순수발신 - 방지리스트 */}
                  <TableHeader className="!bg-[#FEE9EC] w-[120px]"><Label>대기리스트</Label></TableHeader>
                  <TableCell className="text-center text-sm">{(selectedCall?.totLstCnt || 0)-(selectedCall?.nonTTCT || 0) - blocklistCnt}</TableCell>
                  {/* 대기리스트 = 진행대기 + 스케줄대기 */}
                  <TableHeader className="!bg-[#FEE9EC] w-[120px]"><Label>방지리스트</Label></TableHeader>
                  <TableCell colSpan={3} className="text-sm text-center">{blocklistCnt}</TableCell>
                </TableRow>
              </tbody>
            </Table>
          </div>
          
          <div className="flex gap-5">
              <div className="w-1/2">
                <TitleWrap title="총 발신 건수" />
                <div className="flex gap-5">
                  <div className="w-1/2">
                    <Table>
                      <tbody>
                        <TableRow>
                          <TableHeader className="!bg-[#FEE9EC] w-[170px]"><Label>발신 시도</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.dialingCall||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="!bg-[#FEE9EC] w-[170px]"><Label>발신 성공</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.scct||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>대기 상담사 없음</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.overDial||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>상담사 연결</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.agentConnect||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>상담사 연결 실패</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.abct||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>상담사 무응답</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.agentNoAnswerCnt||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>상담사 통화중</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.agentBusyCnt||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>상담사 바로 끊음</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.agentDropCnt||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>고객 포기</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.customerDropCnt||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>고객 최대 대기 시간 초과</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nonServiceCnt||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>멘트 청취후 상담사 연결 안함</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.noAgentCnt||0}</TableCell>
                        </TableRow>
                      </tbody>
                    </Table>
                  </div>
                  <div className="w-1/2">
                    <Table>
                      <tbody>
                        <TableRow>
                          <TableHeader className="!bg-[#FEE9EC] w-[170px]"><Label>발신 실패</Label></TableHeader>
                          <TableCell className="text-center text-sm">{failCnt}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>통화중</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.buct||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>무응답</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nact||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>팩스/모뎀</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.fact||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>기타</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.etct||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>전화번호 오류</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.tect||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>회선 오류</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.lineStopCnt||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>고객 바로 끊음</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.customerOnHookCnt||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>통화음 없음</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.detectSilenceCnt||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>다이얼음 없음</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.dialToneSilence||0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>기계음</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.acct||0}</TableCell>
                        </TableRow>
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
              <div className="w-1/2">
                <TitleWrap title="미발신" />

                <div className="flex gap-5">
                  <div className="w-1/2">
                    <Table>
                      <tbody>
                        <TableRow>
                          <TableHeader className="!bg-[#FEE9EC] w-[170px]"><Label>대기 리스트</Label></TableHeader>
                          <TableCell className="text-center text-sm">{(selectedCall?.totLstCnt || 0)-(selectedCall?.nonTTCT || 0)-blocklistCnt}</TableCell>
                          {/* 대기리스트 = 진행대기 + 스케줄대기 */}
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>진행 대기</Label></TableHeader>
                          
                          <TableCell className="text-center text-sm">{(selectedCall?.totLstCnt || 0)-(selectedCall?.nonTTCT || 0)-(selectedCall?.nogblockTime || 0)-blocklistCnt}</TableCell>
                          {/* 진행대기 = 총리스트 - 순수발신 - 스케줄대기 */}
                          {/* {(selectedCall?.totLstCnt || 0)-(selectedCall?.scct || 0)-failCnt-(selectedCall?.recallCnt || 0)-(selectedCall?.nogblockTime || 0)-(selectedCall?.nogdeleteGL || 0)} */ }
                          
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[170px]"><Label>스케줄 대기</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogblockTime || 0}</TableCell>
                        </TableRow>
                      </tbody>
                    </Table>
                  </div>
                  <div className="w-1/2">
                    <Table>
                      <tbody>
                        <TableRow>
                          <TableHeader className="!bg-[#FEE9EC] w-[170px]"><Label>방지 리스트</Label></TableHeader>
                          <TableCell className="text-center text-sm">{blocklistCnt}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>블랙 리스트</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.blackList || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>실시간 리스트 삭제</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogdeleteGL || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>스케줄 설정 실패</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogtimeContradictory || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>콜백 타임 아웃</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogtimeOutCallback || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>팝업 후 상담사 미발신 선택</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogautoPopNotDial || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>팝업 후 발신 여부 미선택</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogautoPopNoAnswer || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>팝업 후 상담사 상태 변경</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogautoPopNoReady || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>팝업 후 상담사 모드 변경</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogautoPopFailMode || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>발신확인 전 상담사 상태 변경</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogautoDialNoReady || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>발신확인 전 상담사 모드 변경</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogautoPopFailMode || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableHeader className="w-[200px]"><Label>지정 상담사 정보 미입력</Label></TableHeader>
                          <TableCell className="text-center text-sm">{selectedCall?.nogautoNoEmployeeId || 0}</TableCell>
                        </TableRow>
                      </tbody>
                    </Table>
                  </div>
                </div>

              </div>
          </div>
      </div>
  );
};

export default GridView;