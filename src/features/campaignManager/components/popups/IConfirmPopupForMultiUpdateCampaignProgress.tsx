"use client";

import React from "react";
import CustomAlert from "@/components/shared/layout/CustomAlert";
import { Play, Pause, StopCircle, AlertCircle, CheckCircle, Info, FileText, ArrowRight } from "lucide-react";

interface CampaignInfo {
  name: string;
  status: number;
  campaign_id?: string;
}

interface ConfirmProps {
  open: boolean;
  actionKey: "start" | "complete" | "stop" | "";
  items: CampaignInfo[];
  onConfirm: () => void;
  onCancel: () => void;
}

const statusConfig = {
  start: { 
    label: "시작", 
    icon: <Play className="h-5 w-5 text-emerald-600" />, 
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-200",
    confirmBtnClass: "bg-emerald-600 hover:bg-emerald-700"
  },
  complete: { 
    label: "멈춤", 
    icon: <Pause className="h-5 w-5 text-amber-600" />, 
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-200",
    confirmBtnClass: "bg-amber-600 hover:bg-amber-700"
  },
  stop: { 
    label: "중지", 
    icon: <StopCircle className="h-5 w-5 text-rose-600" />, 
    color: "text-rose-600",
    bgColor: "bg-rose-100",
    borderColor: "border-rose-200",
    confirmBtnClass: "bg-rose-600 hover:bg-rose-700"
  },
};

const statusText = (flag?: number) => {
  switch (flag) {
    case 1:
      return {
        label: "시작",
        icon: <Play className="h-4 w-4" />,
        color: "text-emerald-600",
        bgColor: "bg-white", // 수정
      };
    case 2:
      return {
        label: "멈춤",
        icon: <Pause className="h-4 w-4" />,
        color: "text-gray-600", // 색도 회색으로 살짝 바꿔주면 더 자연스러움
        bgColor: "bg-white", // 수정
      };
    case 3:
      return {
        label: "중지",
        icon: <StopCircle className="h-4 w-4" />,
        color: "text-rose-600",
        bgColor: "bg-white", // 수정
      };
    default:
      return {
        label: "알수없음",
        icon: null,
        color: "text-gray-400",
        bgColor: "bg-white" // 수정
      };
  }
};


// 상태 변환 매핑
const getTargetStatus = (currentStatus: number, actionKey: string) => {
  if (actionKey === "start") return 1;
  if (actionKey === "complete") return 2;
  if (actionKey === "stop") return 3;
  return currentStatus;
};

export default function IConfirmPopupForMultiUpdateCampaignProgress({
  open,
  actionKey,
  items,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  if (!actionKey) return null;
  const { label, icon, color, bgColor, borderColor, confirmBtnClass } = statusConfig[actionKey];

  // 최대 10개만 미리보기, 나머지는 ... 처리
  const previewItems = items.slice(0, 10);
  const moreCount = items.length - previewItems.length;

  return (
    <CustomAlert
      isOpen={open}
      title={
        <div className={`flex items-center justify-between w-full py-1 px-1 ${borderColor}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${bgColor}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold">일괄 {label} 업데이트</h3>
            </div>
          </div>
          {/* <div className={`px-3 py-1 rounded-full ${bgColor} ${color} text-xs font-bold uppercase`}>
            {actionKey === 'start' ? 'ACTION' : actionKey === 'complete' ? 'PAUSE' : 'STOP'}
          </div> */}
        </div>
      }
      type="1"
      onClose={onConfirm}
      onCancel={onCancel}
      width="max-w-lg"
      showButtons={true}
      isShowForCancelButton={true}
      message={
        <div className="space-y-5">
          <div className="flex items-start p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="ml-3">
              <p className="text-gray-600">
                선택된 캠페인 <span className="font-bold">{items.length}</span>개에 대해
                <span className={`font-bold ${color} ml-1`}>일괄 {label}</span> 작업을 진행하시겠습니까?
              </p>
            </div>
          </div>
          
          <div className="mx-auto">
            <div className="mb-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">캠페인 목록</span>
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                총 {items.length}개 선택됨
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm divide-y divide-gray-200">
                <thead>
                  <tr className={`${bgColor} bg-opacity-30`}>
                    <th className="px-4 py-3 font-medium text-gray-700 text-center w-12">#</th>
                    <th className="px-4 py-3 font-medium text-gray-700 text-left">캠페인명</th>
                    <th className="px-4 py-3 font-medium text-gray-700 text-center">상태 변경</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {previewItems.map((info, idx) => {
                    const currentStatus = statusText(info.status);
                    const targetStatus = statusText(getTargetStatus(info.status, actionKey));
                    
                    return (
                      <tr key={info.name + idx} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-gray-500 text-center">{idx + 1}</td>
                        <td className="px-4 py-2.5 text-gray-700 text-left font-medium">{info.name}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-center gap-2">
                            {/* 현재 상태 */}
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${currentStatus.bgColor} ${currentStatus.color} text-xs font-medium`}>
                              {currentStatus.icon}
                              <span>{currentStatus.label}</span>
                            </div>
                            
                            {/* 화살표 */}
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            
                            {/* 변경될 상태 */}
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${targetStatus.bgColor} ${targetStatus.color} text-xs font-medium border border-dashed ${targetStatus.color.replace('text', 'border')}`}>
                              {targetStatus.icon}
                              <span>{targetStatus.label}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {moreCount > 0 && (
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-3 text-center text-gray-500 font-medium">
                        외 {moreCount}개 캠페인이 선택됨
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${bgColor} bg-opacity-50 flex items-center gap-3`}>
            <Info className={`h-5 w-5 ${color}`} />
            <p className="text-sm text-gray-700">
              <span className="font-medium">참고:</span> 일괄 {label} 작업은 취소할 수 없으며, 확인 후 즉시 적용됩니다.
            </p>
          </div>
          
          <div className="flex justify-end items-center space-x-4 pt-2 border-t border-gray-200 mt-4">

            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 text-sm font-medium text-white rounded-md transition-colors ${confirmBtnClass}`}
            >
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4" />
                <span className="ml-2">일괄 {label} 진행</span>
              </div>
            </button>
          </div>
        </div>
      }
    />
  );
}