// src\widgets\sidebar2\dialog\IConfirmPopupForMultiUpdateCampaignProgressToStart\comp\ITableForUpdateCamapignProgressToStart.tsxtsx
import React from "react";
import { CheckCircle, XCircle, Calendar, Clock, Phone, Users, Award, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Campaign {
  campaign_id?: string | number;
  name?: string;
  status?: number;
  [key: string]: any;
}

interface CampaignResult {
  campaignId: string;
  success: boolean;
  response?: {
    result_code: number;
    result_msg: string;
    reason_code: number;
  };
}

interface ITableForUpdateCamapignProgressToStartProps {
  items: Campaign[];
  updateCompleted: boolean;
  campaignResults: Map<string, CampaignResult>;
  scheduleMap: Map<string, any>;
  callingNumberMap: Map<string, string[]>;
  agentMap: Map<string, string[]>;
  skillMap: Map<string, { id: number, name: string }[]>;
  isLoading: boolean;
  now: Date;
}

const ITableForUpdateCamapignProgressToStart = ({
  items,
  updateCompleted,
  campaignResults,
  scheduleMap,
  callingNumberMap,
  agentMap,
  skillMap,
  isLoading,
  now
}: ITableForUpdateCamapignProgressToStartProps) => {
  // 날짜 형식 변환 함수
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return "-";
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${year}.${month}.${day}`;
  };

  // 시간 형식 변환 함수
  const formatTime = (timeArr: string[]) => {
    if (!timeArr || !timeArr.length) return "-";

    return timeArr.map(time => {
      if (!time || time.length !== 4) return time;
      const hour = time.slice(0, 2);
      const minute = time.slice(2, 4);
      return `${hour}:${minute}`;
    }).join(", ");
  };

  // 날짜 및 시간 문자열을 Date 객체로 변환
  const parseDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr || dateStr.length !== 8 || !timeStr || timeStr.length !== 4) {
      return null;
    }

    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1; // JavaScript 월은 0부터 시작
    const day = parseInt(dateStr.slice(6, 8));
    const hour = parseInt(timeStr.slice(0, 2));
    const minute = parseInt(timeStr.slice(2, 4));

    return new Date(year, month, day, hour, minute);
  };

  // 시작 시간 유효성 검사
  const isStartTimeValid = (schedule: any) => {
    if (!schedule || !schedule.start_date || !schedule.start_time || schedule.start_time.length === 0) {
      return false;
    }

    const startDateTime = parseDateTime(schedule.start_date, schedule.start_time[0]);
    if (!startDateTime) return false;

    return startDateTime <= now;
  };

  // 종료 시간 유효성 검사
  const isEndTimeValid = (schedule: any) => {
    if (!schedule || !schedule.end_date || !schedule.end_time || schedule.end_time.length === 0) {
      return false;
    }

    const endDateTime = parseDateTime(schedule.end_date, schedule.end_time[0]);
    if (!endDateTime) return false;

    return endDateTime >= now;
  };

  // 발신번호 유효성 검사
  const hasCallingNumbers = (campaignId: string) => {
    const numbers = callingNumberMap.get(campaignId);
    return numbers && numbers.length > 0;
  };

  // 상담사 유효성 검사 (상담사가 1명 이상 있는지)
  const hasAgents = (campaignId: string) => {
    const agents = agentMap.get(campaignId);
    return agents && agents.length > 0;
  };

  // 스킬 유효성 검사 (스킬이 1개 이상 있는지)
  const hasSkills = (campaignId: string) => {
    const skills = skillMap.get(campaignId);
    return skills && skills.length > 0;
  };

  // 캠페인 유효성 검사 (시작/종료 시간, 발신번호, 상담사, 스킬)
  const isCampaignValid = (schedule: any, campaignId: string) => {
    return isStartTimeValid(schedule) &&
      isEndTimeValid(schedule) &&
      hasCallingNumbers(campaignId) &&
      hasAgents(campaignId) &&
      hasSkills(campaignId);
  };

  // 결과 상태에 따른 뱃지 변형 결정
  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        성공
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
        실패
      </Badge>
    );
  };

  // 결과 코드에 따른 메시지
  const getStatusMessage = (item: CampaignResult | undefined) => {
    if (!item) return "알 수 없음";

    if (item.response && item.response.result_msg) {
      return item.response.result_msg;
    }

    return item.success ? "성공" : "실패";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>캠페인</TableHead>
            <TableHead>시작 날짜</TableHead>
            <TableHead>종료 날짜</TableHead>
            <TableHead>발신 번호</TableHead>
            <TableHead>상담사</TableHead>
            <TableHead>스킬</TableHead>
            <TableHead>유효성</TableHead>
            <TableHead>현재 상태</TableHead>
            {updateCompleted && (
              <TableHead>결과</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={updateCompleted ? 9 : 8} className="text-center py-4">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                <div className="mt-2 text-sm text-gray-500">정보를 불러오는 중...</div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => {
              const campaignId = item.campaign_id?.toString() || '';
              const result = campaignResults.get(campaignId);
              const schedule = scheduleMap.get(campaignId);
              const callingNumbers = callingNumberMap.get(campaignId) || [];
              const agents = agentMap.get(campaignId) || [];
              const skills = skillMap.get(campaignId) || [];

              const hasNumbers = callingNumbers.length > 0;
              const hasAgentsList = agents.length > 0;
              const hasSkillsList = skills.length > 0;
              const startValid = isStartTimeValid(schedule);
              const endValid = isEndTimeValid(schedule);
              const isValid = isCampaignValid(schedule, campaignId);

              return (
                <TableRow key={index}>
                  {/* 캠페인 정보 */}
                  <TableCell>
                    <div className="flex items-center">
                      <div className="font-medium">
                        {item.name}
                      </div>
                      <div className="ml-2 text-xs text-gray-500">
                        ({campaignId})
                      </div>
                    </div>
                  </TableCell>

                  {/* 시작 날짜 */}
                  <TableCell>
                    {schedule ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                              <span>{formatDate(schedule.start_date)}</span>
                              <Clock className="h-4 w-4 text-gray-500 ml-2 mr-1" />
                              <span className="text-xs">{formatTime(schedule.start_time)}</span>
                              {startValid ? (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 ml-2" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>시작 시간: {formatTime(schedule.start_time)}</p>
                            {startValid ? (
                              <p className="text-green-600 text-xs mt-1">유효: 시작 시간이 현재 시간 이전입니다.</p>
                            ) : (
                              <p className="text-red-600 text-xs mt-1">유효하지 않음: 시작 시간이 현재 시간 이후입니다.</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-gray-400 text-xs">정보 없음</span>
                    )}
                  </TableCell>

                  {/* 종료 날짜 */}
                  <TableCell>
                    {schedule ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                              <span>{formatDate(schedule.end_date)}</span>
                              <Clock className="h-4 w-4 text-gray-500 ml-2 mr-1" />
                              <span className="text-xs">{formatTime(schedule.end_time)}</span>
                              {endValid ? (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 ml-2" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>종료 시간: {formatTime(schedule.end_time)}</p>
                            {endValid ? (
                              <p className="text-green-600 text-xs mt-1">유효: 종료 시간이 현재 시간 이후입니다.</p>
                            ) : (
                              <p className="text-red-600 text-xs mt-1">유효하지 않음: 종료 시간이 현재 시간 이전입니다.</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-gray-400 text-xs">정보 없음</span>
                    )}
                  </TableCell>

                  {/* 발신 번호 */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-sm">{callingNumbers.length}개</span>
                            {hasNumbers ? (
                              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 ml-2" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasNumbers ? (
                            <div>
                              <p className="font-medium mb-1">등록된 발신번호({callingNumbers.length}개)</p>
                              <ul className="text-xs space-y-1">
                                {callingNumbers.slice(0, 5).map((number: string, idx) => (
                                  <li key={idx}>• {number}</li>
                                ))}
                                {callingNumbers.length > 5 && (
                                  <li>• 외 {callingNumbers.length - 5}개</li>
                                )}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-red-600">발신번호가 등록되지 않았습니다.</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* 상담사 */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-sm">{agents.length}명</span>
                            {hasAgentsList ? (
                              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 ml-2" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasAgentsList ? (
                            <div>
                              <p className="font-medium mb-1">등록된 상담사 ({agents.length}명)</p>
                              <ul className="text-xs space-y-1">
                                {agents.slice(0, 5).map((agent: string, idx) => (
                                  <li key={idx}>• {agent}</li>
                                ))}
                                {agents.length > 5 && (
                                  <li>• 외 {agents.length - 5}명</li>
                                )}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-red-600">등록된 상담사가 없습니다.</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* 스킬 */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <Award className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-sm">{skills.length}개</span>
                            {hasSkillsList ? (
                              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 ml-2" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasSkillsList ? (
                            <div>
                              <p className="font-medium mb-1">등록된 스킬 ({skills.length}개)</p>
                              <ul className="text-xs space-y-1">
                                {skills.slice(0, 5).map((skill, idx) => (
                                  <li key={idx}>• {skill.name}</li>
                                ))}
                                {skills.length > 5 && (
                                  <li>• 외 {skills.length - 5}개</li>
                                )}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-red-600">등록된 스킬이 없습니다.</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* 유효성 */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            {!schedule || !isValid ? (
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                유효하지 않음
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                유효함
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {schedule ? (
                            isValid ? (
                              <div>
                                <p className="text-green-600 font-medium">모든 조건 충족</p>
                                <ul className="mt-1 text-xs space-y-1">
                                  <li className="text-green-600">• 발신번호가 등록되어 있습니다.</li>
                                  <li className="text-green-600">• 상담사가 등록되어 있습니다.</li>
                                  <li className="text-green-600">• 스킬이 등록되어 있습니다.</li>
                                  <li className="text-green-600">• 시작 시간이 현재 시간 이전입니다.</li>
                                  <li className="text-green-600">• 종료 시간이 현재 시간 이후입니다.</li>
                                </ul>
                              </div>
                            ) : (
                              <div>
                                <p className="text-red-600 font-medium">일부 조건 미충족</p>
                                <ul className="mt-1 text-xs">
                                  {!hasNumbers && <li className="text-red-600">• 발신번호가 등록되지 않았습니다.</li>}
                                  {!hasAgentsList && <li className="text-red-600">• 상담사가 등록되지 않았습니다.</li>}
                                  {!hasSkillsList && <li className="text-red-600">• 스킬이 등록되지 않았습니다.</li>}
                                  {!startValid && <li className="text-red-600">• 시작 시간이 현재 시간 이후입니다.</li>}
                                  {!endValid && <li className="text-red-600">• 종료 시간이 현재 시간 이전입니다.</li>}
                                </ul>
                              </div>
                            )
                          ) : (
                            <p>캠페인 정보를 찾을 수 없습니다.</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* 현재 상태 */}
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      {item.status === 1 ? "시작" : item.status === 2 ? "대기" : item.status === 3 ? "중지" : "상태 없음"}
                    </Badge>
                  </TableCell>

                  {/* 결과 (조건부 렌더링) */}
                  {updateCompleted && (
                    <TableCell>
                      {result ? (
                        <div className="flex items-center">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          {getStatusBadge(result.success)}
                          <span className="ml-2 text-xs text-gray-600">
                            {getStatusMessage(result)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">정보 없음</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ITableForUpdateCamapignProgressToStart;